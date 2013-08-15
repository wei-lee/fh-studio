var DataBrowser = DataBrowser || {};
DataBrowser.Collection = DataBrowser.Collection || {};
DataBrowser.Collections = DataBrowser.Collections || {};

DataBrowser.CollectionModel = Backbone.Model.extend({
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
  sync: function (method, model, options) {
    var self = this;
    if(!self.loaded){
      var url = self.url;
      $fw.server.post(url, {}, function(res) {
        res = res.list;
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
DataBrowser.Collections.Collections = new DataBrowser.Collection.CollectionList();
DataBrowser.Collections.CollectionData = new DataBrowser.Collection.CollectionData();
DataBrowser.Collections.Collections.fetch({ reset: true });
DataBrowser.Collections.CollectionData.fetch({ reset: true });