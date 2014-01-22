var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FieldRule = Backbone.RelationalModel.extend({
  idAttribute: '_id',
  fetch : function(options){
    options.success(this);
  }
});

App.Collection.FieldRules = Backbone.Collection.extend({
  initialize: function() {},
  model: App.Model.FieldRule,
  urlUpdate: '/api/v2/forms/form/fieldRules',
  sync: function (method, model, options) {
    console.log("sync called for model");
    this[method].apply(this, arguments);
  },
  read : function(method, model, options){
    var self = this;

    if(!self.loaded){
      var url = self.url;
      $.ajax({
        type: 'GET',
        url: url,
        success: function(res){
          if (res && res.themes && res.themes.length && res.themes.length>0) {
            self.loaded = true;
            if ($.isFunction(options.success)) {
              options.success(res.themes, options);
            }
          } else {
            if ($.isFunction(options.error)) {
              options.error(res, options);
            }
          }
        },
        error: function(xhr, status){
          options.error(arguments);
        }
      });
    } else {
      self.trigger("sync");
    }
  },
  update : function(method, model, options){
    var self = this;
    var url = self.urlUpdate;




    var data = {
     "formId":model.formid,
     "rules":model.rules
    };

    console.log("model ",data);

    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(res){
        if (res) {
          self.trigger('reset');
          if ($.isFunction(options.success)) {
            options.success(res, options);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res, options);
          }
        }
      },
      error: function(xhr, status){
        if ($.isFunction(options.error)) {
          options.error(arguments);
        }
      }
    });
  }
});
