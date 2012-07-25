application.AppleResourceManager = application.ResourceManager.extend({
  destination: 'apple',
  
  init: function (opts) {
    
  },
  
  /*
   * Bind any custom callbacks for steps or buttons in steps, based on the destination
   */
  bindGetStartedWizardSteps: function (wizard) {
    var that = this;
    log('binding get started steps for apple');

    wizard.validate({
      rules: {
        key_password: 'required',
        apple_csr_downloaded: 'downloaded'
      }
    });
    
    wizard.find('#apple_getstarted_csr_download').bind('click', function (e) {
      e.preventDefault();
      if (wizard.find('#apple_key_password').val().length > 0) {
        var resources = $fw_manager.client.resource.apple.getResources();
        $fw_manager.app.startDownload(Constants.GENERATE_CSR_URL + "&password=" + wizard.find('#apple_key_password').val());
        resources.private_key = true;
        $fw_manager.client.resource.apple.setResources(resources);
        wizard.find('#apple_csr_downloaded').attr('value', 'downloaded');
        wizard.valid();
      }
      else {
        wizard.valid();
      }
    });
    /*wizard.find('#apple_getstarted_csr').bind('leavingForward', function () {
      var resources = $fw_manager.client.resource.apple.getResources();
      $fw_manager.app.startDownload(Constants.GENERATE_CSR_URL + "&password=" + wizard.find('#apple_key_password').val());
      resources.private_key = true;
      $fw_manager.client.resource.apple.setResources(resources);
    });*/
    wizard.find('#apple_getstarted_finish').bind('show', function () {
      log('apple getstarted wizard finished');
      
      // TODO: better way for this temporary workaround for finishing wizard after successful upload  
      wizard.find('.jw-button-finish').trigger('click');
      
      var resources = $fw_manager.client.resource.apple.getResources();
      if (resources.private_key) {
        log('have a private key, lets go back to the dashboard');
        $fw_manager.client.resource.apple.setupDestination();
      }
      else {
        log('dont have a key yet, lets show the upload key wizard');
        $fw_manager.client.resource.apple.showResourceWizard('private_key');
      }
    });
  }
  
});