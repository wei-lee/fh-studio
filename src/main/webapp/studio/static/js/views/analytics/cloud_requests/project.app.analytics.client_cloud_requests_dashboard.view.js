App.View.ProjectAppAnalyticsCloudRequestsDashboard = Backbone.View.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
  },

  render: function() {
    var html = $("#project-app-analytics-cloud-requests-dashboard-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$by_date = this.$el.find('.by_date');
    this.$by_platform = this.$el.find('.by_platform');
    this.$by_location = this.$el.find('.by_location');

    // TODO: Normally, collection passed in
    this.$by_date.append(new App.View.ProjectAppAnalyticsCloudRequestsByDate({
      guid: this.options.guid
    }).render().$el);
    this.$by_platform.append(new App.View.ProjectAppAnalyticsCloudRequestsByPlatform({
      guid: this.options.guid
    }).render().$el);
    this.$by_location.append(new App.View.ProjectAppAnalyticsCloudRequestsByLocation({
      guid: this.options.guid
    }).render().$el);
  }
});