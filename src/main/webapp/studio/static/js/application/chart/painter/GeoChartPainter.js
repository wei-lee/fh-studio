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
        width: opts.width || 740,
        height:opts.height || 475
      };

      geochart = new google.visualization.GeoChart(container[0]);

      geochart.draw(table, options);
      callback();
      
      /* chart region zooming. Currently zooms in to country level. 
       * google.visualization.events.addListener(geochart, 'regionClick', function(event) {
        console.log('clicked region: ' + event.region);
        geochart.draw(table, $.extend(true, {}, options, { region: event.region }));
      });*/
      
      google.visualization.events.addListener(geochart, 'error', function(event) {
        console.log('Geochart error: ' + JSON.stringify(event), 'ERROR');
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
          console.log('Unable to load visualisation API', 'ERROR');
        }
      }, 100);
    }
  });
}());