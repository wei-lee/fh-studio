App.View.DataBrowserController = Backbone.View.extend({
  events: {
    'click ul.collectionsUl li': 'showCollection',
    //TODO: This element is in a subview, can the event still be up here?
    'click .databrowsernav .dropdown-menu.collections-dropdown a' : 'onChangeCollection'
  },
  subviews : {
    collectionsList : App.View.DataBrowserCollectionsList,
    dataView: App.View.DataBrowserDataView
  },
  initialize : function(){},
  render: function() {
    var self = this;
    this.$el.empty();

    this.list = new this.subviews.collectionsList();
    this.list.render();
    this.$el.append(this.list.el);
    return this;
  },
  /*
   Add button gets pressed - setup screen with code snippets & instructions
   */
  showCollection : function(e){
    e.stopPropagation();
    var self = this,
    el = $(e.target),
    li = (e.target.nodeName.toLowerCase() === 'li' ) ? el : el.parents('li'),
    id = li.data('id'),
    model = this.list.collection.get(id);

    this.dataView = new App.View.DataBrowserDataView({ model : model, collections : this.list.collection.toJSON()  });
    this.dataView.render();
    this.list.hide();
    this.$el.append(this.dataView.el);
    //TODO: Update the model, and fetch from the server the collection contents
  },
  onChangeCollection : function(e){
    var id = $(e.target).data('id');
    this.dataView.table.collection.fetch({ reset : true, collection : id }); // TODO: Is this nasty?

  }
});