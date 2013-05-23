App.View.AnalyticsOverviewStartups = Backbone.View.extend({
  initialize: function() {},

  render: function() {
    var html = $("#overview-area-startups-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template({
      app: this.model.toJSON(),
      count: 1000
    }));
  }
});