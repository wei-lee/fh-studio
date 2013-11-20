App = App || {};
App.View = App.View || {};

App.View.CMSTree = App.View.CMS.extend({
  initialize: function (options) {
    var self = this;
    this.collection = options.collection;

    this.collection.on("add", function (){
      self.render();
    });
    this.collection.on("remove", function (m){
      self.render();
    });

    this.section = options.section;

    App.dispatch.on(CMS_TOPICS.SECTION_SAVE_DRAFT, function (data){
      console.log("save draft event ", data);
      $('.jstree-clicked').removeClass().addClass("jstree-clicked").addClass("jstree-published");
    });

    App.dispatch.on(CMS_TOPICS.SECTION_DISCARD_DRAFT, function (data){
      console.log("discard draft event ", data);
      var jstreeClicked = $('.jstree-clicked');
      console.log("jstree clicked ", jstreeClicked);
      jstreeClicked.removeClass().addClass("jstree-clicked");
    });

    App.dispatch.on(CMS_TOPICS.SECTION_PUBLISH,function (data){
       console.log("cms.sectionpublish ", data);
       var status = data.status || 'published';
      //TODO need to know if it is a publish later or not.
      $('.jstree-clicked').removeClass().addClass("jstree-clicked").addClass("jstree-" + status);
    });

    App.dispatch.on(CMS_TOPICS.SECTION_DIRTIED, function (data){
      console.log("cms.section.unsaved ", data);
      $('.jstree-clicked').removeClass().addClass("jstree-clicked").addClass("jstree-unsaved");
    });

  },

  render: function () {
    var jsonData = this.massageTree(this.collection.toJSON());
    console.log("json data ", jsonData);

    var self = this;
    self.treenode = this.$el.unbind("loaded.jstree").bind("loaded.jstree", function (event, data) {
      $(this).jstree("open_all");
    }).jstree({
      "json_data": {
        "data": jsonData
      },
      'core': {
        animation: 0
      },
      'themes': {
        theme: 'classic',
        loaded: true
      },
      "ui" : {
        "initially_select" : []
      },

      "crrm": {
        "move": {
          "default_position": "first",
          "check_move": function (m) {
            return (m.o[0].id === "thtml_1") ? false : true;
          }
        }
      },
      'plugins': ['themes', 'json_data', 'ui', 'cookies', 'crrm', 'dnd']
    });
    self.treenode.unbind("reselect.jstree, select_node.jstree, move_node.jstree, create.jstree","blur");


    // Set the initially selected node in the reselect callback because JSTree is a mess
    self.treenode.bind("reselect.jstree", function(){
      self.treenode.unbind("select_node.jstree");
      self.treenode.jstree('deselect_all');
      var node = self.treenode.jstree("select_node", '#' + self.section);
      if (node){
        node.trigger("select_node.jstree");
      }
      self.treenode.bind("select_node.jstree", $.proxy(self.onTreeNodeClick, self));
    });

    self.treenode.bind('move_node.jstree', $.proxy(this.onTreeMove, this));
    self.treenode.bind("open_node.jstree", function (e, data) {});

    return this;
  },
  massageTree: function (sections) {
    var id = 0;
    var self = this,
      tree = [];

    _.each(sections, function (section, idx, list) {
      section.path = section.path || section;
      if (section.path.split(".").length === 1) {
        var exploded = explodeSection(section);
        tree.push(exploded);
      }
    });

    function explodeSection(section) {
      var status = section.status || 'published';
      var node = {
        data: {
          attr : {
            "class" : 'jstree-' + status
          },
          title : section.name
        },
        attr: { id: section._id, hash: section.hash, _id : section._id, path: section.path, status : section.status || 'published' },
        "children": []
      };
      if (section && section.children) {
        node.children = [];
        _.each(section.children, function (childId, idx) {
          var cSection = self.collection.findWhere({_id : childId});
          if(cSection){
            cSection = cSection.toJSON();
            node.children.push(explodeSection(cSection));
          }
        });
      }
       id++;
      return node;
    }

    return tree;
  },
  onTreeNodeClick: function (e, data) {
    var self = this,
    _id = data && data.rslt && data.rslt.obj && data.rslt.obj.attr && data.rslt.obj.attr('_id');
    var ok = function (e) {
      self.navigateTo(_id);
    };
    this.trigger('cms-checkUnsaved', ok);
  },
  navigateTo : function(_id){
    if (!_id) {
      console.log('Error finding section path on tree node');
      return this.modal('Error loading section');
    }
    this.trigger('sectionchange', _id);
  },

  //TODO major todo add tests around this logic.

  onTreeMove: function (e, data) {
    var self = this;
    console.log("move data", data);
    // JSTree needs to be told which attributes to retrieve - otherwise it dumps them. I kid you not.

    var treeData = data.inst.get_json(-1, ['name','hash', 'path', 'children', '_id']);
    //need to update the models in the collection to reflect the new state then recall render.
    // we have two different data structures that contain the same data we need to sync them.
    function findInData(treeData,_id, path){
      for(var k=0; k < treeData.length; k++){
        var treeOb = treeData[k];
        path = treeData[k]["data"];
        if(_id == treeOb.attr['_id']){
          treeOb.attr["path"] = path;
          return treeOb;
        }
        else if(treeOb.children && treeOb.children.length > 0){
         treeOb =  findInData(treeOb.children,_id,path);
          if(treeOb) return treeOb;
        }
      }
    }

    function resetPaths(treeData){
      for(var k=0; k < treeData.length; k++){
        var treeOb = treeData[k];
        var model = self.collection.findWhere({"_id":treeOb.attr["_id"]});
        if(model){
          setPath(model,treeOb["data"]);
        }
      }

      function setPath(model,currentPath){
        model.set({"path":currentPath});
        if(model.get("children")){
          var ch = model.get("children");
          var chModel;
          for(var i=0; i < ch.length; ch++){
            chModel = self.collection.findWhere({"_id":ch[i]});
            var updatePath = currentPath + "." + chModel.get("name");
            setPath(chModel, updatePath);
          }
        }
      }
    }

    var models =  self.collection.models;
    for(var td=0; td < models.length; td++){
      var model = models[td];
      var syncTo = findInData(treeData, model.get("_id"));
      syncTo.children = syncTo.children || [];
      model.attributes.children = [];
      for(var cid=0; cid < syncTo.children.length; cid++){
        model.attributes.children.push(syncTo.children[cid]["attr"]["_id"]);
      }
    }
    resetPaths(treeData);

    self.render();

  }
});
