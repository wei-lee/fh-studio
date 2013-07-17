App.View.DashboardFilters = Backbone.View.extend({
  events: {
  },
  initialize : function(options){
  },
  render: function() {
    var template = Handlebars.compile($('#pluginsDashboardFilters').html());
    this.$el.html(template);
    return this;
  }
});