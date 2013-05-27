App.View.ProjectAppAnalytics = Backbone.View.extend({
  defaultOptions: {
    type: "installs" // Default to installs
  },

  subviews: {
    "installs": new App.View.ProjectAppAnalyticsInstalls(this.options),
    "startups": new App.View.ProjectAppAnalyticsStartups(this.options),
    "cloud_requests": new App.View.ProjectAppAnalyticsCloudRequests(this.options),
    "active_users": new App.View.ProjectAppAnalyticsActiveUsers(this.options)
  },

  events: {
    'click #client_analytics_dashboard': 'dashboard',
    'click #client_analytics_by_date': 'byDate',
    'click #client_analytics_by_platform': 'byPlatform',
    'click #client_analytics_by_location': 'byLocation',
    'change #analytics_type': 'typeChange'
  },

  initialize: function(options) {
    this.options = $.extend(true, {}, this.defaultOptions, options) || {};
  },

  render: function() {
    var html = $("#project-app-analytics-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$datepicker_container = this.$el.find('.datepicker_container');
    this.$analytics_container = this.$el.find('#client_analytics_container');
    this.$metrics_select = this.$el.find('#analytics_type');

    // I'd rather this wasn't a global, but...
    if (!this.options.hidePicker) {
      App.views.picker = new App.View.ProjectAppAnalyticsDatepicker();
      App.views.picker.render();
      this.$datepicker_container.append(App.views.picker.el);
    }

    // Render dashboard by default
    this.dashboard();

    return this;
  },

  activePill: function() {
    var active_pill = $('.nav-pills li.active', this.el).attr('id');
    return active_pill;
  },

  typeChange: function(e) {
    var type = $(e.target).val();
    this.options.type = type;

    var active_pill = this.activePill();

    if (active_pill == 'dashboard') {
      this.dashboard();
    } else if (active_pill == 'by_date') {
      this.byDate();
    } else if (active_pill == 'by_device') {
      this.byPlatform();
    } else if (active_pill == 'by_location') {
      this.byLocation();
    } else {
      console.log("Unknown active_pill: " + active_pill);
    }
  },

  // Events
  setActivePill: function(e) {
    var current_pill = $(e.target);

    // Remove active
    var nav = current_pill.closest('ul');
    $('li', nav).removeClass('active');

    current_pill.closest('li').addClass('active');
  },

  dashboard: function(e) {
    if (e) {
      e.preventDefault();
      this.setActivePill(e);
    }

    this.subviews[this.options.type].renderDashboard({
      guid: this.options.guid
    });
    this.$analytics_container.html(this.subviews[this.options.type].el);
    this.selectMetric(this.options.type);
  },

  byDate: function(e) {
    if (e) {
      e.preventDefault();
      this.setActivePill(e);
    }

    this.subviews[this.options.type].renderByDate({
      guid: this.options.guid
    });
    this.$analytics_container.html(this.subviews[this.options.type].el);
    this.selectMetric(this.options.type);
  },

  byPlatform: function(e) {
    if (e) {
      e.preventDefault();
      this.setActivePill(e);
    }

    this.subviews[this.options.type].renderByPlatform({
      guid: this.options.guid
    });
    this.$analytics_container.html(this.subviews[this.options.type].el);
    this.selectMetric(this.options.type);
  },

  byLocation: function(e) {
    if (e) {
      e.preventDefault();
      this.setActivePill(e);
    }

    this.subviews[this.options.type].renderByLocation({
      guid: this.options.guid
    });
    this.$analytics_container.html(this.subviews[this.options.type].el);
    this.selectMetric(this.options.type);
  },

  selectMetric: function(metric_type) {
    // Clear
    this.$metrics_select.find('option').removeAttr('selected');

    // Set
    this.$metrics_select.find('[value="'+metric_type+'"]').attr('selected', 'selected');
  }
});