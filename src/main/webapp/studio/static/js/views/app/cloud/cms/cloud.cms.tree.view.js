var App = App || {};
App.View = App.View || {};


App.View.CMSTree = App.View.CMS.extend({

  'events': {

  },

  initialize: function (options) {
    var self = this;
    this.collection = options.collection;
    this.collection.on("change", function () {
      console.log("a model was added this is where we would add a call to the server to a que of changes ", "calling render");
      self.render();
    });
    this.collection.on("add", function (){
       console.log(" a model was added to the collection ");
      self.render();
    });
    this.collection.on("remove", function (m){

       console.log("a model was removed from the collection ", m);
      self.render();
    });

    App.dispatch.on("cms.sectionchange", function (evData){
      //update the tree somehow.
        console.log(evData);
      //need to go through the levels opening as we go.
      var treePath = evData.path;
      console.log("treepath",treePath);
      var pathBits = treePath.split(".");


      var path ="";
      var ref="";
      for(var i = 0; i < pathBits.length; i++){
        path+=pathBits[i].trim();

        console.log("path to open is " + path);
         ref = $.jstree._reference("#" + path);
        if(ref){
          ref.deselect_all();
          console.log("found ref performing action");
          ref.open_node("#"+path);

        }
      }
      if(ref){
        ref.select_node("#"+path);
      }
      $("#"+path).trigger("click");
    });

  },

  render: function () {
    var jsonData = this.massageTree(this.collection.toJSON());

    console.log("jsonData ", jsonData);
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
      console.log("IN EACH SECTION SECTION NO # ", idx);
      if (section.path.split(".").length === 1) {
        var exploded = explodeSection(section);
        console.log("exploded section ", exploded);
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
    var del = confirm("Are you sure you wish delete " + self.activeSection);
    if (del == true) {
      console.log("deleting " + self.activeSection);
      self.deleteSection(self.activeSection);
    } else {
      console.log("not deleting section");
    }
  },

  "onAddSection": function (element) {

    var self = this;

    var modal = new App.View.Modal({
      title: 'Create New Section',
      body: '<input class="input-large" placeholder="Enter a Section name" id="newCollectionName">',
      okText: 'Create',
      ok: function (e) {
        var el = $(e.target),
          input = el.parents('.modal').find('input'),
          val = input.val();
        self.createSection(val);
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

    }
    parentSection[childrenKey].push(node.hash);
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


  },


  onTreeNodeClick: function (e, data) {
    console.log("on tree node click");
    var self = this;
    var path = data && data.rslt && data.rslt.obj && data.rslt.obj.attr && data.rslt.obj.attr('path');
    if (!path) {
      alert('Error loading section'); // TODO: Modal
      console.log('Error finding section path on tree node');
    }
    this.trigger('sectionchange', path);
    App.dispatch.trigger("cms.sectionclick",{"path":path});
    self.activeSection = path;
  },
  onTreeMove: function (e, data) {
    console.log("move data", data);
    // JSTree needs to be told which attributes to retrieve - otherwise it dumps them. I kid you not.
    var treeData = data.inst.get_json(-1, ['hash', 'path', 'parent']),
      newCMSCollection = this.reorderTree(treeData);
    newCMSCollection = this.collection.addPathsAndChildren(newCMSCollection); //TODO: Reset should do this automatically?
    this.collection.reset(newCMSCollection);
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