var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FormGroup = App.Model.FormBase.extend({
  idAttribute: '_id',
  // Unlike our other form models, a group already has the info it needs - no server fetch required
  fetch : function(options){
    options.success(this);
  }
});

App.Collection.FormGroups = App.Collection.FormBase.extend({
  initialize: function() {},
  pluralName : 'groups',
  model: App.Model.FormGroup,
  url: '/studio/static/js/model/backbone/mocks/forms/groups.json',
  urlUpdate: '/api/v2/forms/groups'
});