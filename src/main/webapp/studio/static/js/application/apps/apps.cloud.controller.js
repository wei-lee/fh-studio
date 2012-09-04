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
    $('.btn', envContainer).removeClass('active');
    var selectedEnv = $fw.data.get('cloud_environment');
    if (selectedEnv != null) {
      $('.' + selectedEnv + '_environment_btn', envContainer).addClass('active');
    } else {
      // default to dev environment
      $fw.data.set('cloud_environment', 'dev');
      $('.dev_environment_btn', envContainer).addClass('active');
    }
  },

  initCloudBindings: function(envContainer) {
    var self = this;
    
    $fw.client.lang.insertLangFromData($(this.container));
    // bind env buttons to make necessary callback
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
  },

  switchedEnv: function (env) {
    // call show again.
    // Re-implement if you want to do something different
    this.show();
  }
});