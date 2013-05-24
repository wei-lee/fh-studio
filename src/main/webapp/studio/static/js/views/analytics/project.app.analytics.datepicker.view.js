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

    this.$picker = this.$el.find('#analytics_picker');

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
    var vals = this.$picker.val();
    var val = vals.split(' - ')[0];
    return new moment(val, 'MMMM D, YYYY');
  },

  currentTo: function() {
    var vals = this.$picker.val();
    var val = vals.split(' - ')[1];
    return new moment(val, 'MMMM D, YYYY');
  },

  _setDates: function(from, to) {
    var self = this;

    this.dateChanged(from, to);

    this.$picker.daterangepicker({
      opens: 'left',
      format: 'MM/DD/YYYY',
      separator: ' - ',
      startDate: from,
      endDate: to,
      minDate: '01/01/2009',
      maxDate: moment(),
      showWeekNumbers: true,
      ranges: {
         'Last 7 Days': [moment().subtract('days', 6), new Date()],
         'Last 30 Days': [moment().subtract('days', 29), new Date()],
         'Previous Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
      },
      dateLimit: false
    }, function(start, end) {
      self.$picker.val(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
      self.dateChanged(self.currentFrom(), self.currentTo());
    });

    // Inital set
    this.$picker.val(from.format('MMMM D, YYYY') + ' - ' + to.format('MMMM D, YYYY'));
  },

  dateChanged: function(from, to) {
    // Fanout this event to any listeners
    App.vent.trigger('app-analytics-datechange', {
      from: from,
      to: to
    });
  }
});