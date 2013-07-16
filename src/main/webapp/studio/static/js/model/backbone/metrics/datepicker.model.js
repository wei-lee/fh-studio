App.Model.DatePicker = Backbone.Model.extend({
  initialize: function(options) {
    console.log('datePicker Model init');
  },

  // Custom getters (format ts as moment)
  from: function() {
    var ts = this.attributes.from;
    return new moment(ts);
  },

  to: function() {
    var ts = this.attributes.to;
    return new moment(ts);
  },

  get: function(attr) {
    if (typeof this[attr] == 'function') {
      return this[attr]();
    }
    return Backbone.Model.prototype.get.call(this, attr);
  }
});