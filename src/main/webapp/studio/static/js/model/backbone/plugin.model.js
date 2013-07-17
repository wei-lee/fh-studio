var Plugins = Plugins || {}; // Todo should this be singular? Singular just for the model?
Plugins.Collection = Plugins.Collection || {};
Plugins.Collections = Plugins.Collections || {};

Plugins.Model = Backbone.Model.extend({
});

Plugins.Collection.Plugin = Backbone.Collection.extend({
  initialize: function() {},
  model: Plugins.Model,
  url: '/studio/static/js/model/backbone/mocks/plugins.json',
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
Plugins.Collections.Plugins = new Plugins.Collection.Plugin();
Plugins.Collections.Plugins.fetch({ reset: true });