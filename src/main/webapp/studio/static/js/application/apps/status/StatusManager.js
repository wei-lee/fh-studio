application.StatusManager = Class.extend({
  templates_map: {
    labels: {
      failed: '#ping_status_failed_label',
      success: '#ping_status_success_label',
      loading: '#ping_status_loading_label'
    },
    descriptions: {
      failed: '#ping_status_failed_description',
      success: '#ping_status_success_description',
      loading: '#ping_status_loading_description'
    }
  },

  init: function() {
    // Live by default
    this.deploy_target = 'live';
    this.stats_controller = new Stats.Controller({deploy_target: this.deploy_target});
  },

  show: function() {
    var self = this;
    Log.append('status.show');
    $fw_manager.client.preview.hideContent();
    this.stats_controller.closeAll();
    this.stats_controller.loadModels();
    this.bind();
    this.refreshAll();
  },

  changeStatsTarget: function(target) {
    // Change targets
    $('#deploy_target button').removeClass('btn-inverse');
    $('#deploy_target .'+target).addClass('btn-inverse');
    this.stats_controller.changeTarget(target);
    this.deploy_target = target;
  },

  bind: function() {
    Log.append('status.bind');
    var self = this;
    $('#refresh_dev_status').unbind().click(function() {
      Log.append('dev status.refresh');
      self.refreshDev();
    });
    $('#refresh_live_status').unbind().click(function() {
      Log.append('live status.refresh');
      self.refreshLive();
    });
    $('#deploy_target .dev').unbind().click(function() {
      Log.append('dev stats target');
      self.changeStatsTarget('dev');
    });
    $('#deploy_target .live').unbind().click(function() {
      Log.append('live stats target');
      self.changeStatsTarget('live');
    });
    $('#deploy_target .refresh').unbind().click(function() {
      Log.append('stats refresh');
      self.refresh();
    });
  },

  refresh: function() {
    if ($('#deploy_target .dev').hasClass('btn-inverse')) {
      // dev
      this.changeStatsTarget('dev');
    } else {
      // live
      this.changeStatsTarget('live');
    }
  },

  refreshDev: function() {
    var self = this;
    this.showDevLoading();
    this.pingDev(function(res) {
      // Ping OK
      self.showDevPingSuccess();
    }, function(res) {
      // Ping Failed
      self.showDevPingFailed();
    });
  },

  showPingSuccess: function(status_container, desc_container) {
    var self = this;
    $(status_container).empty();
    $(self.templates_map.labels.success).clone().show().appendTo(status_container).show();
    $(desc_container).empty();
    $(self.templates_map.descriptions.success).clone().show().appendTo(desc_container).show();
  },

  showDevPingSuccess: function() {
    var status_container = '#cloud_status .status_row.dev .status';
    var desc_container = '#cloud_status .status_row.dev .description';
    this.showPingSuccess(status_container, desc_container);
  },

  showLivePingSuccess: function() {
    var status_container = '#cloud_status .status_row.live .status';
    var desc_container = '#cloud_status .status_row.live .description';
    this.showPingSuccess(status_container, desc_container);
  },

  showPingFailed: function(status_container, desc_container) {
    var self = this;
    $(status_container).empty();
    $(self.templates_map.labels.failed).clone().show().appendTo(status_container).show();
    $(desc_container).empty();
    $(self.templates_map.descriptions.failed).clone().show().appendTo(desc_container).show();
  },

  showDevPingFailed: function() {
    var status_container = '#cloud_status .status_row.dev .status';
    var desc_container = '#cloud_status .status_row.dev .description';
    this.showPingFailed(status_container, desc_container);
  },

  showLivePingFailed: function() {
    var status_container = '#cloud_status .status_row.live .status';
    var desc_container = '#cloud_status .status_row.live .description';
    this.showPingFailed(status_container, desc_container);
  },

  refreshAll: function() {
    this.refreshDev();
    this.refreshLive();
  },

  refreshLive: function() {
    var self = this;
    this.showLiveLoading();
    this.pingLive(function(res) {
      // Ping OK
      self.showLivePingSuccess();
    }, function(res) {
      // Ping Failed
      self.showLivePingFailed();
    });
  },

  showLoading: function(status_container, desc_container) {
    var self = this;
    $(status_container).empty();
    $(self.templates_map.labels.loading).clone().show().appendTo(status_container).show();
    $(desc_container).empty();
    $(self.templates_map.descriptions.loading).clone().show().appendTo(desc_container).show();
  },

  showDevLoading: function() {
    var status_container = '#cloud_status .status_row.dev .status';
    var desc_container = '#cloud_status .status_row.dev .description';
    this.showLoading(status_container, desc_container);
  },

  showLiveLoading: function() {
    var status_container = '#cloud_status .status_row.live .status';
    var desc_container = '#cloud_status .status_row.live .description';
    this.showLoading(status_container, desc_container);
  },

  pingDev: function(success, failure) {
    var url, params, app;

    app = $fw.data.get('inst');
    url = Constants.PING_APP_URL;
    params = {
      guid: app.guid,
      deploytarget: "dev"
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        success(res);
      } else {
        failure(res);
      }
    });
  },

  pingLive: function(success, failure) {
    var url, params, app;

    app = $fw.data.get('inst');
    url = Constants.PING_APP_URL;
    params = {
      guid: app.guid,
      deploytarget: "live"
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        success(res);
      } else {
        failure(res);
      }
    });
  }  
});