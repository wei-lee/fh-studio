App.View.ProjectAppAnalyticsCloudRequestsByLocation = Backbone.View.extend({
  initialize: function(options) {
    if (options) {
      this.width = options.width || 350;
    } else {
      this.width = 350;
    }
    this.collection = new App.Collection.AppCloudRequestsGeo();
    this.collection.fetch();
  },

  render: function(width) {
    var html = $("#project-app-analytics-cloud-requests-bylocation-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$geochart = this.$el.find('.geo_chart_container');
    this.$geochart.append(new App.View.Geo({
      collection: this.collection,
      width: this.width
    }).render().$el);
    return this;
  }
});