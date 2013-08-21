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
  initialize : function(){
    var self = this,
    url = Constants.APP_HOSTS_URL;
    var params = {
      guid: $fw.data.get('inst').guid
    };
    $fw.server.post(url, params, function(res) {
      self.hosts = res.hosts;
      self.loaded = true;
    }, function(err){
      console.log(err);
    }, false);
  },
  render: function() {
    var self = this;
    this.$el.empty();
    this.list = new this.subviews.collectionsList();
    this.list.render();
    this.$el.append(this.list.el);
    return this;
  },
  showCollection : function(e){
    e.stopPropagation();
    var self = this,
    dynoHost = this.hosts['development-url'],
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