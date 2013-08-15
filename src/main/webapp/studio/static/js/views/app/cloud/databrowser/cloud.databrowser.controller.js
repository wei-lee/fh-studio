App.View.DataBrowserController = Backbone.View.extend({
  events: {
    'click ul.collectionsUl li': 'showCollection'
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
    e.preventDefault();
    e.stopPropagation();
    var self = this,
    el = $(e.target);


    this.dataView = new App.View.DataBrowserDataView();
    this.dataView.render();
    this.list.hide();
    this.$el.append(this.dataView.el);
    //TODO: Update the model, and fetch from the server the collection contents
  },
  done : function(e){
    e.preventDefault();
    this.setup.$el.remove();
    this.dashboard.show();
  },
  show : function(){
    if (this.dashboard.shown === false){
      this.setup.show();
    }


  }
});