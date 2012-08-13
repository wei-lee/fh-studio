application.PreviewConfigManager = application.ConfigurationManager.extend({
  destination: 'preview',
  
  init: function () {
    this._super();
  },
  
  showInit: function () {
    var self = this;
    var container = $('#preview_configuration_container');
    
    // init any buttons and callbacks
    container.find('#config_preview_save_btn').bind('click', function () {
      $fw.client.config[self.destination].saveConfig();
    });
    
    self.showInitDone = true;
  },
  
  showPost: function () {
    var self = this;
    console.log('showPost preview');
    
    // use preview settings stored in 'config' object of app to populate options
    var opts = Config.app.preview;
    var preview_config = $fw.data.get('inst').config.preview || {};
    var config = {};
    $.each(opts, function (key, val) {
      var temp_val = {};
      // check for choice of options so it can be formatted for <select>
      if ('object' === typeof val) {
        // set selected option
        temp_val = HtmlUtil.optionsFromConfig(val, $fw.client.preview.formatDeviceText);
        temp_val.selected = typeof preview_config[key] !== 'undefined' ? preview_config[key] : val['default'];
      }
      else {
        temp_val = typeof preview_config[key] !== 'undefined' ? preview_config[key] : val;        
      }
      config[key] = temp_val;
    });
    
    var container = $('#preview_configuration_form');

    self.constructConfigDom(config, 'preview', container);
  },
  
  saveConfig: function () {
    console.log('saving preview config');
    var table = $('#configuration_preview_content');
    
    // populate preview config object with form element values
    var preview_config = {};
    var inputs = table.find('input,select,textarea').each(function () {
      var el = $(this);
      var val;
      if (el.is('[type=checkbox]')) {
        val = el.is(':checked');
      }
      else {
        val = el.val();
      }
      preview_config[el.attr('name')] = val;  
    });
    
    console.log('target:' + preview_config.device);
    var device = $fw.client.preview.resolveDevice(preview_config.device);
    
    var inst = $fw.data.get('inst');
    var fields = {
      app: $fw.data.get('app').guid,
      inst: inst.guid,
      title: inst.title,
      description: inst.description,
      height: device.height,
      width: device.width,
      config: $.extend(true, {}, inst.config, {preview: preview_config})
    };
    // call app update with updated 'config' object
    $fw.client.model.App.update(fields, function (result) {
      console.log('update success:' + result);
      $fw.client.dialog.info.flash($fw.client.lang.getLangString('config_saved'));
      $fw.client.app.updateAppData(result.app, result.inst);
      $fw.client.preview.show();
      
    }, function (error) {
      console.log('update config failed:' + error);
      $fw.client.dialog.error(error);
      self.show();
    });
  }
});