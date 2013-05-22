App.View.ProjectAppAnalyticsDatepicker = Backbone.View.extend({
  events: {
    'click #last_week': 'lastWeek',
    'click #last_month': 'lastMonth',
    'click #go_render_analytics': 'go'
  },

  initialize: function() {},

  render: function() {
    var html = $("#project-app-analytics-date-picker-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$from_field = this.$el.find('[name="from"]');
    this.$to_field = this.$el.find('[name="to"]');

    // Init datepickers
    this.lastMonth();
  },

  go: function(e) {
    if (e) e.preventDefault();
  },

  lastWeek: function(e) {
    if (e) e.preventDefault();

    var to = new moment();
    var from = new moment().subtract('days', 7);
    this._setDates(from, to);
  },

  lastMonth: function(e) {
    if (e) e.preventDefault();

    var to = new moment();
    var from = new moment().subtract('months', 1);
    this._setDates(from, to);
  },

  currentFrom: function() {
    return new moment(this.$from_field.val());
  },

  currentTo: function() {
    return new moment(this.$to_field.val());
  },

  _setDates: function(from, to) {
    var self = this;

    this.dateChanged(from, to);

    // Without localisation, stick to ISO_8601 for date formats
    this.$from_field.val(from.format('YYYY-MM-DD'));
    this.$from_field.datepicker({
      format: 'yyyy-mm-dd',
      weekStart: 0
    }).on('changeDate', function(ev) {
      var updated_from = new moment(ev.date);
      self.dateChanged(updated_from, self.currentTo());
    });

    this.$to_field.val(to.format('YYYY-MM-DD'));
    this.$to_field.datepicker({
      format: 'yyyy-mm-dd',
      weekStart: 0
    }).on('changeDate', function(ev) {
      var updated_to = new moment(ev.date);
      self.dateChanged(self.currentFrom(), updated_to);
    });
  },

  dateChanged: function(from, to) {
    // Fanout this event to any listeners
    App.vent.trigger('app-analytics-datechange', {
      from: from,
      to: to
    });
  }
});