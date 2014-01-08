var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};

App.Model.User = Backbone.Model.extend({
  idAttribute: '_id',
  fetchURL : '/box/srv/1.1/admin/user/list'
});

App.Collection.Users = Backbone.Collection.extend({
  initialize: function() {},
  model: App.Model.User,
  url: '/box/srv/1.1/admin/user/list',
  parse : function(response){
    var users = [];
    _.each(response.list, function(item){
      var u = item.fields;
      u.guid = u._id = item.guid;
      users.push(u);
    });
    return users;
  }
});