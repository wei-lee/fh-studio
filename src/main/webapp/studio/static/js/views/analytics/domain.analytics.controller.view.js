App.View.DomainAnalyticsController = Backbone.View.extend({
  picker_model: null,

  defaultOptions: {
    type: "installs" // Default to installs
  },

  subviews: {
    "installs": App.View.DomainAnalyticsInstalls,
    "startups": App.View.DomainAnalyticsStartups,
    "cloud_requests": App.View.DomainAnalyticsCloudRequests,
    "active_users": App.View.DomainAnalyticsActiveUsers
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
    this.options.guid = $fw.clientProps.domain;
  },

  render: function() {
    var html = $("#aggregated-analytics-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$datepicker_container = this.$el.find('.datepicker_container');
    this.$analytics_container = this.$el.find('#client_analytics_container');
    this.$metrics_select = this.$el.find('#analytics_type');

    this.renderDatePicker();

    // Render dashboard by default
    this.dashboard();

    return this;
  },

  renderDatePicker: function() {
    if (!this.options.hidePicker) {
      this.picker = new App.View.ProjectAppAnalyticsDatepicker();
      this.picker.render();
      this.$datepicker_container.html(this.picker.el);
      this.picker_model = this.picker.model;
    } else {
      if (this.picker) this.picker.remove();      
      this.$datepicker_container.empty();
      delete this.picker;
      this.picker_model = this.options.picker_model;
    }
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
    var current_pill = $(e.currentTarget);

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

    var view = new this.subviews[this.options.type]({
      guid: this.options.guid,
      picker_model: this.picker_model
    });
    view.renderDashboard();
    this.$analytics_container.html(view.el);
    this.selectMetric(this.options.type);
  },

  byDate: function(e) {
    if (e) {
      e.preventDefault();
      this.setActivePill(e);
    }

    var view = new this.subviews[this.options.type]({
      guid: this.options.guid,
      picker_model: this.picker_model
    });
    view.renderByDate();
    this.$analytics_container.html(view.el);
    this.selectMetric(this.options.type);
  },

  byPlatform: function(e) {
    if (e) {
      e.preventDefault();
      this.setActivePill(e);
    }

    var view = new this.subviews[this.options.type]({
      guid: this.options.guid,
      picker_model: this.picker_model
    });
    view.renderByPlatform();
    this.$analytics_container.html(view.el);
    this.selectMetric(this.options.type);
  },

  byLocation: function(e) {
    if (e) {
      e.preventDefault();
      this.setActivePill(e);
    }

    var view = new this.subviews[this.options.type]({
      guid: this.options.guid,
      picker_model: this.picker_model
    });
    view.renderByLocation();
    this.$analytics_container.html(view.el);
    this.selectMetric(this.options.type);
  },

  selectMetric: function(metric_type) {
    // Clear
    this.$metrics_select.find('option').removeAttr('selected');

    // Set
    this.$metrics_select.find('[value="' + metric_type + '"]').attr('selected', 'selected');
  }
});