var App = App || {};
App.View = App.View || {};

App.View.CMS = Backbone.View.extend({

  events: {
    'click table tbody tr': 'showDetails'
  },

  initialize: function(){

  },
  render: function(){
    this.$el.append('hiworld');
    return this;
  }
});