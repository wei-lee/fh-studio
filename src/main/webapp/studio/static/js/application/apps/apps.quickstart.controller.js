var Apps = Apps || {};

Apps.Quickstart = Apps.Quickstart || {};
Apps.Quickstart.Client = Apps.Quickstart.Client || {};
Apps.Quickstart.Cloud = Apps.Quickstart.Cloud || {};


Apps.Quickstart.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    quickstart_container: '#quickstart_container',
    quickstart_client_container: '#quickstart_client_container',
    quickstart_cloud_container: '#quickstart_cloud_container',
    quickstart_client_hybrid_container: '#quickstart_client_hybrid_container'
  },

  container: null,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  show: function(e, view, showClientCloudOptions){
    this._super();

    if (showClientCloudOptions != null && !showClientCloudOptions) {
      // hide all quickstart elements
      this.hide();
    } else {
      // leave big client/cloud buttons at top visible, only hiding client & cloud views
      $(this.views.quickstart_client_container).hide();
      $(this.views.quickstart_cloud_container).hide();
      $(this.views.quickstart_client_hybrid_container).hide();
    }

    if (view != null) {
      this.container = view;
    } else {
      this.container = this.views.quickstart_container;
    }

    this.initFn();
    
    $(this.container).find('li').removeClass('active').end().show();
  },

  initBindings: function () {
    var self = this;
    // client/cloud quickstart binding setup
    var jqEl = $(self.container);

    jqEl.find('a').bind('click', function (e) {
      e.preventDefault();
      var anchor = $(this);

      jqEl.find('li').removeClass('active');
      anchor.parent().addClass('active');

      var controller = $fw.client.tab.apps.manageapps.getController(anchor.data('controller'));
      controller.show(e, true);
    });
  },

  // common function for binding (jQuery) elements to trigger 'show' on the corresponding controller
  bindToControllers: function (elements) {
    elements.bind('click', function (e) {
      e.preventDefault();
      var el = $(this);

      el.closest('.thumbnails').find('li').removeClass('active');
      el.closest('li').addClass('active');

      // show succeeding step/s that are configured for this item
      var controller = el.data('controller');
      $('.manageapps_nav_list a[data-controller="' + controller + '"]').trigger('click');
    });
  }

});


Apps.Quickstart.Client.Controller = Apps.Quickstart.Controller.extend({

  ios_plist: ['<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '  <dict>',
    '    <key>apiurl</key>',
    '    <string>{placeholder1}</string>',
    '    <key>app</key>',
    '    <string>{placeholder2}</string>',
    '    <key>domain</key>',
    '    <string>{placeholder3}</string>',
    '    <key>inst</key>',
    '    <string>{placeholder4}</string>',
    '  </dict>',
    '</plist>'].join('\n'),

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  show: function (e, showClientCloudOptions) {
    if (e != null && e.target != null && $(e.target).data('hybrid')) {
      // show being called from hybrid area of navlist i.e. a 'hybrid' only client view is required
      this._super(e, this.views.quickstart_client_hybrid_container);
    } else {
      this._super(e, this.views.quickstart_client_container, showClientCloudOptions);
      var jqEl = $(this.views.quickstart_client_container);
      // hide all steps, then just show step 1
      jqEl.find('.multistep_step').hide().end().find('.step_1').show();
    }

    $('.ios_plist').text(this.ios_plist);
  },

  initBindings: function () {
    // client quickstart binding setup

    $('.step_1_options a', this.views.quickstart_client_container).bind('click', function (e) {
      e.preventDefault();
      var el = $(this);

      el.closest('.thumbnails').find('li').removeClass('active');
      el.closest('li').addClass('active');

      // hide all other steps at the current step number or greater
      $('.step_2,.step_3,.step_4,.step_5').hide().find('li').removeClass('active');

      // show succeeding step/s that are configured for this item
      var nextsteps = el.data('nextsteps').split(',');
      _.each(nextsteps, function (step) {
        $('.' + step).show();
      });
    });

    // multiple versions of step 2 with same 2 options - new/existing project
    $('.step_2_options a', this.views.quickstart_client_container).bind('click', function (e) {
      e.preventDefault();
      var el = $(this);

      el.closest('.thumbnails').find('li').removeClass('active');
      el.closest('li').addClass('active');

      // hide all other steps at the current step number or greater
      $('.step_3,.step_4,.step_5').hide().find('li').removeClass('active');

      // show succeeding step/s that are configured for this item
      var nextsteps = el.data('nextsteps').split(',');
      _.each(nextsteps, function (step) {
        $('.' + step).show();
      });
    });

    this.bindToControllers($(this.views.quickstart_client_container + ' .step_2_hybrid_options a,' + this.views.quickstart_client_hybrid_container + ' .step_2_hybrid_options a'));
  }
});


Apps.Quickstart.Cloud.Controller = Apps.Quickstart.Controller.extend({
  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  show: function (e, showClientCloudOptions) {
    this._super(e, this.views.quickstart_cloud_container, showClientCloudOptions);
  },

  initBindings: function () {
    // cloud quickstart binding setup
    this.bindToControllers($('.step_1_options a', this.views.quickstart_cloud_container));
  }
});