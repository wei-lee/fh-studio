App.View.DataBrowserController = Backbone.View.extend({
  mode : 'dev',
  events: {
    'click ul.collectionsUl li': 'showCollection',
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
    var self = this,
    inst = this.inst = $fw.data.get('inst');
    this.userApiKey = $fw.data.get("userapikey");
    this.guid = this.inst.guid;
    this.appkey = this.inst.apiKey;

    this.mode = $fw.data.get('cloud_environment');
    this.bind('loaded', this.showCollectionsListing);

    async.series([$.proxy(this.getHosts, this), $.proxy(this.getCollectionsListing, this)], function(err, res){
      self.$el.removeClass('busy');
      // Delay before doing anything else to give animation chance to finish
      setTimeout(function(){
        if (err || res.length !== 2){
          return self.renderError(err);
        }
        var collection = res[1];
        self.loaded = true;
        self.trigger('loaded', collection);
      }, 500);
    });

  },
  // Typically gets called twice - a second time when getHosts is finished
  render: function(page) {
    var self = this;
    this.$el.empty();

    // Do we need to migrate?
    if (this.needsMigrate()){
      this.showMigrateView();
    // Do we need to upgrade from nodeapp to webapp?
    }else if (!this.hasCorrectWrapper()){
      this.showWrapperChangeInstructions();
    }else{
      self.$el.addClass('busy');
      var tpl = Handlebars.compile($('#databrowserLoading').html());
      self.$el.append(tpl());
    }
    return this;
  },
  renderError : function(err){
    var self = this;
    var messageView = new App.View.DataBrowserMessageView({ message : 'There was an issue loading the databrowser. Is your cloud app running?', button : 'Try again', cb : function(e){
      self.initialize();
      self.render();
    }});
    self.$el.append(messageView.render().$el);
  },
  getHosts : function(cb){
    var self = this,
    params = {
      guid : this.guid
    },
    url = Constants.APP_HOSTS_URL;
    $fw.server.post(url, params, function(res) {
      self.hosts = res.hosts;
      return cb(null, res);
    }, function(err){
      console.log(err);
      return cb(err);
    }, false);
  },
  getCollectionsListing : function(cb){
    var dynoHost = (this.mode==='dev') ? this.hosts['development-url'] : this.hosts['live-url'];
    var collection = new DataBrowser.Collection.CollectionList({ url : dynoHost, appkey : this.appkey, mode : this.mode, "userApiKey":this.userApiKey});

    collection.fetch({reset : true, success : function(){
      return cb(null, collection);
    }, error : function(err){
      return cb(err);
    }});
  },
  showMigrateView : function(){
    this.migrate = new this.subviews.migrateView( { guid : this.guid, mode : this.mode } );
    this.migrate.render();
    this.$el.append(this.migrate.el);
  },
  showWrapperChangeInstructions : function(){
    var self = this,
    tpl = $('#dataviewPackageJsonChange').html();
    tpl = Handlebars.compile(tpl);

    var messageView = new App.View.DataBrowserMessageView({ message : tpl(), button : 'Deploy &raquo;', cb : function(e){
      $('a[data-controller="apps.deploy.controller"]').trigger("click");
    }});
    self.$el.append(messageView.render().$el);
  },
  showCollectionsListing : function(collection){
    this.$el.empty();
    var self =  this;
    self.list = new self.subviews.collectionsList( { collection : collection , "userApiKey":self.userApiKey});
    self.list.render();
    self.$el.append(self.list.el);
    // Property which tells parent controllers not to re-draw this page, as it's now doing something useful - not just a 'migrate' message
    self.browsing = true;
  },
  showCollection : function(e){
    e.stopPropagation();
    var self = this,
    el = $(e.target),
    li = (e.target.nodeName.toLowerCase() === 'li' ) ? el : el.parents('li'),
    id = li.data('id'),
    model = this.list.collection.get(id);

    // Don't allow double clicks / multiple clicks on collections to ruin the showing
    if (self.loadingACollection){
      return;
    }
    self.loadingACollection = true;
    setTimeout(function(){
      self.loadingACollection = false; //just incase
    }, 10000);

    this.updateCollection(model, function(dataViewCollection){
      self.dataView = new App.View.DataBrowserDataView({ model : model, collections : self.list.collection.toJSON(), collection : dataViewCollection, "userApiKey":this.userApiKey});
      self.dataView.render();
      self.dataView.bind('collectionBack', $.proxy(self.onCollectionBack, self));
      self.list.hide();
      self.$el.append(self.dataView.el);

      self.loadingACollection = false;
    });
  },
  updateCollection : function(model, cb){
    var dynoHost = (this.mode === 'dev') ? this.hosts['development-url'] : this.hosts['live-url'],
    name = model.get('name'),
    count = model.get('count'),
    dataViewCollection = new DataBrowser.Collection.CollectionData( { url : dynoHost, collection : name, appkey : this.appkey, count : count, "userApiKey": this.userApiKey  } );
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

    if (this.hasCorrectWrapper()){
      this.showDeployMessage();
    }else{
      this.showWrapperChangeInstructions();
    }

  },
  showDeployMessage : function(){
    var tpl = $('#dataviewGoDeploy').html();
    tpl = Handlebars.compile(tpl);
    //check app props and show update information or deploy information
    var messageView = new App.View.DataBrowserMessageView({ message : tpl(), button : 'Deploy &raquo;', cb : function(e){
      // Jump to the deploy page
      $('a[data-controller="apps.deploy.controller"]').trigger("click");
    }});
    this.$el.append(messageView.render().$el);
  },
  onCollectionBack : function(){
    this.dataView && this.dataView.hide();
    this.list.show();
    this.dataView && this.dataView.remove();
    delete this.dataView;
  },
  /*
    Tells if correct wrapper tech being used to show databrowser - doesn't update instance properties on check
   */
  hasCorrectWrapper : function(){
    var inst = $fw.data.get('inst'),
    wrapper = inst.config && inst.config.appcloud && inst.config.appcloud.wrapper && inst.config.appcloud.wrapper[this.mode] && inst.config.appcloud.wrapper[this.mode]["module"] || 'fh-nodeapp';
    return wrapper === "fh-webapp";
  },
  /*
    Checks if app has it's own DB on ditch - doesn't update instance properties on check
   */
  needsMigrate : function(){
    var inst = $fw.data.get('inst'),
    hasOwnDb = inst.config && inst.config.app && inst.config.app[this.mode] && inst.config.app[this.mode].hasowndb;
    return hasOwnDb !== "true";
  }
});