var Apps = Apps || {};

Apps.Status = Apps.Status || {};

Apps.Status.Controller = Apps.Controller.extend({

  model: {},

  views: {
    status_container: "#status_container"
  },

  container: null,
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

  init: function() {},

  show: function() {
    this._super();

    var self = this;
    console.log('status.show');

    this.hide();
    this.container = this.views.status_container;

    // FIXME: show/hide preview could depend on a field in each sub-class of controller
    $fw.client.tab.apps.manageapps.getController('apps.preview.controller').hideContent();
    this.bind();
    this.refreshAll();
    $(this.container).show();
  },

  bind: function() {
    console.log('status.bind');
    var self = this;
    $('#refresh_dev_status').unbind().click(function() {
      console.log('dev status.refresh');
      self.refreshDev();
    });
    $('#refresh_live_status').unbind().click(function() {
      console.log('live status.refresh');
      self.refreshLive();
    });
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