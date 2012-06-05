application.DestinationAndroid = application.DestinationGeneral.extend({
  init: function(dest_id){
    this._super(dest_id);   
  },
  
  'export': function(){
      Log.append("android :: Export");
      this.doAsyncExport();
  },
  
  publish: function(){
      this.doAsyncPublish();
  },
  
  resourceCheckCallback: function(res, that){
      Log.append('check resources');
      var main_container = $('#manage_publish_container');
      
      var dist_cert_found = false; 
      for(var i=0;i<res.certificates.length;i++){
          var cert = res.certificates[i];
          if("distribution" === cert.type){
              dist_cert_found = true;
              break;
          }
      }
      
     that.enableButton(main_container.find("#app_android_build_debug"), "debug");
      
      if(dist_cert_found){
         that.enableButton(main_container.find("#app_android_build_release"), "release");
      } else {
         that.disableButton(main_container.find("#app_android_build_release"), "release");
      }    
  },
  
  getExportData: function(wizard, export_version_id){
      var version = wizard.find( export_version_id + ' input:checked').val();
      Log.append("Export version: " + version);
      /*if(version === "" || version === undefined){
         proto.Wizard.jumpToStep(wizard, 1, "Please select the SDK version");
         return null;
      }*/
           
      var data = {generateSrc: true, config: 'debug', version: version};
      return data;
  },
  
  doExportWizardSetup: function (main_container, wizard) {
    wizard.validate({
      rules: {
        app_export_android_versions_radio: {
          required: true
        }
      }
    });
  },
  
  getPublishData: function(config, version_select, wizard) {
      var version = version_select.find("input:checked").val();
      var pk_pass = wizard.find('#app_publish_android_pk_password').val();
      var cert_pass = wizard.find('#app_publish_android_cert_password').val();
      var data = {config: config, generateSrc: false, version: version, privateKeyPass: pk_pass, certPass: cert_pass};
      return data;
  },
  
  bindExtraConfig: function(wizard, config) {
      if(config !== "debug"){
          wizard.find("#app_publish_android_versions").attr('next', 'app_publish_android_password');
      } else {
          wizard.find("#app_publish_android_versions").attr('next', 'app_publish_android_progress');
      }
  }
})