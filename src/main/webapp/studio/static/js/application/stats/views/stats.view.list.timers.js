Stats.View.List.Timers = Stats.View.List.extend({
  init: function(params) {
    this._super(params);
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
        "text": series_name
      }));
      var list_containers = '<div class="' + series_name + '_container"><div class="chart_container"></div></div>';
      $(self.renderTo).append(list_item);
      list_item.append(list_containers);

      // Bind click
      $('h3', list_item).unbind().click(function() {
        self.controller.toggleTimerStats(this, self.model, series_name);
      });
    });
  }
});