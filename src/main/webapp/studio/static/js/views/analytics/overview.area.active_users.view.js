App.View.AnalyticsOverviewActiveUsers = Backbone.View.extend({
  initialize: function() {},

  render: function() {
    var html = $("#overview-area-active-users-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template({
      app: this.model.toJSON(),
      count: 1000
    }));
  }
});