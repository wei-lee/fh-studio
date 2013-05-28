App.View.ProjectAppAnalyticsDatepicker = Backbone.View.extend({
  initialize: function(options) {
    if (!options || !options.model) {
      console.log('No model passed, init');
      this.model = new App.Model.DatePicker();
    }
  },

  render: function() {
    var html = $("#project-app-analytics-date-picker-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$picker = this.$el.find('#analytics_picker');

    // Init datepickers
    this.lastMonth();
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

    this.model.set({
      from: from.valueOf(),
      to: to.valueOf()
    });

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
    }, function(from, to) {
      self.$picker.val(from.format('MMMM D, YYYY') + ' - ' + to.format('MMMM D, YYYY'));
      self.model.set({
        from: from.valueOf(),
        to: to.valueOf()
      });
    });

    // Inital set
    this.$picker.val(from.format('MMMM D, YYYY') + ' - ' + to.format('MMMM D, YYYY'));
  }
});