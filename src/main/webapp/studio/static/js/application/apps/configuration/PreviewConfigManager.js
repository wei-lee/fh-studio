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
      $fw_manager.client.config[self.destination].saveConfig();
    });
    
    self.showInitDone = true;
  },
  
  showPost: function () {
    var self = this;
    Log.append('showPost preview');
    
    // use preview settings stored in 'config' object of app to populate options
    var opts = Config.app.preview;
    var preview_config = $fw_manager.data.get('inst').config.preview || {};
    var config = {};
    $.each(opts, function (key, val) {
      var temp_val = {};
      // check for choice of options so it can be formatted for <select>
      if ('object' === typeof val) {
        // set selected option
        temp_val = HtmlUtil.optionsFromConfig(val, $fw_manager.client.preview.formatDeviceText);
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
    Log.append('saving preview config');
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
    
    Log.append('target:' + preview_config.device);
    var device = $fw.client.preview.resolveDevice(preview_config.device);
    
    var inst = $fw_manager.data.get('inst');
    var fields = {
      app: $fw_manager.data.get('app').guid,
      inst: inst.guid,
      title: inst.title,
      description: inst.description,
      height: device.height,
      width: device.width,
      config: $.extend(true, {}, inst.config, {preview: preview_config})
    };
    // call app update with updated 'config' object
    $fw_manager.client.model.App.update(fields, function (result) {
      Log.append('update success:' + result);
      $fw_manager.client.dialog.info.flash($fw_manager.client.lang.getLangString('config_saved'));
      $fw_manager.client.app.updateAppData(result.app, result.inst);
      $fw_manager.client.preview.show();
      
    }, function (error) {
      Log.append('update config failed:' + error);
      $fw_manager.client.dialog.error(error);
      self.show();
    });
  }
});