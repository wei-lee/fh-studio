var DataBrowser = DataBrowser || {};
DataBrowser.Collection = DataBrowser.Collection || {};
DataBrowser.Collections = DataBrowser.Collections || {};

DataBrowser.CollectionModel = Backbone.Model.extend({
  idAttribute : 'name' // collection names are unique..
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
  initialize: function(options) {
    this.url = options.url + '/cloud/collections'; // TODO: Wire this up to the proper endpoint once fh-db work is done
    this.appkey = options.appkey;
  },
  model: DataBrowser.CollectionModel,
  url: undefined,
  sync: function (method, model, options) {
    var self = this;
    if(!self.loaded){
      var url = self.url,
      req = {
        "act" : "list",
        "__fh" : { "appkey" : self.appkey }
      };
      $fw.server.post(url, {}, function(res) {
        if (res && res.length && res.length>0) {
          self.loaded = true;
          if ($.isFunction(options.success)) {
            options.success(res, options);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res, options);
          }
        }
      }, options.error, true);
    } else {
      self.trigger("sync");
    }
  }
});

DataBrowser.Collection.CollectionData = Backbone.Collection.extend({
  initialize: function(options) {
    this.url = options.url + '/mbaas/db';
    this.appkey = options.appkey;
    this.filters = {};
    this.collectionName = options.collection;
  },
  model: DataBrowser.CollectionDataModel,
  //url: '/studio/static/js/model/backbone/mocks/collection_users.json',
  //TODO: Auto
  url: undefined,
  limit : 20,
  page : 0, // skip = page * limit => first page skips 0 records!
  collectionName : undefined,
  sortOrder : 'desc',
  sortField : undefined,
  filters : {},
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

    var _success = function(res) {
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
          order : options.sortOrder || this.sortOrder,
          sort : options.sortField || this.sortField,
          skip : skip
        };
        _.extend(req, this.filters);
        _successCall = function(result){
          result = result && result.list;
          //If we haven't defined a sortOrder, show most recent first by default - $fh.db returns in  reverse
          if (!options.sortOrder && !options.sortField){
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
    req.__fh = { appkey : self.appkey }; // TODO: User API key goes here too...
    $fw.server[verb](url, req, _successCall, options.error, true);
  }
});