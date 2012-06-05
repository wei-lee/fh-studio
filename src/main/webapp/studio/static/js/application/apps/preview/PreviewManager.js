application.PreviewManager = Class.extend({
  support: null,
  MAX_PREVIEW_WIDTH: 400,
  EMPTY_PREVIEW_WIDTH: 320,

  init: function () {
    this.support = new application.PreviewSupport();
  },

  show: function () {
    var self = this;

    if ($.isFunction(self.showPre)) {
      self.showPre();
    }

    if (!self.showInitDone) {
      if ($.isFunction(self.showInit)) {
        self.showInit();
      }
    } else {
      if ($.isFunction(self.showReset)) {
        self.showReset();
      }
    }

    if ($.isFunction(self.showPost)) {
      self.showPost();
    }
  },

  showInit: function () {
    var self = this;

    $fw.client.lang.insertLangForContainer($('#manage_apps_east'));
    
    $('#preview_device_open_emulator').bind('click', $fw.client.preview.showEmulator);
    
    $('#preview_frame_debugger_btn').button({
      'icons': {
        'primary': 'ui-icon-wrench',
        'secondary': ''
      }
    }).bind('click', function () {
      // Even though we're only calling a single function, we're
      // putting it inside an anonymous function so that the 
      // reference to 'this' is maintained inside showDebugger
      $fw.client.preview.showDebugger()
    });
    $('#preview_frame_emulator_btn').button({
      'icons': {
        'primary': 'ui-icon-newwin',
        'secondary': ''
      }
    }).bind('click', $fw.client.preview.showEmulator);
    $('#preview_frame_refresh_btn').button({
      'icons': {
        'primary': 'ui-icon-refresh',
        'secondary': ''
      }
    }).bind('click', function () {
      $fw.client.preview.show();
    });

    // setup preview override select beside preview
    self.preview_select = $('#preview_temporary_select');
    self.preview_select.bind('change', function () {
      var val = $(this).val();
      Log.append('preview device changed:' + val);
      $fw_manager.data.set('preview_override', val);
      // If we're not viewing a template, save the preview device as the default
      if (!$fw_manager.data.get('template_mode')) {
        self.device_id = $fw_manager.data.get('preview_override');
        $fw_manager.client.app.doUpdate(function () {
          // TODO: should AppManager handle this??
          var target = $('#new_app_target');
          target.find(':selected').removeAttr('selected');
          target.find('[value="' + $fw_manager.data.get('preview_override') + '"]').attr('selected', 'selected');
        });
      }

      // reload the preview
      self.show();
    });
    $fw_manager.client.preview.insertPreviewOptionsIntoSelect(self.preview_select, self.device_id);

    // Reload the preview whenever the east pane of layout is re-opened
    manage_apps_layout.options.east.onopen_end = function () {
      Log.append('east pane opened, reload preview');
      $fw_manager.client.preview.show();
    };

    self.showInitDone = true;
  },

  showReset: function () {
    var self = this;

    // preview_select was already initialised with options, so make sure selected matches the current preview device
    self.preview_select.val(self.device_id);
  },

  showPre: function () {
    var self = this;

    self.inst = $fw_manager.data.get('inst');
    self.preview_config = self.inst.config.preview || {};

    // use device in the following order, preview override, saved preview device, preview default
    self.device_id = $fw_manager.data.get('preview_override') || self.preview_config.device || $fw.client.preview.getDefaultDeviceId();

    self.device = self.resolveDevice(self.device_id);    
    
    // TODO: target is 'sandbox' in most cases. We're not really using it yet though
    self.url = $fw_manager.client.preview.getPreviewUrl(self.inst.guid, self.device.target, self.inst.domain);
  },

  resolveDevice: function (id) {
    var device = {};

    device = Config.app.preview.device[id] || $fw.client.preview.getDefaultDevice();
    if (device.parent) {
      var parent = Config.app.preview.device[device.parent];
      device = $.extend({}, device, parent, true);
    }

    return device;
  },

  getDefaultDeviceId: function () {
    var id = '';

    id = Config.app.preview.device['default'];

    return id;
  },

  getDefaultDevice: function () {
    var device = '',
        id = '';

    id = $fw.client.preview.getDefaultDeviceId();
    device = Config.app.preview.device[id];

    return device;
  },

  showPost: function () {
    // Only render the preview if the preview area is open
    var is_open = $fw_manager.client.preview.support.isPreviewOpen();
    if (is_open) {
      $fw_manager.client.preview.clearContent();
      $fw_manager.client.preview.showInPreviewFrame();
    }
  },

  showInPreviewFrame: function () {
    var self = this;

    var scale_preview = self.device.noscale ? false : typeof self.preview_config.scale === 'undefined' ? true : self.preview_config.scale;
    var actual_size = $fw_manager.client.preview.resizeContent($.extend({}, self.device, {
      id: self.device_id,
      scale: scale_preview
    }));
    self.act_width = actual_size.width;
    self.act_height = actual_size.height;
    self.act_scale = actual_size.scale;
    manage_apps_layout.resizeAll();

    var preview_wrapper = $('#preview_wrapper');
    preview_wrapper.data('scaled', scale_preview);
    var max_width = $fw_manager.client.preview.MAX_PREVIEW_WIDTH;
    var max_height = parseInt(preview_wrapper.height() + 10, 10);

    preview_wrapper.find('#preview_frame').hide().end().find('#preview_text').hide();
    var east_pane_size = (Math.min(Math.max(actual_size.width, parseInt($('#preview_controls').width(), 10)), $fw_manager.client.preview.MAX_PREVIEW_WIDTH)) + 10;
    Log.append('inserting preview frame');

    // Empty the preview frame contents, and insert an iframe with the source set as the preview url
    preview_wrapper.find('#preview_frame').html('').html($('<iframe>', {
      src: self.url,
      frameborder: '0',
      width: self.device.width + 'px',
      height: self.device.height + 'px'
    }));

    self.previewFixes(scale_preview);

    if (actual_size.width >= max_width || actual_size.height > max_height) {
      manage_apps_layout.sizePane('east', $fw_manager.client.preview.EMPTY_PREVIEW_WIDTH);
      preview_wrapper.css({
        width: 'auto'
      }).find('#preview_frame').hide().end()
      .find('.preview_fix').hide().end()
      .find('#preview_text').show();
    } else {
      manage_apps_layout.sizePane('east', east_pane_size);
      preview_wrapper.find('#preview_frame').show();
    }
  },

  previewFixes: function (scaled, container) {
    var self = this;
    container = 'undefined' !== typeof container ? container : $('#preview_wrapper');

    if (!scaled) {
      // We're not working with a scaled preview, so remove any fix div that could have
      // been added last preview. Otherwise, leave it in as the iframe may be used
      // for the chrome fix
      container.find('.preview_fix').remove();
    } else {

      // Chrome 10 preview fix
      // See: http://code.google.com/p/chromium/issues/detail?id=71937
      // 
      // iframe is scaled twice in this version of Chrome.
      // Fix is to apply a root of the reverse scale on the iframe
      var chrome_preview_fix = "Chrome/10.0.648";
      if (navigator.userAgent.indexOf(chrome_preview_fix) > -1) {
        var scale_fix = Math.sqrt(1 / self.act_scale);
        Log.append('applying preview fix for ' + chrome_preview_fix + ':' + scale_fix);
        container.find('#preview_frame > iframe').css({
          '-webkit-transform': 'scale(' + scale_fix + ')',
          '-webkit-transform-origin': '0 0'
        });
      }

      // Chrome >10 preview fix
      // 
      // partial iframe content (background css and images) is cropped in this version of Chrome.
      // Fix is to apply a reverse scale on the iframe, then 
      //chrome_preview_fix = "Chrome/11.0.696";
      //chrome_preview_fix = "Chrome/12.0.742";
      var ua = navigator.userAgent, chrome_ver = null;
      var agentParts = ua.match(/(Chrome\/)(.*?)(\.)/);
      if (agentParts != null && agentParts[2] != null) {
        chrome_ver = agentParts[2];
      }

      if (chrome_ver != null) {
        Log.append('Chrome version:' + chrome_ver);
        
        if (chrome_ver > 10 && chrome_ver < 15) {
          var reverse_scale = 1 / self.act_scale;
          Log.append('applying preview fix for Chrome version ' + chrome_ver);
  
          // check if we have an iframe in the preview frame
          // if we don't, we're working with a cloned preview, so get it from the preview fix div
          var pframe = container.find('#preview_frame iframe').hide().remove();
          if (pframe.length === 0) {
            pframe = container.find('.preview_fix iframe').hide().remove();
          }
          // remove fix div from last time, if any
          container.find('.preview_fix').remove();
  
          container.prepend($('<div>', {
            'class': 'preview_fix'
          }).css({
            'width': Math.round((self.device.width * self.act_scale)) + 'px',
            'height': Math.round((self.device.height * self.act_scale)) + 'px',
            'top': Math.round((self.device.offsety * self.act_scale)) + 'px',
            'left': Math.round((self.device.offsetx * self.act_scale)) + 'px',
            'overflow': 'hidden',
            'position': 'absolute',
            'z-index': '5'
          }).append(pframe));
  
          pframe.load(function () {
            // apply original scale to iframe, and show it now that it's the right size
            pframe.contents().find('body').css({
              '-webkit-transform': 'scale(' + self.act_scale + ')',
              '-webkit-transform-origin': '0 0'
            });
            container.find('#preview_frame').css({
              'position': 'relative',
              'z-index': '1'
            });
            pframe.show();
          });
        }
      }

      var safari = "Safari/";
      if (navigator.userAgent.indexOf(safari) > -1) {
        Log.append('applying preview fix for ' + safari);
        container.css('-webkit-transform-style', 'preserve-3d');
      }
      
      $('#preview_wrapper,#preview_frame').unbind('scroll').bind('scroll', function () {
        var el = $(this);
        Log.append('PREVIEW SCROLLFIX:' + el.attr('id'));
        // jquery mobile causes preview to jump down and to the right when certain actions happen in the app
        // this fix ensures the preview is anchored at the topleft.
        el.scrollTop(0).scrollLeft(0);
      });
    }
  },

  
  showDebugger: function () {
    var self = this, debugUrl = '', guid = '';
    Log.append('showing debugger');
    
    debugUrl =  $fw_manager.client.preview.getPreviewUrl(self.inst.guid, null, self.inst.domain);
    
    $fw.client.preview.support.openWindow(debugUrl, self.device.width, self.device.height);
  },
  
  showEmulator: function () {
    Log.append('showing emulator');
    $fw.client.preview.showInNewWindow();
  },
  
  showInNewTab: function (app_url) {
    var self = this;
    $fw_manager.client.preview.showInNewWindow(app_url, null, null, true);
    $fw_manager.client.preview.hideContent();
  },

  showInNewWindow: function (app_url, app_width, app_height, show_in_tab) {
    var self = this;
    Log.append("open preview in new window");
    var url = app_url || self.url,
        width = (app_width || self.act_width) + 25,
        height = (app_height || self.act_height) + 20;

    if (show_in_tab) {
      // see if we already have a tab open, and use it. otherwise open one
      self.p_window = self.t_window;
      if ('undefined' === typeof self.p_window || self.p_window.closed) {
        self.p_window = window.open('about:blank', '_blank');
      }
      self.t_window = self.p_window;
    } else {
      // see if we already have a window open, and use it. otherwise open one.
      // Also, with Opera, window.closed doesn't seem to be available, so instead if the window 
      // is closed in opera, we can check if resizeTo is not a function 
      self.p_window = self.n_window;
      if ('undefined' === typeof self.p_window || self.p_window.closed || 'undefined' === typeof self.p_window.resizeTo) {
        self.p_window = $fw.client.preview.support.openWindow('', width, height);
      } else {
        // Just resize window as it's already open
        // add chrome width and height to get the required viewport size
        var resize_width = width + $fw.client.preview.support.getChromeWidth(),
            resize_height = height + $fw.client.preview.support.getChromeHeight();
        Log.append('storedsize:' + self.act_width + 'x' + self.act_height + ', psize:' + width + 'x' + height + ', wsize:' + resize_width + 'x' + resize_height);
        self.p_window.resizeTo(resize_width, resize_height);
      }
      self.n_window = self.p_window;
      self.p_window.focus();
    }

    // Clone the preview elements into the new tab/window
    var c_wrapper = $('#preview_wrapper').clone().find('#preview_frame').show().end().find('.preview_fix').show().end().find('iframe').show().end().find('#preview_text').hide().end();
    c_wrapper.css({
      height: $('#preview_wrapper').data('height') + 'px',
      overflow: 'hidden',
      '-webkit-transform-style': ''
    });
    //Log.append("preview html = " + html); 
    self.p_window.document.open();
    var content = $('<div>').append(c_wrapper).html();
    self.p_window.document.write(content);
    self.p_window.document.close();

    var w_wrapper = $(self.p_window.document).find('#preview_wrapper');
    self.previewFixes($('#preview_wrapper').data('scaled'), w_wrapper);
  },

  showInDialog: function (app_url, app_width) {
    var url;
    debugger;
    var preview_loaded = true;
    if (typeof app_url !== "undefined") {
      url = app_url;
      preview_loaded = false;
    }
    var options = {
      autoOpen: true,
      draggable: true,
      closeOnEscape: true,
      dialogClass: ''
    };
    if (preview_loaded) {
      options.width = $fw_manager.data.get('inst').width;
      $fw_manager.client.preview.hideContent();
      proto.Dialog.load($fw_manager.client.preview.support.getContent().clone(), options);
    } else {
      var preview_div = $('<div>', {
        id: 'app_preview_div'
      });
      options.width = app_width;
      options.stack = true;

      this.loadPreviewContent(url, function (data) {
      	debugger;
        Log.append('got preview. length:' + data.length);
        preview_div.html(data);
        proto.Dialog.load(preview_div, options);
      });
    }
  },

  loadPreviewContent: function (url, success_callback) {
    $.ajax({
      url: url,
      dataType: 'text/html',
      success: success_callback,
      error: function () {
      	debugger;
        Log.append('preview load failed', 'ERROR');
      }
    });
  },

  getPreviewUrl: function (app_guid, destination, domain) {
    // TODO: can use destination eventually here 
    var domainStr = domain || Constants.DOMAIN;

    var preview_url = Constants.PREVIEW_APP_URL.replace('<GUID>', app_guid).replace('<DEST>', Constants.PREVIEW_APP_DESTINATION).replace('<DOMAIN>', domainStr);
    return preview_url;
  },

  getTemplatePreviewUrl: function (app_guid, destination, domain) {
  	var domainStr = domain || Constants.DOMAIN;
    var preview_url = Constants.PREVIEW_TEMPLATE_URL.replace('<GUID>', app_guid).replace('<DEST>', Constants.PREVIEW_APP_DESTINATION).replace('<DOMAIN>', domainStr);
    return preview_url;
  },

  /*
   * Support functions
   */

  setContent: function (content) {
    return $fw_manager.client.preview.support.setContent(content);
  },

  resizeContent: function (opts) {
    return $fw_manager.client.preview.support.resizeContent(opts);
  },

  clearContent: function () {
    return $fw_manager.client.preview.support.clearContent();
  },

  hideContent: function () {
    return $fw_manager.client.preview.support.hideContent();
  },

  showContent: function () {
    return $fw_manager.client.preview.support.showContent();
  },

  formatDeviceText: function (id, device) {
    return $fw_manager.client.preview.support.formatDeviceText(id, device);
  },

  insertPreviewOptionsIntoSelect: function (select, selected) {
    return $fw_manager.client.preview.support.insertPreviewOptionsIntoSelect(select, selected);
  }
});