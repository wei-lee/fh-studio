var Stats = Stats || {};
Stats.View = Stats.View || {};

Stats.View.Chart = Class.extend({
  controller: null,
  model: null,
  series: null,
  series_name: null,
  renderTo: null,
  liveChart: false,
  options: null,

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
      options = prams.options;
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
    console.log(series_data);

    var chartOpts = {
      renderTo: container[0],
      zoomType: 'x',
      spacingRight: 20
    };

    if(this.liveChart){
      chartOpts.events = {
        load: function(){
          if(self.model.getDataSinceLastUpdate){
            setInterval(function(){
              self.model.getDataSinceLastUpdate(function(data){
                if(null !== data){
                  var series = chart.series[0];
                  var dataToAdd = data[self.series_name].series[self.series_name].data;
                  //TODO: is there a better way to do this?
                  for(var p=0;p<dataToAdd.length;p++){
                    series.addPoint(dataToAdd[p], true, true);
                  };
                };
              });
            }, 5000);
          }
        }
      }
    }

    var chart = new Highcharts.Chart(self.options || {
      credits: {
        enabled: false
      },
      chart: chartOpts,
      legend: {
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
        text: series_name
      },
      xAxis: {
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
      yAxis: {
        title: {
          text: 'values'
        },
        min: 0
      },
      tooltip: {
        formatter: function() {
          var timestamp = moment(this.x).format("MMM D, HH:mm:ss");
          return '<b>' + this.series.name + '</b><br/>' + timestamp + ': ' + this.y;
        }
      },
      series: series_data
    });

    chart.view = self;
    chart.model_series = series_data;

    if(!self.liveChart){
      self.addRefreshButton(container.closest('li').find('h3'));
    }
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
  }
});