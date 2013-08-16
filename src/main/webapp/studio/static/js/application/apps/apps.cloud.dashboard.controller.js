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
    this.bind();
    $(this.container).show();

    var env = $fw.data.get('cloud_environment');
    var guid = $fw.data.get('inst').guid;

    this.loadCurrentTarget(guid, env);
    this.loadCurrentHost(guid, env);
    this.loadCurrentStatus(guid, env);
    this.loadAppControls(guid, env);
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

    $('a.cloud_endpoints', this.container).unbind().click(function(e) {
      e.preventDefault();
      $('.manageapps_nav_list a[data-controller="apps.endpoints.controller"]').trigger('click');
    });

    $('a.edit_cloud_code', this.container).unbind().click(function(e) {
      e.preventDefault();
      $fw.data.set('initFile', '/cloud/main.js');
      $('.manageapps_nav_list a[data-controller="apps.editor.controller"]').trigger('click');
    });

    $('a.notification_settings', this.container).unbind().click(function(e) {
      e.preventDefault();
      $('.manageapps_nav_list a[data-controller="apps.cloudnotifications.controller"]').trigger('click');
    });

    $('a.monitor_resources', this.container).unbind().click(function(e) {
      e.preventDefault();
      $('.manageapps_nav_list a[data-controller="apps.cloudresources.controller"]').trigger('click');
    });
  },

  loadCurrentStatus: function(guid, env) {
    var container = $('.current_cloud_app_status_container', this.container);
    container.empty();
    this.showLoadIcon(container);
    var self = this;
    this.ping(guid, env, function(res) {
      // Success
      self.renderStatusOK();
    }, function(res) {
      // Error
      self.renderStatusFail();
    });
  },

  loadCurrentTarget: function(guid, env) {
    var container = $('.current_deploy_target_container', this.container);
    container.empty();
    this.showLoadIcon(container);
    var self = this;
    this.model.deploy.current(guid, env, function(current_target) {
      self.renderCurrentTarget(current_target);
    }, function() {
      // Failed
    });
  },

  loadCurrentHost: function(guid, env) {
    var container = $('.current_deploy_host_container', this.container);
    container.empty();
    this.showLoadIcon(container);
    var self = this;
    this.model.app.hosts(guid, function(res) {
      var url = null;
      // Inconsistency :(
      if (env === 'live') {
        url = res.hosts['live-url'];
      } else {
        url = res.hosts['development-url'];
      }
      self.renderCurrentAppHost(url);
    }, function() {
      // Failed
    });
  },

  loadAppControls: function(guid, env){
    var self = this;
    var container = $('.current_cloud_app_controls_container', this.container);
    var startButton = $('<button>').addClass('btn btn-success disabled start_btn').html("<i class='icon-play'></i> Start App");
    var stopButton = $('<button>').addClass('btn btn-danger disabled stop_btn').css('margin-left', '10px').html("<i class='icon-stop'></i> Stop App");
    var restartButton = $('<button>').addClass('btn btn-info disabled restart_btn').css('margin-left', '10px').html("<i class='icon-repeat'></i> Restart App");
    container.empty().append(startButton).append(stopButton).append(restartButton);
    startButton.click(function(e){
      e.preventDefault();
      self.appControl('start');
    });
    stopButton.click(function(e){
      e.preventDefault();
      self.appControl('stop');
    });
    restartButton.click(function(e){
      e.preventDefault();
      self.appControl('stop', function(){
        self.appControl('start');
      });
    });
  },

  appControl: function(action, successCb){
    var self = this;
    var env = $fw.data.get('cloud_environment');
    var guid = $fw.data.get('inst').guid;
    var url = action === "start" ? Constants.APP_START_URL: Constants.APP_STOP_URL;
    var afterAction = action === "start" ? self.renderStatusOK : self.renderStatusFail;
    var container = $('.current_cloud_app_controls_container', self.container);
    var spinner = self.createSpinner();
    spinner.css("display", "inline").css("margin-left", "10px");
    container.append(spinner);
    $fw.server.post(url, {guid: guid, deploytarget: env}, function(res){
      container.find('.loading_icon').remove();
      if(res.status === "ok"){
        afterAction.apply(self);
        if(successCb){
          successCb();
        }
      } else {
        console.log("Failed to " + action + " app. Message: " + res.message);
        self.showAlert("error", "Failed to " + action + " app. Please make sure the app has been deployed and try again.");
      }
    }, null, true);
  },

  createSpinner: function() {
    var spinner = $('.hidden_template.loading_icon', this.container).clone();
    spinner.removeClass('hidden_template');
    return spinner;
  },

  showLoadIcon: function(container) {
    var spinner = this.createSpinner();
    container.append(spinner);
  },

  renderStatusOK: function() {
    this.renderStatus('label-success', 'Running');
    var container = $('.current_cloud_app_controls_container', self.container);
    container.find('.btn').addClass('disabled');
    container.find('.stop_btn, .restart_btn').removeClass('disabled');
  },

  renderStatusFail: function() {
    this.renderStatus('label-important', 'Not Running');
    var container = $('.current_cloud_app_controls_container', self.container);
    container.find('.btn').addClass('disabled');
    container.find('.start_btn').removeClass('disabled');
  },

  renderStatus: function(label_class, message) {
    var self = this;
    var cont = $('.current_cloud_app_status_container', this.views.dashboard_container).empty();
    var status = $('<span>').addClass('label cloud_app_status').text(message);
    status.addClass(label_class);
    cont.append(status);
    var button = $('<button>').addClass('btn').text('Refresh');
    button.click(function() {
      var env = $fw.data.get('cloud_environment');
      var guid = $fw.data.get('inst').guid;
      self.loadCurrentStatus(guid, env);
    });
    button.css('margin-left', '10px');
    cont.append(button);
  },

  renderCurrentAppHost: function(url) {
    var host_link = $('<a>').addClass('cloud_app_host').attr('href', url).attr("target", "_blank").text(url);
    $('.current_deploy_host_container', this.views.dashboard_container).empty().append(host_link);
  },

  renderCurrentTarget: function(target) {
    var self = this;
    // TODO: Common view, move?
    var target_name = target.fields.target;
    var label_name = target.fields.name;

    var button = $('<a>').addClass('btn');
    button.addClass('span4');

    var label = $('<div>').addClass('cloud_target_label')
    // only changet target image if its not the default (this allows for theming the default via css)
    if (target_name.toLowerCase() !== self.target_map.FEEDHENRY.toLowerCase()) {
      label.css('background-image', 'url("/studio/static/themes/default/img/cloud_target_' + target_name.toLowerCase() + '.png")');
    }
    if (target.fields.id !== 'default') {
      label.text(label_name);
    } else {
      label.text(self.target_map[target.fields.target]);
    }
    button.append(label);

    button.click(function() {
      $('.nav-list li a[data-controller="apps.deploy.controller"]').trigger('click');
    });

    $('.current_deploy_target_container', dashboard_container).empty().append(button);
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