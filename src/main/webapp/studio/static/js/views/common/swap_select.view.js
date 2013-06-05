var App = App || {};
App.View = App.View || {};
App.View.SwapSelect = Backbone.View.extend({
  options: null,

  initialize: function(options) {
    _.bindAll(this);
    this.options = options;
    this.to = options.to;
    this.uid = options.uid || 'guid';
    this.collection = options.from;
    this.collection.fetch();
    this.collection.bind('sync reset', this.render, this);
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
      if(this.options.placeholder){
        self.$select.attr("data-placeholder", this.options.placeholder);
        self.$select.append("<option></option>");
      }
      var renderOptions = function(models, el){
        _.each(models, function(item) {
          var guid = item.get(self.uid);
          var selected = (self.to.indexOf(guid) !== -1);

          el.append(option_template({
            name: item.get(self.options.from_name_key),
            value: guid,
            selected: selected
          }));
        });
      };

      if(self.options.groupBy){
        var groups = {};
        _.each(this.collection.models, function(item){
           var group = item.get([self.options.groupBy]);
           if(groups[group]){
             groups[group].push(item);
           } else {
             groups[group] = [item];
           }
        });
        _.each(groups, function(value, key){
          console.log(key);
           var optgroup = $("<optgroup>", {label: key});
           renderOptions(value, optgroup);
           self.$select.append(optgroup);
        });
      } else {
        // Build to & from
        renderOptions(this.collection.models, self.$select);
      }

      var placeholder = this.options.placeholder || "Select an Item";

      this.$select.select2({
        //placeholder:placeholder
      });
    }

    return this;
  },

  selected: function(el) {
    return this.$select.val();
  }
});