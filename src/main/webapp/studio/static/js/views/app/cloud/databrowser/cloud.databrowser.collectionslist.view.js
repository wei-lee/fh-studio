App.View.DataBrowserCollectionsList = App.View.DataBrowserView.extend({
  templates : {
    collectionsList: '#collectionsList',
    collectionsListItem : '#collectionsListItem',
    databrowserNavbar : '#databrowserNavbar'
  },
  initialize : function(){
    this.collection = DataBrowser.Collections.Collections;
    this.collection.bind('reset', this.render, this);
    this.compileTemplates();
    this.breadcrumb(['Cloud Plugins']);
  },
  render: function() {
    var nav = this.templates.$databrowserNavbar({ brand : 'Collections', class : 'collectionsnavbar', baritems : '' });

    this.$el.empty();
    this.$el.append(nav);

    this.renderCollections();
    return this;
  },
  renderCollections : function(){
    var self = this,
    collectionItems = [],
    body, collectionItem;

    this.collection.each(function(model){
      var jsonModel = model.toJSON();
      jsonModel.id = model.id;
      collectionItem = self.templates.$collectionsListItem( jsonModel );
      collectionItems.push(collectionItem);
    });

    body = $(this.templates.$collectionsList({ collections : collectionItems.join('') }));
    this.$el.append(body);
  },
  hide : function(){
    this.$el.hide();
    this.shown = false;
  },
  show : function(){
    this.$el.show();
    this.shown = true;
  }
});