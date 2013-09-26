var App = App || {};
App.View = App.View || {};

App.View.CMSTree = App.View.CMS.extend({
  initialize: function(options){
    this.collection = options.collection;
  },


  render: function(){
    var jsonData = this.massageTree(this.collection.toJSON());
    console.log("jsonData ", jsonData);
    var self = this;
    this.$el.jstree({
      "json_data" : {
        "data" : jsonData
      },
      'core': {
        initially_open: ['root'],
        animation: 0
      },
      'themes': {
        theme: 'classic',
        loaded: true
      },
      "crrm" : {
        "move" : {
          "default_position" : "first",
          "check_move" : function (m) { return (m.o[0].id === "thtml_1") ? false : true;  }
        }
      },
      'plugins': ['themes', 'json_data', 'ui', 'cookies', 'crrm', 'dnd']
    }).bind("select_node.jstree", $.proxy(this.onTreeNodeClick, this))
    .bind('move_node.jstree', $.proxy(this.onTreeMove, this));


    $('.btn-addsection').bind("click",function (e){
      self.onAddSection(this);
    });
    $('.btn-deletesection').bind("click", function (e){
       self.onDeleteSection(this);
    });

    return this;
  },
  massageTree : function(sections){
    var self = this,
    tree = [];

    console.log("sections ", sections);

    _.each(sections, function(section, idx, list){

      if(section.path.split(".").length === 1){
        tree.push(explodeSection(section));
      }
    });

    function explodeSection(section){
      var node = {
        data : section.name,
        attr : { id : section.id, hash : section.hash, path : section.path }
      };
      if(section && section.children){
        node.children = [];
        _.each(section.children,function (secChild){
          var cSection = self.collection.findSectionByHash(secChild);
          node.children.push(explodeSection(cSection));
        });
      }
      return node;
    }
    return tree;
  },

  "onDeleteSection": function (e){
    var self = this;
    var del=confirm("Are you sure you wish delete " + self.activeSection);
    if (del==true){
      console.log("deleting " + self.activeSection);
      self.deleteSection(self.activeSection);
    }else{
      console.log("not deleting section");
    }
  },

  "onAddSection" : function (element){

    var self = this;

    // when data ret from mbaas cms it will have sections and hashes but not when we create one until we push it up (which may not be immediately).
    // I think we should use a path property to indicate where this sits in the structure and then when a save is done we push any sections that do not have a hash?.
    //make new section model add it to the collection let backbone listeners do there thing?


    var modal  = new App.View.Modal({
      title : 'Create New Section',
      body : '<input class="input-large" placeholder="Enter a Section name" id="newCollectionName">',
      okText : 'Create',
      ok : function(e){
        var el = $(e.target),
          input = el.parents('.modal').find('input'),
          val = input.val();


       self.createSection(val);
      }
    });
    self.$el.append(modal.render().$el);

  },
  //move to fh.cms
  deleteSection : function (val){
    var self = this;
    var selectedSection = self.activeSection || "root";
    //show some kind of modal
    var parentSection = self.collection.removeBySectionPath(selectedSection);


  },

  //move to fh.cms
  createSection : function (val){
    var self = this;
    var selectedSection = self.activeSection || "root";
    //show some kind of modal
    var parentSection = self.collection.findSectionByPath(selectedSection);

    if(parentSection){
      if(! parentSection["sections"]) parentSection["sections"]= [];

      var path = (parentSection.path === "") ? val : parentSection.path + "." + val,
      node = {
        "path": path,
        "hash": "a3b4c5d6",
        "name" : val,
        "data":val,
        "parent":parentSection.name
      };

    }
    parentSection["sections"].push(node);
    self.render();
  },

  onTreeNodeClick : function (e, data) {
    var self = this;
    var path = data && data.rslt && data.rslt.obj && data.rslt.obj.attr && data.rslt.obj.attr('path');
    if (!path){
      alert('Error loading section'); // TODO: Modal
      console.log('Error finding section path on tree node');
    }
    this.trigger('sectionchange', path);
    console.log("tree node click " + path);
    self.activeSection = path;
  },
  onTreeMove : function(e, data){
    console.log("move data", data);
    // JSTree needs to be told which attributes to retrieve - otherwise it dumps them. I kid you not.
    var treeData = data.inst.get_json(-1, ['hash', 'path', 'parent']),
    newCMSCollection = this.reorderTree(treeData);
    newCMSCollection = this.collection.addPathsAndChildren(newCMSCollection); //TODO: Reset should do this automatically?
    this.collection.reset(newCMSCollection);
  },
  reorderTree : function(tree){
    console.log("the tree ", tree);
    var newCollection = [];
    for (var i=0; i<tree.length; i++){
      var t = tree[i];
      if (!t.attr || !t.attr.path){
        return undefined;
      }
      //t currently is a root node.
      if(t.attr.path.split(".").length > 1){
        t.attr.path = t.attr.name;
      }

      if(t.children && t.children.length > 0){
        for(var ch=0; ch < t.children.length; ch++){
          addPath(t.children[ch]);
        }
      }



      function addPath(parent){
        debugger;
        if(parent.children && parent.children.length > 0){
          for(var ck =0; ck < parent.children.length; ck++){
            parent.children[ck].attr.path = parent.attr.name + "." + parent.children[ck].attr.name;
            if(parent.children[ck].children && parent.children[ck].children.length > 0){
              addPath(parent.children[ck]);
            }
          }
        }
      }


//      var section = this.collection.findSectionByPath(t.attr.path);
//      if (!section){
//        return undefined;
//      }
//
//      function getChildHashes(children) {
//        var ret = [];
//        for(var r=0; r < children.length; r++){
//          ret.push(children[r].hash);
//        }
//      }
//
//      section.children = (t.children && t.children.length>0) ? getChildHashes(t.children) : [];
//      if (!section.sections){
//        section.sections = undefined;
//      }
//      newCollection.push(section);
    }
    console.log("repathed tree", tree);
    return tree;
//    return newCollection;
  }
});