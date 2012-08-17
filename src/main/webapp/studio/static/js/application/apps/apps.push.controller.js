var Apps = Apps || {};

Apps.Push = Apps.Push || {};

Apps.Push.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    push_urbanairship_container: "#push_urbanairship_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,
  showPreview: true,
  options: ['ua_push_dev_app_key', 'ua_push_dev_app_secret', 'ua_push_dev_master_secret', 'ua_push_prod_app_key', 'ua_push_prod_app_secret', 'ua_push_prod_master_secret', 'ua_push_transport', 'ua_push_c2dm_sender'],

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    var self = this;
    $('#push_urbanairship_save_button').bind('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      self.saveSettings();
    });
    $('#ua_push_enabled').bind('change', function(){
      if(this.checked){
        $('#push_urbanairship_settings').find('.push_settings').show();
        $('#app_android_id').val(self.getPackageName());
      }  else {
        $('#push_urbanairship_settings').find('.push_settings').hide();
      }
    });
    $fw.client.lang.insertLangForContainer($(self.views.push_urbanairship_container));
  },

  show: function(){
    this._super();
    
    // TODO
    this.hide();
    this.container = this.views.push_urbanairship_container;

    this.initFn();
    this.loadSettings();

    $(this.container).show();
  },
  
  loadSettings: function(){
    var inst_config = {ua_push:$fw.data.get('inst').config.ua_push};
    
    if(inst_config.ua_push){
      var push_config = inst_config.ua_push;
      for(var key in push_config){
        if(key == "ua_push_enabled"){
            if(push_config[key]){
              $('#' + key)[0].checked = true;
            } else {
              $('#' + key)[0].checked = false;
            }
        }else {
          $('#' + key).val(push_config[key]);
        }
      }
      if(push_config.ua_push_enabled){
        $('#push_urbanairship_settings').find('.push_settings').show();
      } else {
        $('#push_urbanairship_settings').find('.push_settings').hide();
      }
      $('#app_android_id').val(this.getPackageName());
    }
  },
  
  saveSettings: function(){
    var ua_config = {'ua_push_enabled': $('#ua_push_enabled')[0].checked? true: false};
    for(var i=0;i<this.options.length;i++){
      ua_config[this.options[i]] = $('#' + this.options[i]).val();
    }
    var inst = $fw.data.get('inst');
    inst.config = $.extend({}, true, inst.config, {ua_push: ua_config});
    $fw.data.set('inst', inst);
    // FIXME: app details may not have been shown yet, causing 'title' validation error
    $fw.client.tab.apps.manageapps.controllers['apps.details.controller'].doUpdate($.noop);
  },
  
  
  getPackageName: function(){
    var guid = 'fh' + $fw.data.get('inst').guid;
    var packageName = "com.feedhenry." + guid.replace(/\W/g, '_');
    return packageName;
  }

});