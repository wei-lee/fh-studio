var Apps = Apps || {};

Apps.Reports = Apps.Reports || {};

Apps.Reports.Support = Apps.Controller.extend({
  DAY: 86400000,
  sampledataEnabled: false,

  init: function () {
    this.initFn = _.once(this.initBindings);
    this.sampledataEnabled = 'true' === $fw.getClientProp('reporting-sampledata-enabled');
  },

  initBindings: function (container) {
    var self = this;

    $(container + ' .nav li a').bind('click', function () {
      // bind to configured callback
      var el = $(this);
      var action = el.data('action');

      self[action]();
    });
  },

  reset: function () {
    // FIXME: is this necessary? carry over from $fw.app.resetApp()
    $(".appreport-results").empty();
  },

  show: function(container){
    this._super();

    // FIXME: is this necessary? carry over from $fw.app.resetApp()
    $(".appreport-results").empty();
    
    this.hide();

    this.container = container;
    $(this.container).show();

    this.initFn();

    // if a tab is already visible, reclick it, otherwise, click first visible tab
    var itemToClick = $(container + ' .nav li.active:visible a');
    if (itemToClick.length === 0) {
      itemToClick = $(container + ' .nav li:visible a:eq(0)');
    }
    itemToClick.trigger('click');
  },
    
  initMetric: function (metric, type, container, url, appid) {
    var self = this;
    
    self.url = url;
    self.appid = appid;
    console.log("set self.appid to: " + appid);
    
    if ('undefined' === typeof self[metric + '_' + type]) {
      self[metric + '_' + type] = true;

      // Populate app and date dropdown
      self.doOptions(container, !appid);
      
      $fw.client.lang.insertLangForContainer(container);
      
      if ('line' === type) {
        container.find('.appreport-radio').buttonset().bind('change', function () {
          console.log('buttonset radio changed: ' + $(this).find(':checked').attr('id'));
          if (container.find('.jqplot-target').length > 0) {
            container.find('.appreport-button').trigger('click');
          }
        });
      }
      
      container.find('.appreport-button').bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var params, app, tempFDate, tempTDate, days, dest;

        tempFDate = container.find('.appreportfrom-datepicker').datepicker('getDate');
        tempTDate = container.find('.appreportto-datepicker').datepicker('getDate');
        
        days = self.daysBetweenDates(tempFDate, tempTDate);
        
        if (self.appid) {
          app = self.appid;
        } else {
        app = container.find('.appreport-applist option:selected').val();
      }

        params = {
          id: app,//'7BmC8jo_jd4aQuvT6CSCzmWa',
          metric: metric,
          from: self.splitDate(tempFDate),
          to: self.splitDate(tempTDate),
          days: days
        };
        
        dest = container.find('.appreport-radio :checked').hasClass('appreport-radio-dest');
        if (dest) {
          params.dest = true;
        }
        
        console.log('metrics request: ' + JSON.stringify(params));
        container.find('.appreport-results').empty();
        
        self.drawChart(type, container, params, self.url, function (err) {
          if (err) {
            console.log('drawChart failed: ' + err.code +' :: ' + err.message);
          } else {
            container.find('.appreport-download-button').data('chart', params);
            
            if (!self.sampledataEnabled) {
              container.find('.appreport-download-button').show();
            }
          }
        });
      });
    }
    
  },

  doOptions: function (container, getAppsList) {
  if (getAppsList) {
      var appslist, url, params;

      url = Constants.LIST_APP_METRICS_APPS_URL;
      params = {};
      appslist = container.find('.appreport-applist').empty();

      $fw.server.post(url, params, function (result) {
        if ('ok' === result.status) {
          var ri, rl, tempResult, options = [], values = [], results;

          results = result.payload.results;
          for (ri = 0, rl = results.length; ri < rl; ri += 1) {
            tempResult = results[ri];
            options.push(tempResult.title);
            values.push(tempResult.app);
          }
          HtmlUtil.constructOptions(appslist, options, values);
          container.find('.appreport-button').trigger('click');
        } else {
          $fw.client.dialog.error(result.message);
        }
      });
   }  else {
     container.find('.appreport-applist').hide();
   }
    
    container.find('.appreportfrom-datepicker').datepicker({
      dateFormat: "yy-mm-dd",
      maxDate: "-2",
      defaultDate: -8
    }).datepicker('setDate', -8);
    
    container.find('.appreportto-datepicker').datepicker({
      dateFormat: "yy-mm-dd",
      maxDate: "-1",
      defaultDate: -1
    }).datepicker('setDate', -1);
  },
  
  drawChart: function (type, container, params, url, callback) {
    var chartContainer;
    
    // Set an id on the chart container, needed later
    chartContainer = container.find('.appreport-results').attr('id', container.attr('id') + '_chartcontainer');
           
    // Draw a chart for the specified params
    
    $fw.client.chart.insert('metrics', type, { dest: params.dest }, params, chartContainer, url, function (err) {
      callback(err);
    });
  },
  
  /*
   * Splits a Date into an object containing year, month and date
   */
  splitDate: function (date) {
    var ret = {};
    
    ret.year = date.getFullYear().toString();
    ret.month = (date.getMonth() + 1).toString();
    ret.date = date.getDate().toString();
    
    return ret;
  },
  
  /*
   * Return the number of days between two Dates
   */
  daysBetweenDates: function (from, to) {
    var self = this, days;
    
    days = Math.round((to.getTime() - from.getTime()) / self.DAY);
    
    return days;
  },
  
  initGeo: function (container) {
    if ('undefined' === typeof $fw.client.geoview) {
      $fw.client.geoview = new application.GeoViewManager();
    }
    
    $fw.client.geoview.showMap(container);
  }
});