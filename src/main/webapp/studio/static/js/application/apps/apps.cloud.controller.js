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

    this.initCloudFn();
  },

  initCloudBindings: function() {
    var self = this;

    var jqContainer = $(this.container);
    $fw.client.lang.insertLangFromData(jqContainer);

    var envContainer = $('.cloud_environment', jqContainer);
    $('button', envContainer).bind('click', function (e) {
      e.preventDefault();
      var jqEl = $(this);

      if (jqEl.hasClass('active')) {
        // do nothing, already active
        return;
      }

      if (jqEl.hasClass('dev_environment_btn')) {
        $fw.data.set('cloud_environment', 'dev');
        self.switchedEnv('dev');
      } else {
        $fw.data.set('cloud_environment', 'live');
        self.switchedEnv('live');
      }
    });

    var selectedEnv = $fw.data.get('cloud_environment');
    if (selectedEnv != null) {
      $('.' + selectedEnv + '_environment_btn', envContainer).trigger('click');
    } else {
      // default to dev environment
      $('.dev_environment_btn', envContainer).trigger('click');
    }
  },

  switchedEnv: function (env) {
    // call show again.
    // Re-implement if you want to do something different
    this.show();
  }
});