App.View.ProjectAppAnalyticsDatepicker = Backbone.View.extend({
  events: {
    'click #last_week': 'lastWeek',
    'click #last_month': 'lastMonth',
    'click #go_render_analytics': 'go'
  },

  initialize: function() {
  },

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

  _setDates: function(from, to) {
    //this.trigger("rangeChange", {from: from, to: to});

    this.$from_field.val(from.format('DD/MM/YYYY'));
    this.$from_field.datepicker({
      format: 'dd/mm/yyyy',
      weekStart: 0
    });

    this.$to_field.val(to.format('DD/MM/YYYY'));
    this.$to_field.datepicker({
      format: 'dd/mm/yyyy',
      weekStart: 0
    });
  }
});
