var App = App || {};
App.View = App.View || {};

App.View.CMSTree = App.View.CMS.extend({
  initialize: function(options){
    this.collection = options.collection;
  },


  render: function(){
    var jsonData = this.massageTree(this.collection.toJSON());
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

    return this;
  },
  massageTree : function(sections){
    var self = this,
    tree = [];

    _.each(sections, function(section, idx, list){
      var node = {
        data : section.name,
        attr : { id : section.id, hash : section.hash, path:section.path }
      },
      nodeChildren = self.massageTree(section.sections); // massage the sub-sections if they exist
      node.children = (nodeChildren && nodeChildren.length>0) ? nodeChildren : undefined;
      tree.push(node);

    });
    return tree;
  },

  "onAddSection" : function (element){
    console.log(this);
    var self = this;
    var selectedSection = self.activeSection || "root";
    var tree = self.massageTree(self.collection.toJSON());
    console.log("tree",tree);
    // when data ret from mbaas cms it will have sections and hashes but not when we create one until we push it up (which may not be immediately).
    // I think we should use a path property to indicate where this sits in the structure and then when a save is done we push any sections that do not have a hash?.
    //make new section model add it to the collection let backbone listeners do there thing?

    //show some kind of modal
    var parentSection = self.collection.findSectionByHash(selectedSection);
    var modal  = new App.View.Modal({
      title : 'Create New Section',
      body : '<input class="input-large" placeholder="Enter a Section name" id="newCollectionName">',
      okText : 'Create',
      ok : function(e){
        var el = $(e.target),
          input = el.parents('.modal').find('input'),
          val = input.val();


       //self.doCreateCollection(val);
      }
    });
    self.$el.append(modal.render().$el);
//    if(parentSection){
//      if(! parentSection["sections"]) parentSection["sections"]= [];
//
//      var section = new App.Model.CmsSection({
//        "path":section.path + section.setName(),
//        "hash": "a3b4c5d6",
//        "name" : "Waterford Stores",
//      });
//
//    }


  },

  onTreeNodeClick : function (e, data) {
    var self = this;
    var hash = data && data.rslt && data.rslt.obj && data.rslt.obj.attr && data.rslt.obj.attr('hash');
    if (!hash){
      alert('Error loading section'); // TODO: Modal
      console.log('Error finding section hash on tree node');
    }
    console.log("tree node click " + hash);
    this.trigger('sectionchange', hash)
    self.activeSection = hash;
  },
  onTreeMove : function(e, data){
    // JSTree needs to be told which attributes to retrieve - otherwise it dumps them. I kid you not.
    var treeData = data.inst.get_json(-1, ['hash']),
    newCMSCollection = this.reorderTree(treeData);
    this.collection.reset(newCMSCollection);
  },
  reorderTree : function(tree){
    var newCollection = [];
    for (var i=0; i<tree.length; i++){
      var t = tree[i];
      if (!t.attr && !t.attr.hash){
        return undefined;
      }
      var section = this.collection.findSectionByHash(t.attr.hash);
      if (!section){
        return undefined;
      }

      section.sections = (t.children && t.children.length>0) ? this.reorderTree(t.children) : [];
      if (!section.sections){
        return undefined;
      }
      newCollection.push(section);
    }

    return newCollection;
  }
});