App.View.AnalyticsOverview = Backbone.View.extend({
  initialize: function() {},

  render: function() {
    var html = $("#project-analytics-overview-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template({
      app: this.model.toJSON()
    }));

    this.$installs_container = $('.installs_container', this.$el);
    this.installs = new App.View.AnalyticsOverviewInstalls({
      model: this.model
    });
    this.installs.render();
    this.$installs_container.html(this.installs.el);

    this.$startups_container = $('.startups_container', this.$el);
    this.startups = new App.View.AnalyticsOverviewStartups({
      model: this.model
    });
    this.startups.render();
    this.$startups_container.html(this.startups.el);

    this.$cloud_requests_container = $('.cloud_requests_container', this.$el);
    this.cloud_requests = new App.View.AnalyticsOverviewCloudRequests({
      model: this.model
    });
    this.cloud_requests.render();
    this.$cloud_requests_container.html(this.cloud_requests.el);

    this.$active_users_container = $('.active_users_container', this.$el);
    this.active_users = new App.View.AnalyticsOverviewActiveUsers({
      model: this.model
    });
    this.active_users.render();
    this.$active_users_container.html(this.active_users.el);
  }
});