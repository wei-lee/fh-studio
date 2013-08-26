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
    this.appkey = $fw.data.get('inst').apiKey;
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
      collection = new DataBrowser.Collection.CollectionList({ url : dynoHost, appkey : self.appkey });
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
    el = $(e.target),
    li = (e.target.nodeName.toLowerCase() === 'li' ) ? el : el.parents('li'),
    id = li.data('id'),
    model = this.list.collection.get(id),
    name = model.get('name');

    this.updateCollection(name, function(dataViewCollection){
      self.dataView = new App.View.DataBrowserDataView({ model : model, collections : self.list.collection.toJSON(), collection : dataViewCollection  });
      self.dataView.render();
      self.list.hide();
      self.$el.append(self.dataView.el);
    });
  },
  updateCollection : function(name, cb){
    var dynoHost = this.hosts['development-url'], // TODO: Switch
    dataViewCollection = new DataBrowser.Collection.CollectionData( { url : dynoHost, collection : name, appkey : this.appkey } );
    return dataViewCollection.fetch({reset : true, success : function(){
      cb(dataViewCollection);
    }});
  },
  onChangeCollection : function(e){
    var self = this,
    id = $(e.target).data('id');
    this.dataView.table.model = this.list.collection.get(id);

    this.updateCollection(this.dataView.table.model.get('name'), function(collection){
      self.dataView.table.collection = collection;
      self.dataView.table.render();
    });
  }
});