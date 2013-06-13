var App = App || {};
App.View = App.View || {};
App.View.SwapSelect = Backbone.View.extend({
  options: null,
  tagName: "div",

  initialize: function(options) {
    _.bindAll(this);
    this.options = options;
    this.to = options.to;
    this.uid = options.uid || 'guid';
    this.collection = options.from;
    this.collection.fetch();
    this.collection.bind('sync', this.render, this);
  },

  render: function() {
    var self = this;
    var template = Handlebars.compile($("#swap-select-template").html());
    var option_template = Handlebars.compile($("#swap-select-option-template").html());

    if (!this.options) {
      throw "No Swap Select options set";
    }

    // Valid to and from?
    if (typeof this.to !== "undefined" && this.collection.models) {
      this.$el.html(template({
        options: this.options
      }));
      this.$select = this.$el.find('select.swap-select');
      //an empty option is required to allow placeholder to work
      if(this.options.placeholder){
        this.$select.append("<option></option>");
      }

      // Build to & from
      _.each(this.collection.models, function(item) {
        var guid = item.get(self.uid);
        var selected = (self.to.indexOf(guid) !== -1);

        self.$select.append(option_template({
          name: item.get(self.options.from_name_key),
          value: guid,
          selected: selected
        }));
      });

      this.$select.select2({
        placeholder: this.options.placeholder || "Select an Item"
      });
    }

    return this;
  },

  selected: function(el) {
    return this.$select.val();
  }
});