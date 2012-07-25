var Stats = Stats || {};
Stats.View = Stats.View || {};
Stats.View.Table = Stats.View.Table || {};

Stats.View.Table.Base = Class.extend({
  controller: null,
  model: null,
  series: null,
  series_name: null,
  renderTo: null,

  init: function(params) {
    this.controller = params.controller;
    this.model = params.model;
    this.series = params.series.all_series;
    this.series_name = params.series.series_name;
    this.renderTo = '#' + this.series_name + '_container .table_container';
    log('Initialising table view');
  },

  render: function(model) {
    log('rendering table');
    var self = this;
    var table_container = this.getTableContainer();
    this.emptyTableContainer();
    self.renderSeries();
  },

  renderSeries: function() {
    var self = this;
    var all_series = this.series;
    this.emptyTableContainer();

    // Table for each series
    $.each(all_series, function(i, series){
      log('Table rendering series: ' + series.name);

      // New table for series
      var table_id = 'table_' + series.name;
      self.createTable(series.name, table_id);
      self.createTableHeader(table_id, ['Time', 'Value']);

      var series_max = self.model.seriesMax(series);
      var table = $('#' + table_id);

      $.each(series.data, function(i, item) {
        self.renderSeriesItem(i, item, table, series_max, series.name);
      });
    });
  },

  renderSeriesItem: function(i, item, table, series_max, series_name) {
    // [timestamp, value]
    var timestamp = this.formatTimestamp(item[0]);
    var value = this.formatValue(item[1]);
    var odd = '';
    if (i % 2) {
      odd = 'odd';
    }

    var width = ((value / series_max) * 100).toFixed(0);
    var row_class = 'row_' + series_name + '_' + i;
    var row = table.append('<tr class="row ' + odd + ' ' + row_class + '"><td class="gauge timestamp">' + timestamp + '</td><td class="gauge value">' + value + '<div class="line_chart"><div class="line_chart_inner"></div></div></td></tr>');
    $('.' + row_class + ' .line_chart_inner').css("width", width + "%");

    var series_color = this.model._colourForSeries(series_name);
    $('.' + row_class + ' .line_chart_inner').css("background-color", series_color);
  },

  createTable: function(series_name, table_id) {
    var container = this.getTableContainer();
    var header = $('<h4>', {'class': 'table_header', text: series_name});
    container.append(header);
    container.append('<table id="' + table_id + '" class="chart_table" cellpadding="0" cellspacing="0" border="0"></table>');
  },

  getTableContainer: function() {
    return $(this.renderTo);
  },

  emptyTableContainer: function() {
    var container = this.getTableContainer();
    container.empty();
  },

  createTableHeader: function(table_id, headers) {
    var table = $('#' + table_id);
    table.append('<thead><tr></tr></thead>');
    $.each(headers, function(i, item) {
      $('thead tr', table).append('<th>' + item + '</th>');
    });
  }
});