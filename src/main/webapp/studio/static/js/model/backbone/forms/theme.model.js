var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};


App.Model.FormTheme = App.Model.FormBase.extend({
  idAttribute: '_id',
  fetchURL: '/api/v2/forms/theme/{{id}}',
  urlUpdate: '/api/v2/forms/theme',
  save: function (attributes, options) {
    var self = this,
      id = this.get('_id');
    options.type = 'post'; // Always use POST for these operations
    this.url = this.urlUpdate.replace('{{id}}', id);
    Backbone.RelationalModel.prototype.save.apply(this, arguments);
  }
});

App.Model.FormThemeTemplate = App.Model.FormBase.extend({
  idAttribute: '_id',
  fetchURL: '/api/v2/forms/templates/theme/{{id}}'
});

App.Collection.FormThemes = App.Collection.FormBase.extend({
  initialize: function () {
  },
  pluralName: 'themes',
  model: App.Model.FormTheme,
  url: '/api/v2/forms/theme',
  urlUpdate: '/api/v2/forms/theme',
  create : function(method, model, options){
    // Add in the default theme spec to this..
    var name = model.name;
    _.extend(model, App.forms.themeCSSGenerator().baseTheme);
    model.name = name;
    model.updatedBy = $fw.userProps.email;
    model.lastUpdated = new Date();
    App.Collection.FormBase.prototype.create.apply(this, arguments);
  }
});

App.Collection.FormThemeTemplate = App.Collection.FormBase.extend({
  pluralName: 'themes',
  initialize: function () {
  },
  model: App.Model.FormThemeTemplate,
  urlUpdate: '/api/v2/forms/theme',
  url: '/api/v2/forms/templates/theme/list'
});