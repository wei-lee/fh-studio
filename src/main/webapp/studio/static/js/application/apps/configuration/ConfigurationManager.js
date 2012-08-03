application.ConfigurationManager = Class.extend({
  support: null,
  hiddenOptions: {},
  replaceOptions: {},

  init: function () {
    this.support = new application.ConfigurationSupport();
    this.hiddenOptions = {'status':true};
  },
  
  show: function () {
    var self = this;
    console.log('show config for ' + self.destination);
    
    if (!self.showInitDone) {
      if ($.isFunction(self.showInit)) {
        self.showInit();
      }
    } 
    else {
      if ($.isFunction(self.showReset)) {
        self.showReset();
      }
    }
    
    if ($.isFunction(self.showPost)) {
      self.showPost();
    }
  },
  
  /*
   * Once-off initialisation of any required components
   */
  showInit: function () {
    var self = this;
    var container = $('#configuration_' + self.destination + '_container');
    
    // init any buttons and callbacks
    container.find('#config_' + self.destination + '_save_btn').bind('click', function () {
      $fw_manager.client.config[self.destination].saveConfig();
    });
    
    self.showInitDone = true;
  },
  
  showPost: function () {
    var self = this;
    console.log("Get configration for : " + self.destination);

    $fw_manager.data.set("config-dest", self.destination);
    var container = $('#configuration_' + self.destination + '_form');
    var template = $fw_manager.data.get("inst").guid;

    console.log("container = " + '#configuration_' + self.destination + '_form');

    $fw_manager.server.post(Constants.LIST_CONFIG_URL, {
      template: template,
      destination: self.destination
    }, function (res) {
      self.constructConfigDom(res, self.destination, container, self.hiddenOptions, self.replaceOptions);
    });    

  },

  saveConfig: function () {
    var self = this,
        data, key, val,
        template = $fw_manager.data.get("inst").guid,
        dest = $fw_manager.data.get("config-dest"),
        form = $('#configuration_' + dest + '_form'),
        newConfig = {};
    
    if(typeof self.validateForm === "function"){
      if(!self.validateForm()){
        return;
      }
    }
    // Iterate over each config option and put it in newConfig
    form.find('.config_option').each(function (i, el) {
      key = $(el).attr('name');
      console.log("key:" + key);
      val = $(el).val();
      if ($(el).attr("type") === "checkbox") {
        if ($(el).prop("checked")) {
          if (key === "accessType") {
            val = "p";
          } else {
            val = "true";
          }
        } else {
          if (key === "accessType") {
            val = "s";
          } else {
            val = "false";
          }
        }
      }
      newConfig[key] = val;
    });
    
    // Construct update data object
    data = {
      template: template,
      destination: dest,
      config: newConfig
    };
    
    // Call update url, passing in data
    $fw_manager.server.post(Constants.UPDATE_CONFIG_URL, data, function (res) {
      if (res.status === "ok") {
        $fw_manager.client.dialog.info.flash($fw_manager.client.lang.getLangString('config_saved'));
      } else {
        console.log('update config failed:' + res);
        self.show();
      }
    });
  },

  constructConfigDom: function (config, dest, container, hiddenOptions, replaceOptions) {
    return this.support.constructConfigDom(config, dest, container, hiddenOptions, replaceOptions);
  }

});