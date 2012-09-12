var Apps = Apps || {};

Apps.Cloud = Apps.Cloud || {};

Apps.Cloud.Controller = Apps.Controller.extend({

  init: function() {
    this._super();
    this.initCloudFn = _.once(this.initCloudBindings);
  },

  show: function(container) {
    this._super();
    this.container = container;

    var envContainer = $(this.container + ' .cloud_environment');

    this.initCloudFn(envContainer);

    // set selected env button
    $('a', envContainer).parent().removeClass('active');
    var selectedEnv = $fw.data.get('cloud_environment');
    if (selectedEnv != null) {
      $('.' + selectedEnv + '_environment_btn', envContainer).parent().addClass('active');
    } else {
      // default to dev environment
      $fw.data.set('cloud_environment', 'dev');
      $('.dev_environment_btn', envContainer).parent().addClass('active');
    }
  },

  toggleEnv: function() {
    if (this.currentEnv() === 'dev') {
      this.toggleToLiveEnv();
    } else {
      this.toggleToDevEnv();
    }
  },

  toggleToLiveEnv: function() {
    // TODO: Hook up to ping.
    $('.status_light').addClass('okay');
    $('.cloud_environment .env_toggle_button').animate({
      'left': '31px'
    });
    $('.cloud_environment .env_toggle_container').removeClass('dev').addClass('live');
  },

  toggleToDevEnv: function() {
    // TODO: Hook up to ping.
    $('.status_light').removeClass('okay');
    $('.cloud_environment .env_toggle_button').animate({
      'left': '0px'
    });
    $('.cloud_environment .env_toggle_container').removeClass('live').addClass('dev');
  },

  currentEnv: function () {
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
    $('.env_toggle_container', envContainer).bind('click', function (e) {
      e.preventDefault();
      var jqEl = $(this);

      self.toggleEnv();

      // if (jqEl.parent().hasClass('active')) {
      //   // do nothing, already active
      //   return;
      // }

      if (jqEl.hasClass('dev_environment_btn')) {
        $fw.data.set('cloud_environment', 'dev');
        self.switchedEnv('dev');
      } else {
        $fw.data.set('cloud_environment', 'live');
        self.switchedEnv('live');
      }
    });
  },

  switchedEnv: function (env) {
    // call show again.
    // Re-implement if you want to do something different
    this.show();
  }
});