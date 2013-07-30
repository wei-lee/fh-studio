App.View.Spinner = Backbone.View.extend({
  options: null,

  className: 'loading_spinner',

  defaults: {
    text: "Loading..."
  },

  initialize: function(options) {
    _.bindAll(this);
    this.options = $.extend({}, this.defaults, options);
  },

  render: function() {
    var self = this;
    var template = Handlebars.compile($("#spinner-template").html());
    this.$el.append(template(this.options));
    return this;
  }
});