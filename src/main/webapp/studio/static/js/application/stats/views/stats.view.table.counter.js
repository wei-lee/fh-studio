Stats.View.Table.Counter = Stats.View.Table.Base.extend({
  table_container: '#counters_table',

  init: function(params) {
    this._super(params);
  },

  formatTimestamp: function(ts) {
    var timestamp = moment(ts).format('dddd, MMMM Do YYYY, HH:mm:ss');
    return timestamp;
  },

  formatValue: function(value) {
    return value.toFixed(0);
  }
});