App.View.PluginsDashboard = Backbone.View.extend({
  events: {
    'click .plugin .addButton': 'configurePlugin'
  },
  subViews : {
    //TODO: Make this the subview.
  },
  initialize : function(){

  },
  render: function() {
    this.$el.html();
  }
});