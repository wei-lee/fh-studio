App.View.ProjectAppAnalyticsClientInstallsByLocation = Backbone.View.extend({
  initialize: function(options) {
    options = $.extend(true, {}, this.defaultOptions, options) || {};
    if (options) {
      this.width = options.width || 350;
    } else {
      this.width = 350;
    }

    this.collection = new App.Collection.AppInstallsGeo();
    var from = App.views.picker.currentFrom();
    var to = App.views.picker.currentTo();
    this.collection.fetch({
      from: from,
      to: to,
      guid: options.guid
    });
  },

  render: function(width) {
    var html = $("#project-app-analytics-client-installs-bylocation-template").html();
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