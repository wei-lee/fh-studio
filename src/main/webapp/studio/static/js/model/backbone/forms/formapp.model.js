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

    return options.success(this);
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

App.Collection.FormApps = App.Collection.FormBase.extend({
  pluralName : 'apps',
  initialize: function() {},
  model: App.Model.FormApp,
  url: '/studio/static/js/model/backbone/mocks/forms/formapps.json',
  urlUpdate: '/api/v2/forms/form'
});