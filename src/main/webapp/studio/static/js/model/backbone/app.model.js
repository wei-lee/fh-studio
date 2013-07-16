App.Model.App = Backbone.Model.extend({});

App.Collection.Apps = Backbone.Collection.extend({
  model: App.Model.App,

  sync: function(method, model, options) {
    var url = '/box/srv/1.1/ide/' + $fw.clientProps.domain + '/app/list';

    if ("read" === method) {
      $fw.server.post(url, {}, function(res) {
        if (res.status === "ok") {
          if ($.isFunction(options.success)) {
            options.success(res);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res);
          }
        }
      }, options.error, true);
    } else {
      console.log("App collection do not support" + method);
      if ($.isFunction(options.error)) {
        options.error(model, "not_supported", options);
      }
    }
  },

  parse: function(response) {
    if (response.status === 'ok') {
      return response.list;
    }
  }
});