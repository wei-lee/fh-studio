var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.Form = Backbone.Model.extend({
});

App.Collection.Form = Backbone.Collection.extend({
  initialize: function() {},
  model: App.Model.Form,
  url: '/studio/static/js/model/backbone/mocks/forms.json',
  sync: function (method, model, options) {
    var self = this;
    if(!self.loaded){
      var url = self.url;
      $fw.server.post(url, {}, function(res) {
        if (res && res.length && res.length>0) {
          var massaged = [];
          _.each(res, function(r){
            massaged.push(r.data);
          });
          self.loaded = true;
          if ($.isFunction(options.success)) {
            options.success(massaged, options);
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