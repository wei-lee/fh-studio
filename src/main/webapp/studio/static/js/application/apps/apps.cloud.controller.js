var Apps = Apps || {};

Apps.Cloud = Apps.Cloud || {};

Apps.Cloud.Controller = Apps.Controller.extend({

  refresh_enabled: false,
  period_status_check_interval: 10000,


  init: function() {
    this._super();
    this.initCloudFn = _.once(this.initCloudBindings);
  },

  // TODO: Refactor all of the Cloud Env stuff into a seperate controller
  show: function(container) {
    this._super();
    this.container = container;

    var envContainer = $(this.container + ' .cloud_environment');

    this.initCloudFn(envContainer);
    var selectedEnv = $fw.data.get('cloud_environment');
    this.refreshStatus();

    // set selected env button
    if (selectedEnv != null) {
      $('.' + selectedEnv + '_environment_btn', envContainer).parent().addClass('active');
    } else {
      // default to dev environment
      $fw.data.set('cloud_environment', 'dev');
      $('.dev_environment_btn', envContainer).parent().addClass('active');
    }

  },

  clearPeriodicStatusCheck: function() {
    this.refresh_enabled = false;
  },

  hide: function() {
    this._super();
    this.clearPeriodicStatusCheck();
  },

  toggleEnv: function() {
    if (this.currentEnv() === 'dev') {
      this.toggleToLiveEnv();
    } else {
      this.toggleToDevEnv();
    }
  },

  refreshStatus: function() {
    console.log('Refreshing Cloud App Status');
    var self = this;
    if (!self.refresh_enabled) {
      self.refresh_enabled = true;
      $.each(['dev', 'live'], function(i, env) {
        self.refreshSingleStatus(env);
      });
    }
  },

  refreshSingleStatus: function(env) {
    var self = this;
    var status_light = $('.status_light.' + env);
    console.log('refreshSingleStatus: ' + env + self.period_status_check_interval);
    self.pingCloud(env, function() {
      // Success
      status_light.addClass('okay');
      setTimeout(function() {
        if (self.refresh_enabled) {
          self.refreshSingleStatus(env);
        }
      }, self.period_status_check_interval);
    }, function() {
      // Failed
      status_light.removeClass('okay');
      setTimeout(function() {
        if (self.refresh_enabled) {
          self.refreshSingleStatus(env);
        }
      }, self.period_status_check_interval);
    });
  },

  toggleToLiveEnv: function() {
    // Extra css set after animate to fix some odd "Corruption" issues in Chrome
    $('.cloud_environment .env_toggle_button').animate({
      'left': '31px'
    }, 300);

    $('.cloud_environment .env_toggle_container').removeClass('dev').addClass('live');
    $('.cloud_environment .env_type.dev').removeClass('active');
    $('.cloud_environment .env_type.live').addClass('active');
  },

  toggleToDevEnv: function() {
    $('.cloud_environment .env_toggle_button').animate({
      'left': '0px'
    }, 300);
    $('.cloud_environment .env_toggle_container').removeClass('live').addClass('dev');
    $('.cloud_environment .env_type.live').removeClass('active');
    $('.cloud_environment .env_type.dev').addClass('active');
  },

  pingCloud: function(env, success, failure) {
    var guid = $fw.data.get('inst').guid;
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
  },

  currentEnv: function() {
    if ($('.cloud_environment .env_toggle_container').hasClass('dev')) {
      return "dev";
    } else {
      return "live";
    }
  },

  initCloudBindings: function(envContainer) {
    var self = this;

    $fw.client.lang.insertLangFromData($(this.container));
    // bind env buttons to make necessary callback
    $('.env_toggle_container', envContainer).bind('mousedown', function(e) {
      e.preventDefault();
      self.toggleEnv();

      if (self.currentEnv() === 'dev') {
        $fw.data.set('cloud_environment', 'dev');
        self.switchedEnv('dev');
      } else {
        $fw.data.set('cloud_environment', 'live');
        self.switchedEnv('live');
      }
    });
  },

  switchedEnv: function(env) {
    // call show again.
    // Re-implement if you want to do something different
    this.show();
  }
});