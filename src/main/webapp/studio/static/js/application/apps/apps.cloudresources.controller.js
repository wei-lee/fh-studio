var Apps = Apps || {};

Apps.Cloudresources = Apps.Cloudresources || {};

Apps.Cloudresources.Controller = Apps.Cloud.Controller.extend({
  WARNING_LEVEL: 0.6,
  DANGER_ZONE: 0.8,
  // ✈
  // ✈ ✈
  // ✈
  models: {
    appresource: new model.AppResource(),
    stats:{}
  },

  views: {
    cloudresources_container: "#cloudresources_container"
  },

  rendered_views:{},
  live_charts: {},
  titleMap: {"Cpu_Pct":'CPU', "VmRSS": 'Memory', "Disk":"Storage"},

  init: function() {
    this._super();
    this.enabled_live_app_resources = $fw.getClientProp('live-app-resource-enabled') == null ? true : ($fw.getClientProp('live-app-resource-enabled') == 'true');
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super(this.views.cloudresources_container);
    this.initFn();
    this.resetCharts();
    $(this.container).find('.nav-pills > li.active').removeClass('active');
    $(this.container).show();
    if(this.enabled_live_app_resources){
      $('a[data-toggle="pill"]:eq(0)', this.conatiner).trigger("click");
    } else {
      this.renderDashboard();
    }
  },

  hide: function(){
    this._super();
    console.log("Leaving resource page, clear charts");
    this.resetCharts();
  },

  resetCharts: function(){
    this.dashboard_rendered = false;
    this.models.stats = {};
    this.rendered_views = {};
    if(this.gaugesCharts){
      for(var k in this.gaugesCharts){
        if(this.gaugesCharts.hasOwnProperty(k)){
          this.gaugesCharts[k].destroy();
        }
      }
    }
    for(var c in this.live_charts){
      if(this.live_charts.hasOwnProperty(c)){
        this.live_charts[c].destroy();
      }
    }
    this.gaugesCharts = {};
    this.live_charts = {};
    $(this.container).find('.resource_live_stats_link_container').hide();
  },

  initBindings: function() {
    var self = this;

    var jqContainer = $(this.container);
    $fw.client.lang.insertLangFromData(jqContainer);
    if(self.enabled_live_app_resources){
      $('a[data-toggle="pill"]', self.conatiner).on('shown', function(e){
        var dataType = $(e.target).data("type");
        var paneId = $(e.target).attr("href");
        console.log("data type is " + dataType + "paneId is " + paneId );
        if(dataType.toLowerCase() === "dashboard"){
          self.renderDashboard($(paneId + ' .stats_area', self.conatiner));
        } else {
          self.renderLiveChart(dataType, $(paneId + " .stats_area", self.container));
        }
      });
    }
    $('.cloud_refresh_button', jqContainer).bind('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var jqEl = $(this);

      jqEl.addClass('disabled').find('span').text('Refreshing...');

      self.renderDashboardPage(function() {
        jqEl.removeClass('disabled').find('span').text('Refresh');
      });
    });
  },

  renderDashboard: function(pane){
    if(!this.dashboard_rendered){
      $('.cloud_refresh_button', $(this.container)).trigger('click');
      this.dashboard_rendered = true;
    } else {
      for(var chart in this.gaugesCharts){
        this.gaugesCharts[chart].redraw();
      }
    }
  },

  renderLiveChart: function(type, pane){
    var self = this;
    if(!self.rendered_views[type+"_rendered"]){
      self.getModel(function(model){
        if(model){
          self.renderChart(self.models.stats.gauge, type, pane);
        } else {
          console.log("Couldn't load stats");
          self.showNoData(self.titleMap[type], pane);
        }
      });
      self.rendered_views[type+"_rendered"] = true;
    } else {
      self.live_charts[type].highChart.redraw();
    }
  },

  getModel: function(cb){
    var self = this;
    if(!self.models.stats.gauge){
      var cloudEnv = $fw.data.get('cloud_environment');
      var model = new Stats.Model.Live.Gauges({
        deploy_target: cloudEnv,
        stats_type: "resources",
        stats_container: null
      });
      var data = null;
      model.load({
        loaded: function(res) {
          if(res.status === "ok"){
            self.models.stats.gauge = model;
            cb(model);
          } else {
            cb(null);
          }
        }
      });
    } else {
      cb(self.models.stats.gauge);
    }
  },

  renderChart: function(model, type, pane){
    var self = this;
    var series = model.getSeries(type);
    console.log(series);
    if(series.all_series.length === 0){
      self.showNoData(self.titleMap[type], pane);
      return;
    }

    series.all_series[0].name = js_util.capitalise(self.titleMap[type]);
    var opts = {
      legend:{enabled:false},
      title:  js_util.capitalise(self.titleMap[type]) + " Usage (Real Time)",
      yAxis:{
        title:{text: null},
        min:0,
        max: self.maxValues[type],
        labels: {
          formatter: function(){
            return this.value + "%";
          }
        }
      },
      tooltip: {
        formatter: function() {
          var timestamp = moment(this.x).format("MMM D, HH:mm:ss");
          return '<b>' + timestamp + '</b><br/>' + this.series.name + ': ' + this.y + '%';
        }
      }
    };


    if(type.toLowerCase().indexOf("cpu") === -1){
      opts.yAxis.labels = {
        formatter: function(){
          return this.value/1000 + "MB";
        }
      };

      opts.tooltip = {
        formatter: function() {
          var timestamp = moment(this.x).format("MMM D, HH:mm:ss");
          return '<b>' + timestamp + '</b><br/>' + this.series.name + ': ' + this.y/1000 + "MB";
        }
      };
    }

    var chartView = new Stats.View.Chart({
      model: model,
      series: series,
      series_name: type,
      formatted_name: type,
      controller: self,
      renderTo: pane,
      live: true,
      options:opts,
      showLastUpdated: true,
      showDataTable: true,
      maxValue: self.maxValues[type]
    });
    chartView.render();
    self.live_charts[type] = chartView;
  },

  showNoData: function(type, pane){
    var failed = $("<li>", {
      "class": "load_failed",
      text: "No "+ type + " data is currently available for this app."
    });
    $(pane).empty().append(failed);
  },

  renderDashboardPage: function(cb){
    var self = this;
    var cloudEnv = $fw.data.get('cloud_environment');
    var resources = {'cpu':{unit: "%", min: 0, max:100, value: 0},
                     'memory':{unit:'MB', min:0, max:512, value: 0},
                     'storage':{unit:'MB', min:0, max:512, value: 0}};
    for(var resourceType in resources){
      var container = $('#resource_dashboard_' + resourceType + '_container', this.conatiner);
      self.initialiseGaugeChart(resourceType, container.find('.dashboard_resource_gauge')[0], resources[resourceType], true);
    }

    async.series([
        function(callback){
          self.loadResourcesForDashboard(resources, callback);
        },
        function(callback){
          self.loadStatsDataForDashboard(resources, callback);
        }
    ], function(err, results){
      self.hideGaugeChartsLoading();
      if(err){
        self.showAlert('error', 'Error getting resource data. Please make sure your App is deployed to \'' + cloudEnv + '\' environment (' + (err.message != null ? err.message : err) + ')');
        self.resetResource();
        cb();
        return;
      }
      if(results.length  === 2){
        var dynoresources = results[0];
        var model = results[1];
        var maxCpu = 100;
        var maxMem = self.bytesToMB(dynoresources.max.mem);
        var maxDisk = self.bytesToMB(dynoresources.max.disk);
        self.maxValues = {"VmRSS": dynoresources.max.mem/1000, "Disk": dynoresources.max.disk/1000, "Cpu_Pct": 100};
        var currentCpu = self.getCurrentResourceUsage(model, "Cpu_Pct", 1);
        var currentMemory = self.bytesToMB(self.getCurrentResourceUsage(model, "VmRSS", 1)*1000);
        var currentDisk = self.bytesToMB(self.getCurrentResourceUsage(model, "Disk", 1)*1000);
        if(!self.enabled_live_app_resources){
          currentCpu = dynoresources.usage.cpu;
          currentMemory = self.bytesToMB(dynoresources.usage.mem);
          currentDisk = self.bytesToMB(dynoresources.usage.disk);
        }
        self.updateGaugeChartValue('cpu', currentCpu, null, resources.cpu.unit);
        self.updateGaugeChartValue('memory', currentMemory, maxMem, resources.memory.unit);
        self.updateGaugeChartValue('storage', currentDisk, maxDisk, resources.storage.unit);
        var statsnamemap = {'cpu': 'Cpu_Pct', 'memory':'VmRSS', 'storage':'Disk'};
        $.each(statsnamemap, function(k, v){
          var typename = js_util.capitalise(k);
          var container = $('#resource_dashboard_'+k+'_container').find('.dashboard_resource_chart');
          var series = model.getSeries(v).all_series;
          if(series.length === 0){
            self.showNoData(typename, container);
            self.resetResource(k);
            return;
          } else {
            series[0].color = undefined;
          }
          if(self.enabled_live_app_resources){
            $('#resource_dashboard_'+k+'_container').find('.resource_live_stats_link_container').show().find("a").unbind('click').bind('click', function(e){
              e.preventDefault();
              e.stopPropagation();
              var targetContainer = $(this).attr("href");
              $(self.container).find('.nav').find('a[href="' +targetContainer+'"]').trigger('click');
            });
          }
          var chart = new Highcharts.Chart({
            exporting: {
              enabled: false
            },
            credits: {
              enabled: false
            },
            legend:false,
            chart:{
              renderTo: container[0],
              spacingRight: 20,
              type: "line"
            },
            title: {text: typename + ' Usage (Last Hour)'},
            xAxis: {
              lineWidth: 0,
              minorGridLineWidth: 0,
              lineColor: 'transparent',
              labels: {
                enabled: false
              },
              minorTickLength: 0,
              tickLength: 0
            },
            yAxis: {
              min: 0,
              max: self.maxValues[v],
              lineWidth: 0,
              minorGridLineWidth: 0,
              lineColor: 'transparent',
              labels: {
                enabled: false
              },
              minorTickLength: 0,
              tickLength: 0,
              title: {text: null}
            },
            tooltip: {
              formatter: function() {
                var value = this.y;
                if(k !== 'cpu'){
                  value += "B";
                }
                var timestamp = moment(this.x).format("MMM D, HH:mm:ss");
                return '<b>' + typename + ":" + value + '</b><br/>' + timestamp;
              }
            },
            series: series
          });
        });
      }
      cb();
    });

  },

  getCurrentResourceUsage: function(model, resource_name, valueIndex){
    var series = model.getSeries(resource_name).all_series;
    if(series.length > 0){
      var data = series[0].data;
      var current = data[data.length - 1][valueIndex];
      return current;
    } else {
      return 0;
    }
  },

  loadResourcesForDashboard: function(resources, cb){
    var self = this;
    var guid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');
    this.models.appresource.current(guid, cloudEnv, function(res) {
      if (res != null && res.data != null) {
        cb(undefined, res.data);
      } else {
        cb("Can not read resources.");
      }
    }, function(err) {
      cb(err);
    });
  },

  loadStatsDataForDashboard: function(resources, callback){
    var self = this;
    self.getModel(function(model){
      if(model){
        callback(undefined, model);
      } else {
        callback("error loading model");
      }
    });
  },

  updateGaugeChartValue: function(type, value, max, unit){
    //we actually re-create the charts because we can't update the gauge chart's extreme values
    var chart = this.gaugesCharts[type];
    chart.destroy();
    this.gaugesCharts[type] = undefined;
    var title = value + unit;
    if(max){
      title += "/" + max + unit;
    }
    this.initialiseGaugeChart(type, $('#resource_dashboard_' + type + '_container', this.conatiner).find('.dashboard_resource_gauge')[0], {unit: unit, min: 0, max: max || 100, value:value, title: title}, false);

  },

  hideGaugeChartsLoading: function(){
    for(var chart in this.gaugesCharts){
      this.gaugesCharts[chart].hideLoading();
    }
  },

  resetResource: function(type) {
    var self = this;
    var reset = function(chart){
      var point = chart.series[0].points[0];
      point.update(0);
      chart.setTitle({text:'N/A'});
    };
    if(type){
      var chart = this.gaugesCharts[type];
      reset(chart);
      return;
    } else {
      for(var c in this.gaugesCharts){
        reset(this.gaugesCharts[c]);
      }
      $.each(['cpu', 'memory', 'storage'], function(k ,v){
        $('#resource_dashboard_'+v+'_container').find('.resource_live_stats_link_container').hide();
        self.showNoData(v, $('#resource_dashboard_'+v+'_container').find('.dashboard_resource_chart'));
      });
    }
  },

  bytesToMB: function(bytes) {
    function toFixed(num, precision) {
      return num.toFixed != null ? num.toFixed(precision) : num;
    }
    return parseInt(toFixed(bytes / 1000 / 1000), 10);
  },

  initialiseGaugeChart: function(type, container, options, loading) {
    var self = this;
    if(!self.gaugesCharts){
      self.gaugesCharts = {};
    }

    if (self.gaugesCharts[type] == null) {
      var chart = new Highcharts.Chart({

        exporting: {
          enabled: false
        },

        credits: {
          enabled: false
        },

        lang: {
          "loading":""
        },

        loading: {
          labelStyle: {
            position: "relative",
            top: "2em"
          },
          style: {
            backgroundColor: 'gray'
          }
        },

        chart: {
          renderTo: container,
          type: 'gauge',
          alignTicks: false,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false,
          backgroundColor: null
        },

        title: {
          margin: 20,
          text:options.title || 'Loading...'
        },
        pane: {
          startAngle: -90,
          endAngle: 90,
          center: ["50%", "75%"],
          background: {
            backgroundColor: 'white',
            borderWidth: 0
          }
        },
        plotOptions: {
          gauge: {
            dial: {
              rearLength: 0,
              baseWidth: 10,
              baseLength: 5,
              radius: 100
            }
          }
        },

        yAxis: [{
          min: options.min,
          max: options.max,
          showLastLabel: true,
          lineColor: '#339',
          tickColor: '#339',
          minorTickColor: '#339',
          offset: 0,
          lineWidth: 0,
          labels: {
            distance: 18,
            rotation: 'auto',
            formatter: function() {
              return this.value + options.unit;
            }
          },
          title: $fw.client.lang.getLangString('cloudresource_cpu_title'),
          tickLength: 0,
          minorTickLength: 0,
          endOnTick: false,
          plotBands: [{
            from: 0,
            to: options.max*self.WARNING_LEVEL,
            color: '#55BF3B',
            // green
            innerRadius: '100%',
            outerRadius: '115%'
          }, {
            from: options.max*self.WARNING_LEVEL,
            to: options.max*self.DANGER_ZONE,
            color: '#DDDF0D',
            // yellow
            innerRadius: '100%',
            outerRadius: '115%'
          }, {
            from: options.max*self.DANGER_ZONE,
            to: options.max,
            color: '#DF5353',
            // red
            innerRadius: '100%',
            outerRadius: '115%'
          }]
        }],

        series: [{
          name: 'Usage',
          data: [options.value],
          tooltip: {
            valueSuffix: options.unit
          }
        }]
      });
      if(loading){
        chart.showLoading();
      }
      self.gaugesCharts[type] = chart;
    }
  }
});