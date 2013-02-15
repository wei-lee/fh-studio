var Stats = Stats || {};
Stats.View = Stats.View || {};

Stats.View.Chart = Class.extend({
  controller: null,
  model: null,
  series: null,
  series_name: null,
  renderTo: null,
  liveChart: false,
  options: {},
  highChart: null,
  showLastUpdated: false,
  buffer:[],

  init: function(params) {
    this.controller = params.controller;
    this.model = params.model;
    this.series = params.series.all_series;
    this.series_name = params.series.series_name || params.series_name;
    this.formatted_name = params.formatted_name;
    this.renderTo = params.renderTo || '#' + this.series_name + '_list_item .chart_container';
    if(params.live){
      this.liveChart = true;
    }
    if(params.options){
      this.options = params.options;
    }
    if(params.showLastUpdated){
      this.showLastUpdated = params.showLastUpdated;
    }
    console.log('Initialising chart view');
  },

  render: function() {
    var self = this;

    // Reset chart container
    var container = $(self.renderTo);
    container.empty();

    var series_data = this.series;
    var series_name = this.series_name;

    var chartOpts = {
      renderTo: container[0],
      zoomType: 'x',
      spacingRight: 20
    };

    if(this.liveChart){
      chartOpts.events = {
        load: function(){
          if(self.model.addListener){
            self.updateListener = function(data){
              var series = chart.series[0];
              var dataToAdd = data[self.series_name].series[self.series_name].data;
              if(container.parents(":hidden").length > 0){
                //this view is hidden, do not add the point to the chart as it may cause the labels of yAxis to be missing.
                //instead, put it in the buffer
                console.log("chart is hidden, add to the buffer. name: " + self.series_name);
                self.buffer = self.buffer.concat(dataToAdd);
              } else {
                if(self.buffer.length > 0){
                  dataToAdd = self.buffer.concat(dataToAdd);
                }
                console.log("chart is showing, add points to the chart. name: "+self.series_name+" Total points: " + dataToAdd.length);
                for(var p=0;p<dataToAdd.length;p++){
                  series.addPoint(dataToAdd[p], false, true);
                };
                chart.redraw();
                self.buffer = [];
                if(self.showLastUpdated){
                  self.updateLastUpdated(container);
                }
              }
            }
            self.model.addListener(self.updateListener);
          };
        }
      }
    }

    var chart = new Highcharts.Chart({
      credits: {
        enabled: false
      },
      chart: chartOpts,
      legend: self.options.legend || {
        layout: 'horizontal',
        verticalAlign: 'top',
        backgroundColor: '#FFFFFF',
        shadow: true
      },
      scrollbar: {
        enabled: true
      },
      navigator : {
        enabled : true
      },
      rangeselector: {
        enabled: true
      },
      title: {
        text: self.options.title || series_name
      },
      xAxis: {
        minPadding: 1,
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          month: '%e. %b',
          year: '%b'
        },
        range: 600 * 1000 // 10 minutes
      },
      exporting: {
        buttons: {
          exportButton: {
            menuItems: [{
              text: 'Export to PDF',
              onclick: function() {
                var self = this;
                this.exportChart({
                  type: 'application/pdf',
                  filename: self.model_series.name
                });
              }
            }, {
              text: 'Export to PNG',
              onclick: function() {
                var self = this;
                this.exportChart({
                  type: 'image/png',
                  filename: self.model_series.name
                });
              }
            }, {
              text: 'Export to CSV',
              onclick: function() {
                console.log('Exporting to CSV.');
                var model = this.view.model;
                var filename = model.name + '.csv';

                // Call back to the model to export this series as CSV
                var csv = this.view.model.getCSVForSeries(this.model_series);
                var content_type = 'csv';
                this.view.controller.doExport(filename, csv, content_type);
              }
            },
            null, null]
          }
        }
      },
      yAxis: self.options.yAxis || {
        title: {
          text: 'values'
        },
        min: 0
      },
      tooltip: self.options.tooltip || {
        formatter: function() {
          var timestamp = moment(this.x).format("MMM D, HH:mm:ss");
          return '<b>' + this.series.name + '</b><br/>' + timestamp + ': ' + this.y;
        }
      },
      series: series_data
    });

    chart.view = self;
    chart.model_series = series_data;

    if(self.showLastUpdated){
      self.addLastUpdated(container);
    }

    if(!self.liveChart){
      self.addRefreshButton(container.closest('li').find('h3'));
    } else {
      //To fix a bug where if the chart become hidden before the first live point is added, there will be a DOM error thrown
      chart.redraw();
    }

    self.highChart = chart;

  },

  destroy: function(){
    var self = this;
    if(this.highChart && this.highChart.destroy){
      this.highChart.destroy();
      this.highChart = undefined;
    }
    if(self.updateListener){
      if(self.model.removeListener){
        self.model.removeListener(self.updateListener);
      }
    }
    $(this.renderTo).empty();
  },

  addRefreshButton: function (container) {
    var self = this;

    // remove refresh buttons from all other items
    container.closest('ul').find('li h3 button').remove();

    // add refresh button to current item
    var refreshButton = $('<button>', {
      "class": "btn pull-right",
      "text": Lang.stats_refresh_button
    });
    refreshButton.bind('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.controller.show();
    });
    container.append(refreshButton);
  },

  addLastUpdated: function(container){
    var lastUpdated = $("<span>", {"class":'pull-right last_update_text', text:"Last Updated: " + moment(this.model.lastUpdated()).format("h:mm:ss a")});
    container.append(lastUpdated);
  },

  updateLastUpdated: function(container){
    container.find(".last_update_text").text("Last Updated: " + moment(this.model.lastUpdated()).format("h:mm:ss a"));
  }
});