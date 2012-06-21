(function () {
  "use strict";
  
  application.jqplot = application.jqplot || {};
    
  application.jqplot.GeoChartPainter = application.ChartPainter.extend({
    
    init: function () {
      
    },

    draw: function (data, container, opts, callback) {
      var self = this;
      
      if ('undefined' === typeof $fw.data.get('geochartloaded')) {
        $fw.data.set('geochartloaded', true);
        self.loadMapScript(data, container, opts, callback);
      }
      else {
        self.initMap(data, container, opts, callback);
      }
    },
    
    initMap: function (data, container, opts, callback) {
      var table, options, geochart;
      
      table = google.visualization.arrayToDataTable(data, false);
      options = {
        width: 740,
        height: 475
      };

      geochart = new google.visualization.GeoChart(container[0]);
      geochart.draw(table, options);
      callback();
      
      /* chart region zooming. Currently zooms in to country level. 
       * google.visualization.events.addListener(geochart, 'regionClick', function(event) {
        Log.append('clicked region: ' + event.region);
        geochart.draw(table, $.extend(true, {}, options, { region: event.region }));
      });*/
      
      google.visualization.events.addListener(geochart, 'error', function(event) {
        Log.append('Geochart error: ' + JSON.stringify(event), 'ERROR');
        $fw.client.dialog.error(JSON.stringify(event));
      });
    },
    
    loadMapScript: function (data, container, opts, callback) {
      var self = this;
      
      setTimeout(function () {
        if ('undefined' !== typeof google) {
          google.load('visualization', '1', {
            packages: ['geochart'],
            callback: function () {
              self.initMap(data, container, opts, callback);
            }
          });
        }
        else {
          Log.append('Unable to load visualisation API', 'ERROR');
        }
      }, 100);
    }
  });
}());