var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FormApp = App.Model.FormBase.extend({
  fetchURL : '/api/v2/forms/apps/{{id}}',
  fetchFormsURL : '/api/v2/forms/apps/{{id}}',
  createUrl : '/studio/static/js/model/backbone/mocks/forms/appcreate.json' , ///api/v2/forms/apps'
  sync : function(method){
    this[method].apply(this, arguments);
  },
  update : function(method, model, options){
    console.log('app model ', model);
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
            options.error(res);
          }
        }
      },
      error: function(xhr, status){
        options.error(arguments);
      }
    });
  },
  create : function(method, model, options){
    console.log("create app called ");
    var self = this;
    var constObj = App.View.Forms.prototype.CONSTANTS.FORMSAPP,

    updateObject = {
      title : model.get(constObj.NAME),
      forms : model.get(constObj.FORMS),
      theme : model.get(constObj.THEMENAME)
    };

    $.ajax({
      type: 'POST',
      url: this.createUrl,
      data: JSON.stringify(updateObject),
      contentType : "application/json",
      cache: false,
      success: function(res){
        if (res) {
          if ($.isFunction(options.success)) {
            return options.success(res);
          }
        } else {
          if ($.isFunction(options.error)) {
            options.error(res);
          }
        }
      },
      error: function(xhr, status){
        options.error(arguments);
      }
    });
  }

});

App.Collection.FormApps = App.Collection.FormBase.extend({
  pluralName : 'apps',
  initialize: function() {},
  model: App.Model.FormApp,
  url: '/api/v2/forms/apps',

  urlUpdate: '/api/v2/forms/form',
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