var Apps = Apps || {};
Apps.Cloud = Apps.Cloud || {};
Apps.Cloud.Dashboard = Apps.Cloud.Dashboard || {};

Apps.Cloud.Dashboard.Controller = Apps.Cloud.Controller.extend({

  model: {
    deploy: new model.Deploy(),
    app: new model.App()
  },

  views: {
    dashboard_container: "#dashboard_container"
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

  // TODO: Move
  target_map: {
    FEEDHENRY: 'FeedHenry',
    CLOUDFOUNDRY: 'Cloud Foundry',
    STACKATO: 'ActiveState Stackato',
    APPFOG: 'App Fog',
    IRONFOUNDRY: 'Iron Foundry'
  },

  init: function() {
    this._super();
  },

  show: function(e, showClientCloudOptions) {
    var self = this;

    this._super(this.views.dashboard_container);
    this.hide();
    this.bind();
    $(this.container).show();

    var cloud_env = $fw.data.get('cloud_environment');
    var app_guid = $fw.data.get('inst').guid;

    // Check current deploy target
    this.model.deploy.current(app_guid, cloud_env, function(current_target) {
      self.renderCurrentTarget(current_target);
    }, function() {
      // Failed
    });

    // Check current app host
    this.model.app.hosts(app_guid, function(res) {
      var url = null;
      // Inconsistency :(
      if (cloud_env === 'live') {
        url = res.hosts['live-url'];
      } else {
        url = res.hosts['development-url'];
      }
      self.renderCurrentAppHost(url);
    }, function() {
      // Failed
    });

    // Ping app
    this.ping(app_guid, cloud_env, function(res) {
      // Success
      self.renderStatusOK();
    }, function(res) {
      // Error
      self.renderStatusFail();
    });
  },

  renderStatusOK: function() {
    var cont = $('.current_cloud_app_status_container', this.views.dashboard_container).empty();
    var status = $('<span>').addClass('label label-success cloud_app_status').text('Running');
    cont.append(status);
  },

  renderStatusFail: function() {
    var cont = $('.current_cloud_app_status_container', this.views.dashboard_container).empty();
    var status = $('<span>').addClass('label label-important cloud_app_status').text('Not Running');
    cont.append(status);
  },

  renderCurrentAppHost: function(url) {
    var host_link = $('<a>').addClass('cloud_app_host').attr('href', url).text(url);
    $('.current_deploy_host_container', this.views.dashboard_container).empty().append(host_link);
  },

  renderCurrentTarget: function(target) {
    var self = this;
    // TODO: Common view, move?
    var target_name = target.fields.target;
    var label_name = target.fields.name;

    var button = $('<a>').addClass('btn');
    var icon = $('<img>').attr('src', '/studio/static/themes/default/img/cloud_target_' + target_name.toLowerCase() + '.png');
    button.addClass('span4');
    button.append(icon);

    var label = $('<div>').addClass('cloud_target_label');
    if (target.fields.id !== 'default') {
      label.text(label_name);
    } else {
      label.text(self.target_map[target.fields.target]);
    }
    button.append(label);

    $('.current_deploy_target_container', dashboard_container).empty().append(button);
  },

  bind: function() {
    var self = this;

    // Action bindings
    $('a.develop_cloud_code', this.container).unbind().click(function(e) {
      e.preventDefault();
      self.openCloudEditor();
    });

    $('a.deploy_cloud_code', this.container).unbind().click(function(e) {
      e.preventDefault();
      $('.manageapps_nav_list a[data-controller="apps.deploy.controller"]').trigger('click');
    });

    $('a.monitor_cloud_stats', this.container).unbind().click(function(e) {
      e.preventDefault();
      $('.manageapps_nav_list a[data-controller="stats.controller"]').trigger('click');
    });

    $('a.cloud_logs', this.container).unbind().click(function(e) {
      e.preventDefault();
      $('.manageapps_nav_list a[data-controller="apps.logging.controller"]').trigger('click');
    });
  },

  openCloudEditor: function() {
    $fw.data.set('initFile', '/cloud/main.js');
    $('.manageapps_nav_list a[data-controller="apps.editor.controller"]').trigger('click');
  },

  ping: function(guid, env, success, failure) {
    var url = Constants.PING_APP_URL;
    var params = {
      guid: guid,
      deploytarget: env
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