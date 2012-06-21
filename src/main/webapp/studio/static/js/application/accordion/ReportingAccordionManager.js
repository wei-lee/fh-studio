(function () {
  "use strict";

  application.ReportingAccordionManager = application.AccordionManager.extend({
    reportsEnabled: false,
    metricsEnabled: false,
    
    METRIC_APPINSTALLS_DEST: 'appinstallsdest',
    METRIC_APPINSTALLS_GEO: 'appinstallsgeo',
    METRIC_APPSTARTUPS_DEST: 'appstartupsdest',
    METRIC_APPSTARTUPS_GEO: 'appstartupsgeo',
    
    inited: {},

    init: function (accordion_name) {
      this.reportsEnabled = 'true' === $fw.getClientProp('reporting-reports-enabled');
      this.metricsEnabled = 'true' === $fw.getClientProp('reporting-metrics-enabled');

      var accordionMenu, metrics, ti, tl, temp, li, a;

      if (this.reportsEnabled) {
        if (this.metricsEnabled) {
          $('#accordion_item_flurry').next().remove().end().remove();
          $('#accordion_item_reports').next().remove().end().remove();
        } else {
          $('#accordion_item_flurry').next().remove().end().remove();
          $('#accordion_item_metrics').next().remove().end().remove();
        }
      } else {
        $('#accordion_item_reports').next().remove().end().remove();
        $('#accordion_item_metrics').next().remove().end().remove();
      }

      this._super(accordion_name);
    },

    preSelectCatchAll: function () {
      if (!$fw.client.tab.reporting.accordion.reportsEnabled) {
        $('.reporting_container_header').hide();
      }
    },

    postSelectCatchAll: function (id, container) {
      var type, iframe;

      if (!$fw.client.tab.reporting.accordion.reportsEnabled) {
        if (container.find('iframe').length === 0) {
          type = (id.split('_')[1] === 'google') ? 'ga' : id.split('_')[1];
          iframe = $('<iframe>', {
            'width': '100%',
            'height': '100%',
            'class': 'reporting_iframe'
          });
          container.find('.section-body').append(iframe);
          iframe.attr('src', $fw.getClientProp('reporting-' + type));
        }
      }
    },

    preSelectReportingInstallsdate: function (id, container) {
      $fw.client.tab.reporting.accordion.preSelectReportingApps($fw.client.tab.reporting.accordion.METRIC_APPINSTALLS_DEST, 'line', id, container);
    },
    
    preSelectReportingInstallsdest: function (id, container) {
      $fw.client.tab.reporting.accordion.preSelectReportingApps($fw.client.tab.reporting.accordion.METRIC_APPINSTALLS_DEST, 'pie', id, container);
    },

    preSelectReportingInstallsloc: function (id, container) {
      $fw.client.tab.reporting.accordion.preSelectReportingApps($fw.client.tab.reporting.accordion.METRIC_APPINSTALLS_GEO, 'geo', id, container);
    },
    
    preSelectReportingStartupsdate: function (id, container) {
      $fw.client.tab.reporting.accordion.preSelectReportingApps($fw.client.tab.reporting.accordion.METRIC_APPSTARTUPS_DEST, 'line',id, container);
    },
    
    preSelectReportingStartupsdest: function (id, container) {
      $fw.client.tab.reporting.accordion.preSelectReportingApps($fw.client.tab.reporting.accordion.METRIC_APPSTARTUPS_DEST, 'pie',id, container);
    },
    
    preSelectReportingStartupsloc: function (id, container) {
      $fw.client.tab.reporting.accordion.preSelectReportingApps($fw.client.tab.reporting.accordion.METRIC_APPSTARTUPS_GEO, 'geo', id, container);
    },

    preSelectReportingApps: function (metric, type, id, container) {
      if ('undefined' === typeof $fw.client.reporting) {
        $fw.client.reporting = new application.ReportingManager();
      }
      
      $fw.client.reporting.initMetric(metric, type, container, Constants.READ_APP_METRICS_URL);
    }
    
  });
}());