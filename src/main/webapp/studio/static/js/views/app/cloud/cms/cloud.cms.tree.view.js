var App = App || {};
App.View = App.View || {};


App.View.CMSTree = App.View.CMS.extend({

  'events': {

  },

  'templates':{
      'cms_sectionDropDown' : '#cms_sectionDropDown'
  },
  initialize: function (options) {
    var self = this;
    this.collection = options.collection;
    this.collection.on("change", function () {
      self.render();
    });
    this.collection.on("add", function (){
      self.render();
    });
    this.collection.on("remove", function (m){
      self.render();
    });

    App.dispatch.on("cms.sectionchange", function (evData){
      //update the tree somehow.
      //need to go through the levels opening as we go.
      var treePath = evData.path;
      var pathBits = treePath.split(".");
      var path ="";
      var ref="";
      for(var i = 0; i < pathBits.length; i++){
        path+=pathBits[i].trim();

         ref = $.jstree._reference("#" + path);
        if(ref){
          ref.deselect_all();
          ref.open_node("#"+path);

        }
      }
      if(ref){
        ref.select_node("#"+path);
      }
      $("#"+path).trigger("click");
    });
    this.compileTemplates();

  },

  render: function () {
    var jsonData = this.massageTree(this.collection.toJSON());

    console.log("RENDER CALLED jsonData ", jsonData);
    var self = this;
    self.tree = this.$el.jstree({
      "json_data": {
        "data": jsonData
      },
      'core': {
        initially_open: ['root'],
        animation: 0
      },
      'themes': {
        theme: 'classic',
        loaded: true
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
    self.tree.unbind("select_node.jstree, move_node.jstree, create.jstree","blur");
    self.tree.bind("select_node.jstree", $.proxy(this.onTreeNodeClick, this));
    self.tree.bind('move_node.jstree', $.proxy(this.onTreeMove, this));
    self.tree.bind("open_node.jstree", function (e, data) {

    });

    $('.btn-addsection').unbind().bind("click", function (e) {
      self.onAddSection(this);
    });
    $('.btn-deletesection').unbind().bind("click", function (e) {
      self.onDeleteSection(this);
    });

    return this;
  },
  massageTree: function (sections) {
    var id = 0;
    var self = this,
      tree = [];

    _.each(sections, function (section, idx, list) {

      if (section.path.split(".").length === 1) {
        var exploded = explodeSection(section);
        tree.push(exploded);
      }
    });

    function explodeSection(section) {
      console.log("IN EXPLODE SECTION", sections);
      var node = {
        data: section.name,
        attr: { id: section.path.replace(/\s+/g,'').replace(/\.+/g,''), hash: section.hash, path: section.path },
        "children": []
      };
      if (section && section.children) {
        node.children = [];
        _.each(section.children, function (secChild, idx) {
          console.log("Exploding section");
          var cSection = self.collection.findSectionByHash(secChild);
          if(cSection){
            node.children.push(explodeSection(cSection));
          }
        });
      }
       id++;
      return node;
    }

    return tree;
  },

  "onDeleteSection": function (e) {
    var self = this;
    var modal = new App.View.Modal({
      title: 'Confirm Delete',
      body: "Are you sure you wish delete " + self.activeSection,
      okText: 'Delete',
      cancelText : 'Cancel',
      ok: function (e) {
        console.log("deleting " + self.activeSection);
        self.deleteSection(self.activeSection);
      }
    });
    self.$el.append(modal.render().$el);
  },

  "onAddSection": function (element) {

    var self = this;
    var parentOptions = self.collection.toHTMLOptions();
    parentOptions = ["<option value='' data-path='' >-Root</option>"].concat(parentOptions);
    parentOptions = parentOptions.join('');
    var selectContent = self.templates.$cms_sectionDropDown({"parentOptions":parentOptions});

    console.log(selectContent);
    var modal = new App.View.Modal({
      title: 'Create New Section',
      body: '<input class="input-large" placeholder="Enter a Section name" id="newCollectionName"> <br/> ' + selectContent,
      okText: 'Create',
      ok: function (e) {
        var el = $(e.target),
          input = el.parents('.modal').find('input#newCollectionName'),
          sectionIn = el.parents('.modal').find("select[name='parentName']").find('option').filter(":selected").val(),
          secVal = input.val();

        console.log("Section parent section name ", secVal, sectionIn);
        self.activeSection = sectionIn;
        self.createSection(secVal);
      }
    });
    self.$el.append(modal.render().$el);

  },

  //move to fh.cms
  createSection: function (val) {
    var self = this;
    var selectedSection = self.activeSection || "root";

    console.log("Create Section");

    var parentSection = self.collection.findSectionByPath(selectedSection);
    if (!parentSection){
      console.log('Couldnt find parent section with path ' + selectedSection);
      return this.modal('Error moving section');
    }

    console.log("parent section is ", parentSection);
    var childrenKey = App.Model.CmsSection.CONST.CHILDREN;
    var hash = new Date().getTime();
    if (parentSection) {
      if (!parentSection[childrenKey]) parentSection[childrenKey] = [];

      var path = (parentSection.path === "") ? val : parentSection.path + "." + val,
        node = {
          "path": path,
          "hash": hash,
          "name": val,
          "data": val,
          "children": []
        };

      parentSection[childrenKey].push(node.hash);
    }

    console.log("models ",self.collection.models);
    var model = new App.Model.CmsSection(node);
    self.collection.push(model);
    self.$el.jstree("unset_focus");
  },
  //move to fh.cms
  deleteSection: function (val) {
    var self = this;
    var selectedSection = self.activeSection || "root";
    //show some kind of modal
    self.collection.removeBySectionPath(selectedSection);

    self.render();
    $('.fb-response-fields').empty();


  },


  onTreeNodeClick: function (e, data) {
    console.log("on tree node click");
    var self = this;
    var path = data && data.rslt && data.rslt.obj && data.rslt.obj.attr && data.rslt.obj.attr('path');
    if (!path) {
      console.log('Error finding section path on tree node');
      return this.modal('Error loading section');
    }
    this.trigger('sectionchange', path);
    App.dispatch.trigger("cms.sectionclick",{"path":path.replace(/\s+/g,'')});
    self.activeSection = path;
  },

  //TODO major todo add tests around this logic.

  onTreeMove: function (e, data) {
    var self = this;
    console.log("move data", data);
    // JSTree needs to be told which attributes to retrieve - otherwise it dumps them. I kid you not.

    var treeData = data.inst.get_json(-1, ['name','hash', 'path', 'children']);
    //need to update the models in the collection to reflect the new state then recall render.
    // we have two different data structures that contain the same data we need to sync them.
    function findInData(treeData,hash, path){
      for(var k=0; k < treeData.length; k++){
        var treeOb = treeData[k];
        path = treeData[k]["data"];
        if(hash == treeOb.attr['hash']){
          treeOb.attr["path"] = path;
          return treeOb;
        }
        else if(treeOb.children && treeOb.children.length > 0){
         treeOb =  findInData(treeOb.children,hash,path);
          if(treeOb) return treeOb;
        }
      }
    }

    function resetPaths(treeData){
      for(var k=0; k < treeData.length; k++){
        var treeOb = treeData[k];
        var model = self.collection.findWhere({"hash":treeOb.attr["hash"]});
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
            chModel = self.collection.findWhere({"hash":ch[i]});
            var updatePath = currentPath + "." + chModel.get("name");
            setPath(chModel, updatePath);
          }
        }
      }
    }

    var models =  self.collection.models;
    for(var td=0; td < models.length; td++){
      var model = models[td];
      var syncTo = findInData(treeData, model.get("hash"));
      syncTo.children = syncTo.children || [];
      model.attributes.children = [];
      for(var cid=0; cid < syncTo.children.length; cid++){
        model.attributes.children.push(syncTo.children[cid]["attr"]["hash"]);
      }
    }
    resetPaths(treeData);

    console.log("DONE MOVE ******************** ",self.collection.models);

    self.render();

  },
  reorderTree: function (tree) {
    console.log("the tree ", tree);
    var newCollection = [];
    for (var i = 0; i < tree.length; i++) {
      var t = tree[i];
      if (!t.attr || !t.attr.path) {
        return undefined;
      }
      //t currently is a root node.
      if (t.attr.path.split(".").length > 1) {
        t.attr.path = t.attr.name;
      }

      if (t.children && t.children.length > 0) {
        for (var ch = 0; ch < t.children.length; ch++) {
          addPath(t.children[ch]);
        }
      }


      function addPath(parent) {
        debugger;
        if (parent.children && parent.children.length > 0) {
          for (var ck = 0; ck < parent.children.length; ck++) {
            parent.children[ck].attr.path = parent.attr.name + "." + parent.children[ck].attr.name;
            if (parent.children[ck].children && parent.children[ck].children.length > 0) {
              addPath(parent.children[ck]);
            }
          }
        }
      }
    }
    console.log("repathed tree", tree);
    return tree;
//    return newCollection;
  }
});