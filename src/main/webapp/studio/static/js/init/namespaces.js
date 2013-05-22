// Initialise Backbone namespaces

var App = App || {};
App.Model = App.Model || {};
App.View = App.View || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};
App.views = App.views || {};

// Global event bus
App.vent = _.extend({}, Backbone.Events);