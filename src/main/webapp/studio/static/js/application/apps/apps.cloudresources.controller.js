var Apps = Apps || {};

Apps.Cloudresources = Apps.Cloudresources || {};

Apps.Cloudresources.Controller = Apps.Cloud.Controller.extend({
  WARNING_LEVEL: 60,
  DANGER_ZONE: 80,
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

  init: function() {
    this._super();
    this.enabled_live_app_resources = 'true' === $fw.getClientProp('live-app-resource-enabled');
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super(this.views.cloudresources_container);
    this.initFn();
    $(this.container).show();
    if(this.enabled_live_app_resources){
      $('a[data-toggle="pill"]:eq(0)', this.conatiner).trigger("click");
    } else {
      this.renderDashboard();
    }
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

      jqEl.button('loading');

      self.showResources(function() {
        jqEl.button('reset');
      });
    });
  },

  renderDashboard: function(pane){
    if(!this.dashboard_rendered){
      $('.cloud_refresh_button', $(this.container)).trigger('click');
      this.dashboard_rendered = true;
    }
  },

  renderLiveChart: function(type, pane){
    var self = this;
    if(!self[type+"_rendered"]){
      if(!self.models.stats.gauge){
        var cloudEnv = $fw.data.get('cloud_environment');
        var model = new Stats.Model.Historical.Gauges({
          deploy_target: cloudEnv,
          stats_type: "app",
          stats_container: pane
        });
        var data = null;
        model.load({
          loaded: function(res) {
            console.log(type + ' stats loaded');
            self.models.stats.gauge = model;
            if (res.status == 'ok') {
              self.renderChart(model, type, pane);
            } else {
              console.log("Couldn't load stats: " + model.name);
              self.showNoData(type, pane);
            }
          }
        });
      } else {
        self.renderChart(self.models.stats.gauge, type, pane);
      }
      self[type+"_rendered"] = true;
    }
  },

  renderChart: function(model, type, pane){
    var self = this;
    var series = model.getSeries(type);
    if(series.all_series.length === 0){
      self.showNoData(type, pane);
      return;
    }

    var chart = new Stats.View.Chart({
      model: model,
      series: series,
      series_name: type,
      formatted_name: type,
      controller: self,
      renderTo: pane,
      live: true
    });
    chart.render();
  },

  showNoData: function(type, pane){
    var failed = $("<li>", {
      "class": "load_failed",
      text: "No "+ type + " data is currently available for this app."
    });
    $(pane).empty().append(failed);
  },

  showResources: function(cb) {
    var self = this;
    var guid = $fw.data.get('inst').guid;
    var currentContainer = $('#resource_current_container', this.container);

    this.initialiseCpuGauge($('#cloud_cpu .cloud_cpu_container', currentContainer)[0]);

    var cloudEnv = $fw.data.get('cloud_environment');
    this.models.appresource.current(guid, cloudEnv, function(res) {
      if (res != null && res.data != null) {
        self.hideAlerts();
        var data = res.data;

        if (data.usage != null) {
          // CPU
          var cpuPoint = self.cpuChart.series[0].points[0];
          if (cpuPoint != null) {
            if (data.usage.cpu != null) {
              cpuPoint.update(data.usage.cpu);
            } else {
              // TODO: show n/a ui
            }
          }

          // Memory
          if (data.usage.mem != null) {
            self.updateResourceBar($('#cloud_memory', self.container), data.usage.mem, data.max.mem);
          } else {
            self.showNAResourceBar($('#cloud_memory', self.container));
          }

          // Storage
          if (data.usage.disk != null) {
            self.updateResourceBar($('#cloud_storage', self.container), data.usage.disk, data.max.disk);
          } else {
            self.showNAResourceBar($('#cloud_storage', self.container));
          }
        }

        cb();
      } else {
        self.showAlert('error', 'Error getting resource data. Please make sure your App is deployed to \'' + cloudEnv + '\' environment (res.data is undefined)');
        self.resetResource();
        cb();
      }
    }, function(err) {
      self.showAlert('error', 'Error getting resource data. Please make sure your App is deployed to \'' + cloudEnv + '\' environment (' + (err.message != null ? err.message : err) + ')');
      self.resetResource();
      cb();
    });

    // TODO: if adding this back in, need to use async.parallel to ensure cb is only
    //       called when both are done
    // this.models.appresource.history(guid, function (res) {
    //   historyContainer.text(JSON.stringify(res.data));
    // }, function (err) {
    //   self.showAlert('error', 'Error getting resource history:' + err);
    // });
  },

  updateResourceBar: function(container, used, max) {
    $('.resource_used', container).text(this.bytesToMB(used));
    $('.resource_max', container).text(this.bytesToMB(max));


    var usedPercentage = (used / max) * 100;
    // TODO: put % value in dom too??
    $('.bar-danger', container).css('width', usedPercentage + '%');
    $('.bar-info', container).css('width', (100 - usedPercentage) + '%');
  },

  showNAResourceBar: function(container) {
    $('.resource_used', container).text('n/a');
    $('.resource_max', container).text('n/a');

    $('.bar-danger', container).css('width', '0%');
    $('.bar-info', container).css('width', '100%');
  },

  resetResource: function() {
    var self = this;
    var cpuPoint = self.cpuChart.series[0].points[0];
    cpuPoint.update(0);
    self.showNAResourceBar($('#cloud_memory', self.container));
    self.showNAResourceBar($('#cloud_storage', self.container));
  },

  bytesToMB: function(bytes) {
    function toFixed(num, precision) {
      return num.toFixed != null ? num.toFixed(precision) : num;
    }
    return '' + toFixed(bytes / 1000 / 1000) + ' MB';
  },

  initialiseCpuGauge: function(container) {
    var self = this;

    if (this.cpuChart == null) {
      this.cpuChart = new Highcharts.Chart({

        exporting: {
          enabled: false
        },

        credits: {
          enabled: false
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

        title: false,
        pane: {
          startAngle: -90,
          endAngle: 90,
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
          min: 0,
          max: 100,
          lineColor: '#339',
          tickColor: '#339',
          minorTickColor: '#339',
          offset: 0,
          lineWidth: 0,
          labels: {
            distance: 18,
            rotation: 'auto',
            formatter: function() {
              return this.value + '%';
            }
          },
          title: $fw.client.lang.getLangString('cloudresource_cpu_title'),
          tickLength: 0,
          minorTickLength: 0,
          endOnTick: false,
          plotBands: [{
            from: 0,
            to: self.WARNING_LEVEL,
            color: '#55BF3B',
            // green
            innerRadius: '100%',
            outerRadius: '115%'
          }, {
            from: self.WARNING_LEVEL,
            to: self.DANGER_ZONE,
            color: '#DDDF0D',
            // yellow
            innerRadius: '100%',
            outerRadius: '115%'
          }, {
            from: self.DANGER_ZONE,
            to: 100,
            color: '#DF5353',
            // red
            innerRadius: '100%',
            outerRadius: '115%'
          }]
        }],

        series: [{
          name: 'Usage',
          data: [0],
          tooltip: {
            valueSuffix: '%'
          }
        }]
      });
    }
  }
});