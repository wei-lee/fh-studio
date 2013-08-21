App.View.DataBrowserController = Backbone.View.extend({
  events: {
    'click ul.collectionsUl li': 'showCollection',
    //TODO: This element is in a subview, can the event still be up here?
    'click .databrowsernav .dropdown-menu.collections-dropdown a' : 'onChangeCollection'
  },
  subviews : {
    collectionsList : App.View.DataBrowserCollectionsList,
    dataView: App.View.DataBrowserDataView,
    migrateView : App.View.DataBrowserMigrateView
  },
  initialize : function(){
    var self = this,
    url = Constants.APP_HOSTS_URL
    this.guid = $fw.data.get('inst').guid;
    var params = {
      guid : this.guid
    };
    $fw.server.post(url, params, function(res) {
      self.hosts = res.hosts;
      self.loaded = true;
      if (self.el){
        self.render();
      }
    }, function(err){
      console.log(err);
    }, false);
  },
  render: function() {
    var self = this;
    this.$el.empty();
    if (this.loaded){
      var dynoHost = self.hosts['development-url'], // TODO: Switch
      collection = new DataBrowser.Collection.CollectionList({ url : dynoHost });
      collection.fetch({reset : true, success : function(){
        self.list = new self.subviews.collectionsList( { collection : collection});
        self.list.render();
        self.$el.append(self.list.el);
      }, error : function(){
        self.migrate = new self.subviews.migrateView( { guid : self.guid } );
        self.migrate.render();
        self.$el.append(self.migrate.el);
      }});
    }else{
      this.$el.append('Loading');
    }

    return this;
  },
  showCollection : function(e){
    e.stopPropagation();
    var self = this,
    dynoHost = this.hosts['development-url'], // TODO: Switch
    el = $(e.target),
    li = (e.target.nodeName.toLowerCase() === 'li' ) ? el : el.parents('li'),
    id = li.data('id'),
    model = this.list.collection.get(id);

    var dataViewCollection = new DataBrowser.Collection.CollectionData( { url : dynoHost } );
    dataViewCollection.fetch({reset : true, collection : model.get('name'), success : function(){
      self.dataView = new App.View.DataBrowserDataView({ model : model, collections : self.list.collection.toJSON(), collection : dataViewCollection  });
      self.dataView.render();
      self.list.hide();
      self.$el.append(self.dataView.el);
    }});
  },
  onChangeCollection : function(e){
    var id = $(e.target).data('id');
    this.dataView.table.model = DataBrowser.Collections.Collections.get(id);
    this.dataView.table.collection.fetch({ reset : true, collection : id }); // TODO: Is this nasty?
  }
});