Stats.View.List = Class.extend({
  model: null,
  controller: null,
  renderTo: null,

  init: function(params) {
    this.controller = params.controller;
    this.model = params.model;
    this.renderTo = params.renderTo;
  },

  formatSeriesName: function (name) {
    // do nothing by default
    // overwrite if needed
    return name;
  },

  render: function() {
    console.log('Rendering List');
    var self = this;
    $(self.renderTo).empty();
    var all_series = this.model.getAllSeriesNames();
    $.each(all_series, function(i, series_name) {
      var list_item = $('<li>', {
        "id": series_name + '_list_item'
      }).append($('<h3>', {
        "text": self.formatSeriesName(series_name)
      }));
      var list_containers = '<div class="' + series_name + '_container"><div class="chart_container"></div></div>';
      $(self.renderTo).append(list_item);
      list_item.append(list_containers);

      // Bind click
      $('h3', list_item).unbind().click(function() {
        self.controller.toggleStats(this, self.model, series_name);
      });
    });
  }
});