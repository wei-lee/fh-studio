App.View.DomainAnalytics = Backbone.View.extend({
  initialize: function() {},

  render: function() {
    var html = $("#project-domain-analytics-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$datepicker_container = this.$el.find('.datepicker_container');

    this.picker = new App.View.ProjectAppAnalyticsDatepicker();
    this.picker.render();
    this.$datepicker_container.html(this.picker.el);

    this.$installs_container = $('.installs_container', this.$el);
    this.installs = new App.View.DomainAnalyticsOverviewInstalls({
      picker_model: this.picker.model
    });
    this.installs.render();
    this.$installs_container.html(this.installs.el);

    this.$startups_container = $('.startups_container', this.$el);
    this.startups = new App.View.DomainAnalyticsOverviewStartups({
      model: this.model,
      picker_model: this.picker.model
    });
    this.startups.render();
    this.$startups_container.html(this.startups.el);

    this.$cloud_requests_container = $('.cloud_requests_container', this.$el);
    this.cloud_requests = new App.View.DomainAnalyticsOverviewCloudRequests({
      model: this.model,
      picker_model: this.picker.model
    });
    this.cloud_requests.render();
    this.$cloud_requests_container.html(this.cloud_requests.el);

    // this.$active_users_container = $('.active_users_container', this.$el);
    // this.active_users = new App.View.AnalyticsOverviewActiveUsers({
    //   model: this.model,
    //   picker_model: this.picker_model
    // });
    // this.active_users.render();
    // this.$active_users_container.html(this.active_users.el);
  },
});