application.DestinationBlackberry = application.DestinationGeneral.extend({
  
  init: function(dest_id){
      this._super(dest_id);
  },
  
  'export': function(){
      log("blackberry :: Export");
      this.doAsyncExport();
  },
  
  getExportData: function(wizard){
      var export_version_id = '#app_export_blackberry_versions';
      var version = wizard.find( export_version_id + ' input:checked').val();
      log("Export version: " + version);
      if(version === "" || version === undefined){
          proto.Wizard.jumpToStep(wizard, 1, "Please select the OS version");
          return null;
      }
      var data = {generateSrc: true, config: 'debug', version: version};
      return data;
  },
  
  'publish': function(){
      this.doAsyncPublish();
  },
  
  resourceCheckCallback: function(res, that){
      log('check resources');
      var main_container = $('#manage_publish_container');
      
      var csk_found = false; 
      var db_found = false;
      if(res.csk && res.csk.length > 0){
          csk_found = true;
      }
      if(res.db && res.db.length > 0){
          db_found = true;
      }
      
     that.enableButton(main_container.find("#app_blackberry_build_debug"), "debug", "You can build unsigned release version of the app. This app can be run on a Blackberry emulator");
      
      if(csk_found && db_found){
         that.enableButton(main_container.find("#app_blackberry_build_release"), "release", "You can build signed release version of the app. This app can be run on a Blackberry device");
      } else {
         that.disableButton(main_container.find("#app_blackberry_build_release"), "release", "You can not build signed release version of the app until you have required resources uploaded");
      }    
  },
  
  doExportWizardSetup: function (main_container, wizard) {
    wizard.validate({
      rules: {
        app_export_blackberry_versions_radio: {
          required: true
        }
      }
    });
  },
  
  getPublishData: function(config, version_select, wizard) {
      var version = version_select.find("input:checked").val();
      var pk_pass = wizard.find('#app_publish_blackberry_pk_password').val();
      var cert_pass = "";
      var data = {config: config, generateSrc: false, version: version, privateKeyPass: pk_pass, certPass: cert_pass};
      return data;
  },
  
  bindExtraConfig: function(wizard, config) {
      if(config !== "debug"){
          wizard.find("#app_publish_blackberry_versions").attr('next', 'app_publish_blackberry_password');
      } else {
          wizard.find("#app_publish_blackberry_versions").attr('next', 'app_publish_blackberry_progress');
      }
  }
});