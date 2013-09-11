var DataBrowser = DataBrowser || {};
DataBrowser.Collection = DataBrowser.Collection || {};
DataBrowser.Collections = DataBrowser.Collections || {};

DataBrowser.CollectionModel = Backbone.Model.extend({
  idAttribute : 'name'

});

DataBrowser.CollectionDataModel = Backbone.Model.extend({
  idAttribute : 'guid',
  sync : function(method, model, options){
    // By default model.save decides to go off on it's merry way making it's own requests - let's stop that
    this.changed = {};
    this.collection.sync('update', model, options);
  }
});

DataBrowser.Collection.CollectionList = Backbone.Collection.extend({
  model: DataBrowser.CollectionModel,
  url: undefined,
  mode : undefined,
  initialize: function(options) {
    this.url = options.url + '/mbaas/db';
    this.appkey = options.appkey;
    this.userApiKey = options.userApiKey;
    this.mode = options.mode;
  },
  create : function(model, options){
    var self = this;
    options = options || { };
    options.success = function(resp){
      // No idea what size our created collection will be, document creation API doesn't tell us -> re-fetch whole collection
      self.fetch({reset : true});
    };
    return this.sync('create', model, options);
  },
  sync: function (method, model, options) {
    var self = this;
    var url = self.url,
    req = {
      "__fh" : { "appkey" : self.appkey, "userkey":self.userApiKey }
    };

    switch(method){
      case "create":
        req.act = "create";
        req.type = model.name;
        // mock data - will come out in UI, but at least user then has chance to change / delete that row
        req.fields = { field : 'value' };
        break;
      default: // i.e. read
        req.act = "list";
        break;

    }

    $fw.server.post(url, req, function(res) {
      if (res) {
        res = res.list || res;
        self.loaded = true;
        if ($.isFunction(options.success)) {
          options.success(res, options);
        }
      } else {
        if ($.isFunction(options.error)) {
          options.error(res, options);
        }
      }
    }, options.error, true, 6000);

  }
});

DataBrowser.Collection.CollectionData = Backbone.Collection.extend({
  model: DataBrowser.CollectionDataModel,
  url: undefined,
  loaded : false,
  count : undefined, // size of the collection in total - important for pagination
  limit : 20,
  page : 0, // skip = page * limit => first page skips 0 records!
  collectionName : undefined,
  sort : undefined,
  filters : {},
  mode : undefined,
  initialize: function(options) {
    this.url = options.url + '/mbaas/db';
    this.mode = options.mode;
    this.loaded = false;
    this.appkey = options.appkey;
    this.userApiKey = options.userApiKey;
    this.filters = {};
    this.collectionName = options.collection;
    this.count = options.count;
  },
  create : function(model, options){
    var self = this;
    var oldSuccess = options.success;
    options.success = function(resp){
      self.add(resp, { at : 0 });
      self.trigger('sync', this, resp.fields);
      oldSuccess.apply(this, arguments);
    };
    return this.sync('create', model, options);
  },
  remove : function(model, options){
    //TODO: Backbone is making Cian a Sad Panda. Why do we need to do this?
    this.sync('remove', model, options);
    options.silent = true;
    Backbone.Collection.prototype.remove.apply(this, arguments);
  },
  sync: function (method, model, options) {
    method = method || "get";
    var self = this,
    skip = this.page * this.limit,
    url = self.url,
    req, verb;

    this.filters = options.filters || this.filters;

    var _success = function(res) {
      self.loaded = true;
      if (res) {
        if ($.isFunction(options.success)) {
          options.success(res, options);
        }
      } else {
        if ($.isFunction(options.error)) {
          options.error(res, options);
        }
      }
    },
    // Can be optionally overridden in our switch
    _successCall = function(res){
      _success(res);
    };

    switch(method){
      case "read":
        //do
        verb = "post";
        req = {
          act : 'list',
          type : this.collectionName,
          limit : options.limit || this.limit,
          sort : options.sort || this.sort,
          skip : skip
        };
        _.extend(req, this.filters);
        _successCall = function(result){
          result = result && result.list;
          //If we haven't defined a sortOrder, show most recent first by default - $fh.db returns in  reverse
          if (!options.sort){
            result = result.reverse();
          }
          _success(result);
        };
        break;
      case "update":
        verb = "post";
        req = {
          "act": "update",
          "type": this.collectionName,
          "guid": model.id,
          "fields": model.get('fields') // might be nice to be able to do model.changed here so only changed fields go to the server..
        };
        break;
      case "remove":
        verb = "post";
        req = {
          act : 'delete',
          type : this.collectionName,
          guid : model.get('guid')
        };
        break;
      case "create":
        verb = "post";
        req = {
          act : 'create',
          type : this.collectionName,
          fields : model.fields
        };
        break;
    }
    req.__fh = { appkey : self.appkey, "userkey":self.userApiKey}; // TODO: User API key goes here too...?

    this.trigger('request'); // manually trigger a req event since backbone isn't sending it - shows busy state on the table
    $fw.server[verb](url, req, _successCall, options.error, true, 6000);
  }
});