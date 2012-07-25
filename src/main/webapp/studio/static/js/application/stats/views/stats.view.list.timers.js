Stats.View.List.Timers = Stats.View.List.extend({
  init: function(params) {
    this._super(params);
  },

  render: function() {
    log('Rendering List');
    var self = this;
    $(self.renderTo).empty();
    var all_series = this.model.getAllSeriesNames();
    $.each(all_series, function(i, series_name) {
      var list_item = '<li id="' + series_name + '_list_item"><h3>' + series_name + '</h3></li>';
      var list_containers = '<div id="' + series_name + '_container"><div class="chart_container"></div><div class="table_container"></div></div>';
      $(self.renderTo).append(list_item);
      $('#' + series_name + '_list_item').append(list_containers);

      // Bind click
      $('#' + series_name + '_list_item h3').unbind().click(function() {
        self.controller.toggleTimerStats(this, self.model, series_name);
      });
    });
  }
});