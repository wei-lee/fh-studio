application.PreviewSupport = Class.extend({
  
  chromeWidth: 0,
  chromeHeight: 0,

  init: function () {

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
    Log.append('full size:' + act_width + 'x' + act_height);
    
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
      Log.append('scaling preview, factor: ' + scale_factor);
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
      Log.append('h:' + h + ', sh: ' + sh + ', p:' + p + ', angle:' + angle*(180/Math.PI) + ', z:' + z_offset);*/
    }
    else {
      // use transform plugin to remove scaling of preview
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
    Log.append('scaled size:' + JSON.stringify(actual_size));
    return actual_size;
  },

  clearContent: function () {
    $('#preview_frame').empty();
  },

  hideContent: function () {
    manage_apps_layout.close('east');
  },

  showContent: function () {
    manage_apps_layout.open('east');
  },

  getContent: function () {
    return $('#preview_frame');
  },

  isPreviewOpen: function () {
    return !manage_apps_layout.state.east.isClosed;
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
      $fw_manager.client.lang.getLangString('preview_device_' + device.target), 
      ' - ', $fw_manager.client.lang.getLangString('preview_device_' + id + '_title'), ' - ',
      device.width, 'x', device.height, ' - ', device.ratio
    ].join('');
  },
  
  insertPreviewOptionsIntoSelect: function (select, selected) {
    var self = this;
    
    // swap out component and leave a placholder component
    var dummy_div = $('<div>').insertAfter(select);
    select.detach().empty();
    
    selected = selected || $fw.client.preview.getDefaultDeviceId();
    
    // iterate over devices and construct options
    var options = HtmlUtil.optionsFromConfig(Config.app.preview.device, $fw_manager.client.preview.support.formatDeviceText, $fw.client.preview.resolveDevice, true);
    
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
  
        Log.append('chrome:' + self.chromeWidth + ', ' +  self.chromeHeight);
        // add chrome width and height to get the required viewport size
        var resize_width = width + self.chromeWidth,
            resize_height = height + self.chromeHeight;
        Log.append('psize:' + width + 'x' + height + ', wsize:' + resize_width + 'x' + resize_height);
        retWindow.resizeTo(resize_width, resize_height);
      }, 500);
    }
    catch (e) {
      Log.append('failed to open window: ' + e);
    }
    
    return retWindow;
  },
  
  getChromeWidth: function () {
    return this.chromeWidth;
  },
  
  getChromeHeight: function () {
    return this.chromeHeight;
  }
});