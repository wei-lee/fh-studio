Stats.View.Table.Timer = Stats.View.Table.Base.extend({
  table_container: '#timers_table',

  init: function(params) {
    this._super(params);
  },

  formatTimestamp: function(ts) {
    var timestamp = moment(ts).format('dddd, MMMM Do YYYY, HH:mm:ss');
    return timestamp;
  },

  formatValue: function(value) {
    return value.toFixed(2);
  }
});