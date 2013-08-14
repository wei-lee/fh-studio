App.View.DataBrowserCollectionsList = App.View.DataBrowserView.extend({
  templates : {
    collectionsList: '#collectionsList',
    collectionsListItem : '#collectionsListItem',
    databrowserNavbar : '#databrowserNavbar'
  },
  initialize : function(){
    this.collection = DataBrowser.Collections.Collections;
    this.collection.bind('reset', this.render, this);
    this.collection.bind('redraw', this.renderCollections);
    this.compileTemplates();
    this.breadcrumb(['Cloud Plugins']);
  },
  render: function() {
    this.renderCollections();
    return this;
  },
  renderCollections : function(){
    var self = this,
    nav = this.templates.$databrowserNavbar({ brand : 'Collections', class : 'collectionsnavbar', baritems : '' }),
    collectionItems = [],
    body, collectionItem;

    this.$el.empty();
    this.$el.append(nav);

    this.collection.each(function(){
      collectionItem = self.templates.$collectionsListItem( { name : 'Users', records : 124, size: '12.5' });
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