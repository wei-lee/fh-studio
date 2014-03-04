application.DestinationAndroid = application.DestinationGeneral.extend({
  init: function(dest_id){
    this._super(dest_id);   
  },
  
  'export': function(){
      console.log("android :: Export");
      this.doAsyncExport();
  },
  
  publish: function(){
      this.doAsyncPublish();
  },
  
  resourceCheckCallback: function(res, that){
      console.log('check resources');
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
      var version =  "4.0";//wizard.find( export_version_id + ' input:checked').val();
      console.log("Export version: " + version);
      /*if(version === "" || version === undefined){
         proto.Wizard.jumpToStep(wizard, 1, "Please select the SDK version");
         return null;
      }*/
           
      var data = {generateSrc: true, config: 'debug', version: version};
      data = this.getCordovaVersion(wizard, data);
      return data;
  },
  
  doExportWizardSetup: function (main_container, wizard) {
    /*wizard.validate({
      rules: {
        app_export_android_versions_radio: {
          required: true
        }
      }
    });*/
  },
  
  getPublishData: function(config, version_select, wizard) {
      var version = "4.0"; //version_select.find("input:checked").val();
      var pk_pass = wizard.find('#app_publish_android_pk_password').val();
      var cert_pass = wizard.find('#app_publish_android_cert_password').val();
      var data = {config: config, generateSrc: false, version: version, privateKeyPass: pk_pass, certPass: cert_pass};
      data = this.getMDMConfig(wizard, data);
      data = this.getCordovaVersion(wizard, data);
      return data;
  },
  
  bindExtraConfig: function(wizard, config) {
    var stepId = 'app_publish_android_info';
    if($fw.getClientProp('mdm.enabled') === 'true'){
      stepId = 'app_publish_mdm_config';
    }
    if($fw.getClientProp('cordova-version-selection') === 'true'){
      stepId = 'app_publish_cordova_versions_config';
    }
    if(config !== "debug"){
      wizard.find("#" + stepId).attr('next', 'app_publish_android_password');
    } else {
      wizard.find("#" + stepId).attr('next', 'app_publish_android_progress');
    }
  }
});