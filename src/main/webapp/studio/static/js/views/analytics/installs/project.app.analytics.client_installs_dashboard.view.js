App.View.ProjectAppAnalyticsClientInstallsDashboard = Backbone.View.extend({
  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
  },

  render: function() {
    var html = $("#project-app-analytics-client-installs-dashboard-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$by_date = this.$el.find('.by_date');
    this.$by_platform = this.$el.find('.by_platform');
    this.$by_location = this.$el.find('.by_location');

    // TODO: Normally, collection passed in
    this.$by_date.append(new App.View.ProjectAppAnalyticsClientInstallsByDate({
      guid: this.options.guid
    }).render().$el);
    this.$by_platform.append(new App.View.ProjectAppAnalyticsClientInstallsByPlatform({
      guid: this.options.guid
    }).render().$el);
    this.$by_location.append(new App.View.ProjectAppAnalyticsClientInstallsByLocation({
      guid: this.options.guid
    }).render().$el);

    return this;
  }
});