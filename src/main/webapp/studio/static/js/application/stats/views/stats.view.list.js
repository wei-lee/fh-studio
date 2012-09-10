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

    if (_.isEmpty(all_series)) {
      // no stats, show some message saying just that
      var statsDocs = $fw.getClientProp('stats-docs');
      $(self.renderTo).append($('<p>', {
        "html": Lang.stats_empty.replace('%stats_docs%', '<a href="' + statsDocs + '" target="_blank">here</a>')
      }));
    } else {
      $.each(all_series, function(i, series_name) {
        var formatted_name = self.formatSeriesName(series_name);
        var list_item = $('<li>', {
          "id": series_name + '_list_item'
        }).append($('<h3>', {
          "text": formatted_name
        }));
        var list_containers = '<div class="' + series_name + '_container"><div class="chart_container"></div></div>';
        $(self.renderTo).append(list_item);
        list_item.append(list_containers);

        // Bind click
        $('h3', list_item).unbind().click(function (e) {
          self.renderChart(series_name, formatted_name);
        });
      });
    }
  },

  renderChart: function (series_name, formatted_name) {
    var self = this;

    self.controller.toggleStats(this, self.model, function () {
      var series = self.model.getSeries(series_name);

      var chart = new Stats.View.Chart({
        model: self.model,
        series: series,
        series_name: series_name,
        formatted_name: formatted_name,
        controller: self.controller
      });
      chart.render();
    });
  }
});