var DataBrowser = DataBrowser || {};
DataBrowser.Collection = DataBrowser.Collection || {};
DataBrowser.Collections = DataBrowser.Collections || {};

DataBrowser.CollectionModel = Backbone.Model.extend({
  idAttribute : 'name' // collection names are unique..
});

DataBrowser.CollectionDataModel = Backbone.Model.extend({
  idAttribute : 'guid'
});

DataBrowser.Collection.CollectionList = Backbone.Collection.extend({
  initialize: function() {},
  model: DataBrowser.CollectionModel,
  url: '/studio/static/js/model/backbone/mocks/collections.json',
  sync: function (method, model, options) {
    var self = this;
    if(!self.loaded){
      var url = self.url;
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
  initialize: function() {},
  model: DataBrowser.CollectionDataModel,
  url: '/studio/static/js/model/backbone/mocks/collection_users.json',
  limit : 25,
  collectionName : undefined,
  sortOrder : 'desc',
  sortField : undefined,
  sync: function (method, model, options) {
    var self = this;
    var url = self.url;
    var req = {
      limit : options.limit || this.limit,
      order : options.sortOrder || this.sortOrder,
      sort : options.sortField || this.sortField,
      collection : options.collection
    };
    $fw.server.post(url, req, function(res) {
      res = res.list;
      if (res && res.length && res.length>0) {
        if ($.isFunction(options.success)) {
          options.success(res, options);
        }
      } else {
        if ($.isFunction(options.error)) {
          options.error(res, options);
        }
      }
    }, options.error, true);
  }
});
DataBrowser.Collections.Collections = new DataBrowser.Collection.CollectionList();
DataBrowser.Collections.CollectionData = new DataBrowser.Collection.CollectionData();
DataBrowser.Collections.Collections.fetch({ reset: true });