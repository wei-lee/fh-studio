var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FormApp = App.Model.FormBase.extend({
  fetchURL : '/api/v2/forms/apps/{{id}}',
  fetchFormsURL : '/api/v2/forms/apps/{{id}}',
  fetch : function(options){
    // Get the forms associated with this form app.
    var self = this,
    url = this.fetchFormsURL.replace('{{id}}', self.get('_id'));
    $.ajax({
      type: 'GET',
      url: url,
      cache: true,
      success: function(res){
        if (res) {
          if ($.isFunction(options.success)) {
            return options.success(self);
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

  },
  sync : function(method){
    this[method].apply(this, arguments);
  },
  update : function(method, model, options){
    var self = this,
    constObj = App.View.Forms.prototype.CONSTANTS.FORMSAPP,
    url = this.fetchURL.replace('{{id}}', model.get('_id')),
    updateObject = {
      title : model.get(constObj.NAME),
      forms : model.get(constObj.FORMS),
      theme : model.get(constObj.THEMENAME)
    };

    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(updateObject),
      contentType : "application/json",
      cache: true,
      success: function(res){
        if (res) {
          if ($.isFunction(options.success)) {
            return options.success(self.toJSON());
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
  },
  create : function(){
    this.update.apply(this, arguments);
  }

});

App.Collection.FormApps = App.Collection.FormBase.extend({
  pluralName : false,
  initialize: function() {},
  model: App.Model.FormApp,
  url: '/api/v2/forms/apps',

  urlUpdate: '/api/v2/forms/form',
  fetch : function(options){
    console.log("fetch called");
//    // Get the forms associated with this form app.
    var self = this;
    $.ajax({
      type: 'GET',
      url: self.url,
      cache: true,
      success: function(res){
        if (res) {
          if ($.isFunction(options.success)) {
            return options.success(res);
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
//

  },
  sync : function(method){
    this[method].apply(this, arguments);
  },
  update : function(method, model, options){
    var self = this,
      url = this.fetchURL.replace('{{id}}', model.get('_id')),
      forms = model.get('forms');
    $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(forms),
      contentType : "application/json",
      cache: true,
      success: function(res){
        if (res && res.forms) {
          if ($.isFunction(options.success)) {
            self.set('forms', res.forms);
            return options.success(self);
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
  }
});