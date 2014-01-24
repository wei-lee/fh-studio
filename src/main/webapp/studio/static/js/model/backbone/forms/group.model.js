var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FormGroup = App.Model.FormBase.extend({
  idAttribute: '_id',
  url: '/api/v2/forms/groups',
  fetchURL: '/api/v2/forms/groups/{{id}}',
  // Unlike our other form models, a group already has the info it needs - no server fetch required
  fetch : function(options){
    options.success(this);
  }
});

App.Collection.FormGroups = App.Collection.FormBase.extend({
  initialize: function() {},
  pluralName : false,
  model: App.Model.FormGroup,
  url: '/api/v2/forms/groups',
  urlUpdate: '/api/v2/forms/groups'
});