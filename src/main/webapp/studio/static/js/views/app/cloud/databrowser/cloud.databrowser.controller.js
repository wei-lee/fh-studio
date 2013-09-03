App.View.DataBrowserController = Backbone.View.extend({
  mode : 'dev',
  events: {
    'click ul.collectionsUl li': 'showCollection',
    //TODO: This element is in a subview, can the event still be up here?
    'click .databrowsernav .dropdown-menu.collections-dropdown a' : 'onChangeCollection',
    'click .btn-migration-next' : 'onMigrateDone'
  },
  subviews : {
    collectionsList : App.View.DataBrowserCollectionsList,
    dataView: App.View.DataBrowserDataView,
    migrateView : App.View.DataBrowserMigrateView,
    errorView : App.View.DataBrowser
  },
  initialize : function(){
    var inst = this.inst = $fw.data.get('inst');
    this.guid = this.inst.guid;
    this.appkey = this.inst.apiKey;
    this.mode = $fw.data.get('cloud_environment');
    this.hasOwnDb = inst.config && inst.config.app && inst.config.app[this.mode] && inst.config.app[this.mode].hasowndb;
    // TOOD: This is just explicitly set after migrate, not reliable - why bother using this prop? Just interrogate pacakge.json using the file APIs available to us..
    this.wrapper = inst.config && inst.config.appcloud && inst.config.appcloud.wrapper && inst.config.appcloud.wrapper.module || 'fh-nodeapp';
    this.getHosts();
  },
  // Typically gets called twice - a second time when getHosts is finished
  render: function() {
    var self = this;
    this.$el.empty();


    // Do we need to migrate?
    if (!this.hasOwnDb){
      self.migrate = new self.subviews.migrateView( { guid : self.guid, mode : this.mode } );
      self.migrate.render();
      self.$el.append(self.migrate.el);
    // Do we need to upgrade from nodeapp to webapp?
    }else if (this.wrapper !== 'fh-webapp'){
    // This may never trigger. once the migration is done, this.wrapper is set to fh-webapp even if the user never did so..
      var tpl = $('#dataviewPackageJsonChange').html();
      tpl = Handlebars.compile(tpl);
      var messageView = new App.View.DataBrowserMessageView({ message : tpl(), button : 'Done!', cb : function(e){
        //TODO: We need to set $fw.data.set appcloud.wrapper here I think? That or parse it from package.json - otherwise this screen will appear right back again
        self.render();
      }});
      self.$el.append(messageView.render().$el);

    }else if (this.loaded){
      var dynoHost = (this.mode==='dev') ? self.hosts['development-url'] : self.hosts['live-url'],
      collection = new DataBrowser.Collection.CollectionList({ url : dynoHost, appkey : self.appkey, mode : this.mode });
      collection.fetch({reset : true, success : function(){
        self.list = new self.subviews.collectionsList( { collection : collection});
        self.list.render();
        self.$el.append(self.list.el);
        // Property which tells parent controllers not to re-draw this page, as it's now doing something useful - not just a 'migrate' message
        self.browsing = true;
      }, error : function(){
        var messageView = new App.View.DataBrowserMessageView({ message : 'There was an issue loading the databrowser. Is your cloud app running?', button : 'Try again', cb : function(e){
          self.getHosts();
        }});
        self.$el.append(messageView.render().$el);
      }});
    }else{
      self.$el.append('Loading');
    }

    return this;
  },
  getHosts : function(){
    var self = this,
    params = {
      guid : this.guid
    },
    url = Constants.APP_HOSTS_URL;
    $fw.server.post(url, params, function(res) {
      self.hosts = res.hosts;
      self.loaded = true;
      if (self.el && self.hasOwnDb && self.wrapper === 'fh-webapp'){
        self.render();
      }
    }, function(err){
      console.log(err);
    }, false);
  },
  showCollection : function(e){
    e.stopPropagation();
    var self = this,
    el = $(e.target),
    li = (e.target.nodeName.toLowerCase() === 'li' ) ? el : el.parents('li'),
    id = li.data('id'),
    model = this.list.collection.get(id);

    this.updateCollection(model, function(dataViewCollection){
      self.dataView = new App.View.DataBrowserDataView({ model : model, collections : self.list.collection.toJSON(), collection : dataViewCollection});
      self.dataView.render();
      self.list.hide();
      self.$el.append(self.dataView.el);
    });
  },
  updateCollection : function(model, cb){
    var dynoHost = (this.mode === 'dev') ? this.hosts['development-url'] : this.hosts['live-url'], // TODO: Switch
    name = model.get('name'),
    count = model.get('count'),
    dataViewCollection = new DataBrowser.Collection.CollectionData( { url : dynoHost, collection : name, appkey : this.appkey, count : count } );
    return dataViewCollection.fetch({reset : true, success : function(){
      cb(dataViewCollection);
    }});
  },
  onChangeCollection : function(e){
    var self = this,
    el = $(e.target),
    id = el.data('id');
    this.dataView.table.model = this.list.collection.get(id);

    this.updateCollection(this.dataView.table.model, function(collection){
      self.dataView.table.collection = collection;
      self.dataView.table.render();
    });
    el.parents('.dropdown.open').removeClass('open');
  },
  onMigrateDone : function(){
    this.$el.empty();
    var tpl = $('#dataviewGoDeploy').html();
    tpl = Handlebars.compile(tpl);
    var messageView = new App.View.DataBrowserMessageView({ message : tpl(), button : 'Deploy &raquo;', cb : function(e){
      // Jump to the deploy page
      $('a[data-controller="apps.deploy.controller"]').trigger("click");
    }});
    this.$el.append(messageView.render().$el);
  }
});