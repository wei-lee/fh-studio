App.View.DomainAnalyticsOverview = Backbone.View.extend({
  events: {
    'click .view_details': 'showDetails'
  },

  render: function() {
    var html = $("#project-domain-analytics-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    // Sample data enabled?
    if ($fw.getClientProp('reporting-sampledata-enabled') === 'true') {
      this.$el.find('.alert').removeClass('hidden_template');
    }

    this.$datepicker_container = this.$el.find('.datepicker_container');
    this.$overview_container = this.$el.find('.overview_container');
    this.$totals_container = this.$el.find('.domain_totals_container');

    this.$overview_container.show();

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

    this.$active_users_container = $('.active_users_container', this.$el);
    this.active_users = new App.View.DomainAnalyticsOverviewActiveUsers({
      model: this.model,
      picker_model: this.picker.model
    });
    this.active_users.render();
    this.$active_users_container.html(this.active_users.el);

    this.$el.find('.analytics_overview_tooltip').tooltip();

    this.delegateEvents();
  },

  showDetails: function(e) {
    this.$overview_container.hide();
    var metric_type = $(e.currentTarget).data('metric-type'); // Metric to show

    this.domain_analytics = new App.View.DomainAnalyticsController({
      hidePicker: true,
      picker_model: this.picker.model,
      type: metric_type
    });
    this.domain_analytics.render();
    this.$totals_container.html(this.domain_analytics.el);
    this.$totals_container.show();
  }
});