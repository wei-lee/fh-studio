var App = App || {};
App.View = App.View || {};

App.View.CMSTree = App.View.CMS.extend({
  initialize: function(options){
    this.collection = options.collection;
  },
  render: function(){
    var jsonData = this.massageTree(this.collection.toJSON());
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
    return this;
  },
  massageTree : function(sections){
    var self = this,
    tree = [];

    _.each(sections, function(section, idx, list){
      var node = {
        data : section.name,
        attr : { id : section.id, hash : section.hash, path : section.path, parent : section.parent }
      },
      nodeChildren = self.massageTree(section.sections); // massage the sub-sections if they exist
      node.children = (nodeChildren && nodeChildren.length>0) ? nodeChildren : undefined;
      tree.push(node);

    });
    return tree;
  },
  onTreeNodeClick : function (e, data) {
    var path = data && data.rslt && data.rslt.obj && data.rslt.obj.attr && data.rslt.obj.attr('path');
    if (!path){
      alert('Error loading section'); // TODO: Modal
      console.log('Error finding section path on tree node');
    }
    this.trigger('sectionchange', path);
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
      if (!t.attr && !t.attr.path){
        return undefined;
      }
      var section = this.collection.findSectionByPath(t.attr.path);
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