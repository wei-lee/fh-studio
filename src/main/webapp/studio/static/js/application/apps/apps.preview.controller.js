var Apps = Apps || {};

Apps.Preview = Apps.Preview || {};

Apps.Preview.Controller = Controller.extend({
  MAX_PREVIEW_WIDTH: 400,
  EMPTY_PREVIEW_WIDTH: 320,
  
  chromeWidth: 0,
  chromeHeight: 0,

  init: function () {
    var self = this;
    
    $('.preview_toggle').unbind().bind('click', function (e) {
      e.preventDefault();

      if (self.isPreviewOpen()) {
        self.hide();
      } else {
        self.show();
      }
      
      // Trigger highcharts resize!
      $(window).trigger('resize');
    });
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

  hide: function () {
    this.hideContent();
    $('#preview_toggle_close').hide();
    $('#preview_toggle_open').show();
  },

  showInit: function () {
    var self = this;

    $fw.client.lang.insertLangForContainer($('#app_preview'));
    
    $('#preview_device_open_emulator').bind('click', function (e) {
      e.preventDefault();
      self.showEmulator();
    });
    
    $('#preview_frame_debugger_btn').button({
      'icons': {
        'primary': 'ui-icon-wrench',
        'secondary': ''
      }
    }).bind('click', function (e) {
      e.preventDefault();
      // Even though we're only calling a single function, we're
      // putting it inside an anonymous function so that the
      // reference to 'this' is maintained inside showDebugger
      self.showDebugger();
    });
    $('#preview_frame_emulator_btn').button({
      'icons': {
        'primary': 'ui-icon-newwin',
        'secondary': ''
      }
    }).bind('click', function (e) {
      e.preventDefault();
      self.showEmulator();
    });
    $('#preview_frame_refresh_btn').button({
      'icons': {
        'primary': 'ui-icon-refresh',
        'secondary': ''
      }
    }).bind('click', function (e) {
      e.preventDefault();
      self.show();
    });

    // setup preview override select beside preview
    self.preview_select = $('#preview_temporary_select');
    self.preview_select.bind('change', function () {
      var val = $(this).val();
      console.log('preview device changed:' + val);
      $fw.data.set('preview_override', val);
      // If we're not viewing a template, save the preview device as the default
      if (!$fw.data.get('template_mode')) {
        self.device_id = $fw.data.get('preview_override');
        // app details may not have been shown yet, so calling doUpdate may fail due to validation on the
        // details fields. Need a better solution for saving selected preview

        $fw.client.tab.apps.manageapps.controllers['apps.details.controller'].doUpdate(function () {
          // TODO: should AppManager handle this??
          var target = $('#new_app_target');
          target.find(':selected').removeAttr('selected');
          target.find('[value="' + $fw.data.get('preview_override') + '"]').attr('selected', 'selected');
        });
      }

      // reload the preview
      self.show();
    });
    self.insertPreviewOptionsIntoSelect(self.preview_select, self.device_id);

    // Reload the preview whenever the east pane of layout is re-opened
    // manage_apps_layout.options.east.onopen_end = function () {
    //   console.log('east pane opened, reload preview');
    //   self.show();
    // };

    self.showInitDone = true;
  },

  showReset: function () {
    var self = this;

    // preview_select was already initialised with options, so make sure selected matches the current preview device
    self.preview_select.val(self.device_id);
  },

  showPre: function () {
    var self = this;

    self.inst = $fw.data.get('inst');
    self.preview_config = self.inst.config.preview || {};

    // use device in the following order, preview override, saved preview device, preview default
    self.device_id = $fw.data.get('preview_override') || self.preview_config.device || self.getDefaultDeviceId();

    self.device = self.resolveDevice(self.device_id);
    
    // TODO: target is 'sandbox' in most cases. We're not really using it yet though
    self.url = self.getPreviewUrl(self.inst.guid, self.device.target, self.inst.domain);
  },

  resolveDevice: function (id) {
    var device = {};

    device = Config.app.preview.device[id] || self.getDefaultDevice();
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

    id = this.getDefaultDeviceId();
    device = Config.app.preview.device[id];

    return device;
  },

  showPost: function () {
    $('#preview_toggle_open').hide();
    $('#preview_toggle_close').show();
    this.clearContent();
    this.showContent();
    this.showInPreviewFrame();
  },

  showInPreviewFrame: function () {
    var self = this;

    var scale_preview = self.device.noscale ? false : typeof self.preview_config.scale === 'undefined' ? true : self.preview_config.scale;
    var actual_size = self.resizeContent($.extend({}, self.device, {
      id: self.device_id,
      scale: scale_preview
    }));
    self.act_width = actual_size.width;
    self.act_height = actual_size.height;
    self.act_scale = actual_size.scale;
    //manage_apps_layout.resizeAll();

    var preview_wrapper = $('#preview_wrapper');
    preview_wrapper.data('scaled', scale_preview);
    var max_width = $('#app_preview').width();//innerWidth(); //self.MAX_PREVIEW_WIDTH;
    var max_height = parseInt(preview_wrapper.height() + $('#preview_controls').height() + $('#main_layout_south').height(), 10);

    preview_wrapper.find('#preview_frame').hide().end().find('#preview_text').hide();
    var east_pane_size = (Math.min(Math.max(actual_size.width, parseInt($('#preview_controls').width(), 10)), self.MAX_PREVIEW_WIDTH)) + 10;
    console.log('inserting preview frame');

    // Empty the preview frame contents, and insert an iframe with the source set as the preview url
    preview_wrapper.find('#preview_frame').html('').html($('<iframe>', {
      src: self.url,
      frameborder: '0',
      width: self.device.width + 'px',
      height: self.device.height + 'px'
    }).hide().load(function () {
      $(this).show();
    }));

    self.previewFixes(scale_preview);

    if (actual_size.width >= max_width || actual_size.height > max_height) {
      //manage_apps_layout.sizePane('east', self.EMPTY_PREVIEW_WIDTH);
      preview_wrapper.css({
        width: 'auto',
        height: 'auto'
      }).find('#preview_frame').hide().end()
      .find('.preview_fix').hide().end()
      .find('#preview_text').show();
    } else {
      //manage_apps_layout.sizePane('east', east_pane_size);
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
        console.log('applying preview fix for ' + chrome_preview_fix + ':' + scale_fix);
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
        console.log('Chrome version:' + chrome_ver);
        
        if (chrome_ver > 10 && chrome_ver < 15) {
          var reverse_scale = 1 / self.act_scale;
          console.log('applying preview fix for Chrome version ' + chrome_ver);
  
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
        console.log('applying preview fix for ' + safari);
        container.css('-webkit-transform-style', 'preserve-3d');
      }
      
      $('#preview_wrapper,#preview_frame').unbind('scroll').bind('scroll', function () {
        var el = $(this);
        console.log('PREVIEW SCROLLFIX:' + el.attr('id'));
        // jquery mobile causes preview to jump down and to the right when certain actions happen in the app
        // this fix ensures the preview is anchored at the topleft.
        el.scrollTop(0).scrollLeft(0);
      });
    }
  },

  
  showDebugger: function () {
    var self = this, debugUrl = '', guid = '';
    console.log('showing debugger');
    
    debugUrl =  self.getPreviewUrl(self.inst.guid, null, self.inst.domain);
    
    self.openWindow(debugUrl, self.device.width, self.device.height);
  },
  
  showEmulator: function () {
    console.log('showing emulator');
    this.showInNewWindow();
  },
  
  showInNewTab: function (app_url) {
    this.showInNewWindow(app_url, null, null, true);
    this.hideContent();
  },

  showInNewWindow: function (app_url, app_width, app_height, show_in_tab) {
    var self = this;
    console.log("open preview in new window");
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
        self.p_window = self.openWindow('', width, height);
      } else {
        // Just resize window as it's already open
        // add chrome width and height to get the required viewport size
        var resize_width = width + self.chromeWidth,
            resize_height = height + self.chromeHeight;
        console.log('storedsize:' + self.act_width + 'x' + self.act_height + ', psize:' + width + 'x' + height + ', wsize:' + resize_width + 'x' + resize_height);
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
    //log("preview html = " + html); 
    self.p_window.document.open();
    var content = $('<div>').append(c_wrapper).html();
    self.p_window.document.write(content);
    self.p_window.document.close();

    var w_wrapper = $(self.p_window.document).find('#preview_wrapper');
    self.previewFixes($('#preview_wrapper').data('scaled'), w_wrapper);
  },

  showInDialog: function (app_url, app_width) {
    var url;
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
      options.width = $fw.data.get('inst').width;
      self.hideContent();
      proto.Dialog.load(self.getContent().clone(), options);
    } else {
      var preview_div = $('<div>', {
        id: 'app_preview_div'
      });
      options.width = app_width;
      options.stack = true;

      this.loadPreviewContent(url, function (data) {
        console.log('got preview. length:' + data.length);
        preview_div.html(data);
        proto.Dialog.load(preview_div, options);
      });
    }
  },

  loadPreviewContent: function (url, success_callback) {
    $.ajax({
      url: url,
      dataType: 'html',
      success: success_callback,
      error: function () {
        console.log('preview load failed', 'ERROR');
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

  isPreviewOpen: function () {
    return $('#app_preview').is(':visible');
  },

  setContent: function (content) {
    $('#preview_frame').html(content);
  },

  resizeContent: function (opts) {
    var self = this;
    var p_frame = $('#preview_frame'),
        act_width = opts.img_width || opts.width,
        act_height = opts.img_height || opts.height,
        have_img = opts.img_width && opts.img_height,
        img_width = opts.img_width || opts.width,
        img_height = opts.img_height || opts.height,
        act_offsetx = opts.offsetx || 0,
        act_offsety = opts.offsety || 0,
        actual_size = {},
        scale_factor = 1;
    console.log('full size:' + act_width + 'x' + act_height);
    
    // scale preview, if necessary
    if (opts.scale) {
      // required variables for working out perspective translation amount along z axis,
      // to give the illusion of scaling. 
      // Not currently required as scaling issue on Mac Safari has a workaround
      // i.e. setting -webkit-transform-style:preserve-3d;
      /*var h = act_height,
          sh = 0,
          p = 1000;*/
          
      scale_factor = self.calculateScaleFactor(opts.img_width, opts.mm_width);
      act_width = Math.round(opts.img_width * scale_factor);
      act_height = Math.round(opts.img_height * scale_factor);
      console.log('scaling preview, factor: ' + scale_factor);
      // use transform plugin to scale preview
      p_frame.css({
        position: 'absolute',
        scale: scale_factor,
        origin: ['0', '0']
      });
      
      $('#preview_wrapper').css({
        '-webkit-transform-style': 'preserve-3d',
        overflow: 'hidden',
        width: act_width + 'px',
        height: act_height + 'px'
      });
      
      // see note ^above^ about perspective translation
      // This logic works out the required distance from the viewing plane for the preview to be,
      // given the viewing plane distance (p), the actual height (h) and the required scaled height (sh).
      /*
      sh = act_height;
      // Work out viewing angle from origin to top of preview frame when it is the required height 
      var angle = Math.tan(Math.asin((sh / 2) / (p)));
      // Work out the z offset by using triangle maths
      var z_offset = ((h / 2)-(sh / 2)) / angle;
      console.log('h:' + h + ', sh: ' + sh + ', p:' + p + ', angle:' + angle*(180/Math.PI) + ', z:' + z_offset);*/
    }
    else {
      // use transform plugin to remove scaling of preview
      // TODO: remove transform plugin if not used common/js/ui/thirdparty/jquery/plugins/jquery.transform.js
      p_frame.css({
        position: 'absolute',
        scale: '1',
        // IE doesn't like it when an empty string is passed in here, so 0,0 will do
        origin: ['0', '0']
      });
      $('#preview_wrapper').css({
        overflow: 'auto',
        width: act_width + 'px',
        height: act_height + 'px'
      });
    }
    
    // store scaled height its needed for showing preview in new window
    $('#preview_wrapper').data('height', act_height);
    
    // setup size of preview frame
    var p_top = act_offsety,
        p_left = act_offsetx, 
        p_right = img_width - opts.width - p_left, 
        p_bottom = img_height - opts.height - p_top, 
        p_width = img_width - p_left - p_right, 
        p_height = img_height - p_top - p_bottom; 
    p_frame.css({
      width: p_width + 'px',
      height: p_height + 'px',
      'padding': p_top + 'px ' + p_right + 'px ' + p_bottom + 'px ' + p_left + 'px'
    });
    
    // set device image as background of preview, but only if we know there is an image
    var imgID = opts.img_id || opts.id;
    p_frame.css({
      'background': have_img ? ('url(/studio/static/themes/default/img/preview_device/' + imgID + '.png) no-repeat') : 'none'
    });
    
    actual_size = {width: act_width, height: act_height, scale: scale_factor};
    console.log('scaled size:' + JSON.stringify(actual_size));
    return actual_size;
  },

  clearContent: function () {
    $('#preview_frame').empty();
  },

  hideContent: function () {
    $('#app_preview').hide();
    $('#app_content').removeClass('span7').addClass('span10');
  },

  showContent: function () {
    $('#app_content').removeClass('span10').addClass('span7');
    $('#app_preview').show();
  },

  getContent: function () {
    return $('#preview_frame');
  },
  
  calculateScaleFactor: function (px_actual, mm_desired) {
    var div = $('<div>', {
      width: mm_desired + 'mm'
    });
    $(document.body).append(div);
    var px_scaled = parseInt(div.width(), 10);
    div.remove();
    
    var factor = px_scaled / px_actual; 
    return factor;
  },
  
  formatDeviceText: function (id, device) {
    return [
      $fw.client.lang.getLangString('preview_device_' + device.target), ' - ', $fw.client.lang.getLangString('preview_device_' + id + '_title'), ' - ',
      device.width, 'x', device.height, ' - ', device.ratio
    ].join('');
  },
  
  insertPreviewOptionsIntoSelect: function (select, selected) {
    var self = this;
    
    // swap out component and leave a placholder component
    var dummy_div = $('<div>').insertAfter(select);
    select.detach().empty();
    
    selected = selected || self.getDefaultDeviceId();
    
    // iterate over devices and construct options
    var options = HtmlUtil.optionsFromConfig(Config.app.preview.device, self.formatDeviceText, self.resolveDevice, true);
    
    HtmlUtil.constructOptions(select, options.options, options.values, selected);
    
    // swap back in component and remove placholder component
    select.insertBefore(dummy_div);
    dummy_div.remove();
  },
  
  /*
   * Opens a window at the specified url with the viewport size set to
   * the passed in parameters
   */
  openWindow: function (url, width, height) {
    var self = this, retWindow;
    
    // This may fail because of popup blockers
    try {
      // as there is no way of querying the size of a browser window, we'll use a little trick here to figure out how to set the viewport size
      // Opening a window will set the viewport size to the passed in width and height
      retWindow = window.open(url, null, "width=300,height=200,menubar=no,toolbar=no,location=no,status=no");
      // Whereas resizing a window will set the browser window size to the passed in width and height
      retWindow.resizeTo(301, 201);
  
      // using this knowledge, we can query the document width and height after resizing, and subtract it from
      // the size before resizing to get the chrome width and height.
      // for some reason, in google chrome/chromium browser, the height and width are gotten as
      // 0 if read straight after opening. For that reason, we have to wait a short time.
      setTimeout(function () {
        var retWindowWidth = $(retWindow).width();
        var retWindowHeight = $(retWindow).height();
        
        // workaround for issue where jquery height is much larger than actual outerHeight.
        if (retWindowHeight > 201) {
          retWindowHeight = retWindow.outerHeight;
          if (retWindowHeight > 201) {
            self.chromeHeight = retWindowHeight - 201;
          } else {
            self.chromeHeight = 201 - retWindowHeight;
          }
        } else {
          self.chromeHeight = 201 - retWindowHeight;
        }
        
        self.chromeWidth = 301 - retWindowWidth;
  
        console.log('chrome:' + self.chromeWidth + ', ' +  self.chromeHeight);
        // add chrome width and height to get the required viewport size
        var resize_width = width + self.chromeWidth,
            resize_height = height + self.chromeHeight;
        console.log('psize:' + width + 'x' + height + ', wsize:' + resize_width + 'x' + resize_height);
        retWindow.resizeTo(resize_width, resize_height);
      }, 500);
    }
    catch (e) {
      console.log('failed to open window: ' + e);
    }
    
    return retWindow;
  }
});