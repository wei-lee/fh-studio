application.ResourceManager = Class.extend({
  destination: null,
  
  init: function (opts) {
    
  },
  
  /*
   * Remove all resource flags for the destination 
   */
  flushResources: function () {
    $fw_manager.data.remove(this.destination + '_resources');
  },
  
  /*
   * Set the resources for this destination
   */
  setResources: function (resources) {
    $fw_manager.data.set(this.destination + '_resources', resources);
  },
  
  /*
   * Returns the resorces for the destination, or an empty object if they don't exist
   */
  getResources: function () {
    return $fw_manager.data.get(this.destination + '_resources') || {};
  },
  
  // Show the uploaded resource and relevant buttons e.g. Download, Re-upload, or Upload Now if not uploaded
  showResources: function (resources) {
    // Hide all dashboard content
    var destinations_container = $('#destinations_' + this.destination + '_container');
    destinations_container.find('.dashboard-content').hide();
    
    // Hide all content related to resources being uploaded (only show later if we know the resource is uploaded)
    destinations_container.find('.resource-uploaded').hide();
    
    // reset uploaded resources data
    $fw_manager.client.resource[this.destination].flushResources();
    var destination_resources = {};
    
    for (var ri=0; ri<resources.length; ri++) {
      var temp_resource = resources[ri];
      var resource_div = destinations_container.find('#' + this.destination + '_' + temp_resource.type);
      resource_div.find('h3').addClass('resource-ready');
      resource_div.find('.resource-not-uploaded').hide();
      resource_div.find('.resource-uploaded').show();
      resource_div.find('.resource-download').data('guid', temp_resource.guid).unbind().bind('click', function () {
        var guid = $(this).data('guid');
        console.log('download clicked for resource with guid: ' + guid);
        $fw_manager.app.startDownload(Constants.DOWNLOAD_RESOURCE_URL + '?guid=' + guid);
      });
      destination_resources[temp_resource.type] = true;
    }
    $fw_manager.client.resource[this.destination].setResources(destination_resources);
    
    console.log('show resources for destination: ' + this.destination);
    $('#' + this.destination + '_resources').show();
  },
  
  /*
   * Hide all dashboard components and show the get started help
   */
  showGetStarted: function () {
    var destinations_container = $('#destinations_' + this.destination + '_container');
    destinations_container.find('.dashboard-content').hide();
    
    $('#' + this.destination + '_getstarted').show();
  },
  
  /*
   * Hide all dashboard components and setup and show the get started wizard
   */
  showGetStartedWizard: function () {
    var that = this;
    // TODO: refactor duplicated code below
    var destinations_container = $('#destinations_' + that.destination + '_container');
    destinations_container.find('.dashboard-content').hide();
     
    var getstarted_wizard = proto.Wizard.load(that.destination + '_getstarted_wizard', {
      cancel: function () {
        $fw_manager.client.resource[that.destination].setupDestination();
      },
      validate: true
    }, {
      modal: false,
      container: '#' + that.destination + '_resource_wizard_container'
    });
    
    $fw_manager.client.resource[that.destination].bindGetStartedWizardSteps( getstarted_wizard );
  },
  
  /*
   * Check what resources are already uploaded and either show the resources dashboard or
   * show the get started dashboard
   */
  setupDestination: function () {
    var that = this;
    console.log('setupDestination ' + that.destination);
    var destinations_container = $('#destinations_' + that.destination + '_container');
    destinations_container.find('.dashboard-content').hide();
    
    // Initialise resource buttons if not already done
    if ('undefined' === typeof that[that.destination + '_buttons']) {
      console.log('binding buttons for ' + that.destination);
      $('#' + that.destination + '_getstarted_resource').find('.resource-getstarted').data('destination', that.destination).unbind().bind('click', function () {
        var dest = $(this).data('destination');
        console.log(dest + '_getstarted_resource button clicked');
        $fw_manager.client.resource[dest].showGetStartedWizard();
      });
      destinations_container.find('.resource-uploadnow, .resource-reupload').data('destination', that.destination).unbind().bind('click', function () {
        var dest = $(this).data('destination');
        // Find the resource div we are in
        var resource_div = $(this).closest('.resource-div');
        var resource_id = resource_div.attr('id');
        // get the cert type from the resource div id
        var resource_type = resource_id.replace(resource_id.split('_')[0] + '_','');
        $fw_manager.client.resource[dest].showResourceWizard(resource_type);
      });
      that[that.destination + '_buttons'] = true;
    }
    $fw_manager.client.resource[that.destination].checkResources();
  },
  
  checkResources: function(){  
    // get resource info from server, more specifically, whether or not a developer cert and/or distribution cert were uploaded
    // TODO: use $fw_manager.server for this cal
    // TODO: code duplication of dest determination
    var that = this;
    var dest = 'apple' === that.destination ? 'iphone' : that.destination;
    $.post(Constants.LIST_RESOURCES_URL, {
      dest: dest
    }, function (result) {
      console.log('list resources response > ' + JSON.stringify(result));
      
      // Combine the resources in the result to a single array and set the type of them accordingly
      var resources = [];
      var certs = result.certificates;
      for (var ci=0; ci<certs.length; ci++) {
        var temp_cert = certs[ci];
        resources.push({type: temp_cert.type + '_cert', guid: temp_cert.guid});
      }
      var keys = result.privatekeys;
      for (var ki=0; ki<keys.length; ki++) {
        var temp_key = keys[ki];
        resources.push({type: 'private_key', guid: temp_key.guid});
      }
      $('#profile_view_container').hide();
      if (resources.length > 0) {
        // have at least one resource, so show the dashboard
        $fw_manager.client.resource[that.destination].showResources(resources);
      }
      else {
        // no resources uploaded yet, show get started
        $fw_manager.client.resource[that.destination].showGetStarted();
      }
      
    });
  },
  
  /*
   * Based on the resource_type passed in, show the appropriate wizard
   */
  showResourceWizard: function (resource_type) {
    if ('private_key' === resource_type) {
      $fw_manager.client.resource[this.destination].showUploadKeyWizard();
    } else if ('csk' === resource_type || 'db' === resource_type){
      $fw_manager.client.resource[this.destination].showOtherResWizard(resource_type);
    } else {
      $fw_manager.client.resource[this.destination].showUploadCertWizard(resource_type);
    }
  },
  
  /*
   * Hide all dashboard items and only show the upload private key wizard
   */
  showUploadKeyWizard: function () {
    var that = this;
    
    var destinations_container = $('#destinations_' + that.destination + '_container');
    destinations_container.find('.dashboard-content').hide();
    
    var key_wizard = proto.Wizard.load(that.destination + '_key_wizard', {
      validate: true,
      cancel: function () {
        $fw_manager.client.resource[that.destination].setupDestination();
      },
      finish: function () {
        $fw_manager.client.resource[that.destination].setupDestination();
      }
    }, {
      modal: false,
      container: '#' + that.destination + '_resource_wizard_container'
    }); 
    var validation_rules = {};
    validation_rules[that.destination + '_key_upload_file'] = 'required';
    key_wizard.validate({
      rules: validation_rules
    });
    // TODO: refactor, code duplication below !!!
    key_wizard.find('#' + that.destination + '_key_finish').bind('show', function () {
      console.log('uploading key');
      var step = $(this);
      
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Upload');
      
      // TODO: remove this apple/iphone specific check
      var upload_dest = 'apple' === that.destination ? 'iphone' : that.destination;
      var file_input_id = that.destination + '_key_upload_file';
      var upload_url = Constants.UPLOAD_RESOURCE_URL;
      var data = {
        dest: upload_dest,
        resourceType: 'privatekey',
        buildType: key_wizard.find('#'+that.destination+'_key_type').val()
      };
      console.log("params: " + JSON.stringify(data));
      $fw_manager.app.startUpload(key_wizard.find('#' + file_input_id), upload_url, data, function (result) {
        console.log('upload result > ' + JSON.stringify(result));
        if ('undefined' !== typeof result.error && result.error.length > 0) {
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
          proto.Wizard.previousStep(key_wizard, result.error);
        }   
        else {  
          // fill progress bar and trigger finish
          proto.ProgressDialog.setProgress(step, 100);
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_complete'));     
          
          // TODO: better way for this temporary workaround for finishing wizard after successful upload  
          key_wizard.find('.jw-button-finish').trigger('click');
        }
      }, false, function(xhr, err){
        var error = $fw.client.lang.getLangString('file_upload_error');
        proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
        proto.Wizard.previousStep(key_wizard, error);
      });
    });
  },
  
  /*
   * Setup the cert wizard if needed,
   * and make it the only visible element in the account area
   */
  showUploadCertWizard: function (resource_type) {
    var that = this;
    // default build type to debug
    var build_type = null;
    if ('distribution_cert' === resource_type) {
      build_type = 'distribution';
    }
    else if('debug_cert' === resource_type) {
      build_type = 'debug';
    }
    
    console.log('showing resource wizard for destination: ' + that.destination + ',and resource_type:' + resource_type);
    var destinations_container = $('#destinations_' + that.destination + '_container');
    destinations_container.find('.dashboard-content').hide();
    
    // TODO: better way to access these global variables??
    var cert_wizard = proto.Wizard.load( that.destination + '_cert_wizard', {
      validate: true,
      cancel: function () {
        $fw_manager.client.resource[that.destination].setupDestination();
      },
      finish: function () {
        $fw_manager.client.resource[that.destination].setupDestination();
      }
    });
    var validation_rules = {};
    validation_rules[that.destination + '_cert_upload_file'] = 'required';
    cert_wizard.validate({
      rules: validation_rules
    });
    cert_wizard.find('#' + that.destination + '_cert_finish').bind('show', function () {
      var dest = that.destination;
      console.log('uploading cert');
      var step = $(this);
      
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Upload');
      
      var upload_dest = 'apple' === dest ? 'iphone' : dest;
      
      var file_input_id = dest + '_cert_upload_file';
      var upload_url = Constants.UPLOAD_RESOURCE_URL;
      var data = {
        dest: upload_dest,
        resourceType: 'certificate',
        buildType: build_type
      };
      
      $fw_manager.app.startUpload(cert_wizard.find('#' + file_input_id), upload_url, data, function (result) {
        console.log('upload result > ' + JSON.stringify(result));
        if ('undefined' !== typeof result.error && result.error.length > 0) {
          console.log('upload failed');
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
          proto.Wizard.previousStep(cert_wizard, result.error);
        }
        else {
          console.log('upload Complete');
          
          // TODO: better way for this temporary workaround for finishing wizard after successful upload  
          cert_wizard.find('.jw-button-finish').trigger('click');
          
          proto.ProgressDialog.setProgress(step, 100);
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_complete'));
        }
      }, false, function(xhr, err){
        var error = $fw.client.lang.getLangString('file_upload_error');
        proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
        proto.Wizard.previousStep(cert_wizard, error);
      });
    });
  },
  
  showOtherResWizard: function(resource_type){
    var that = this;
    
    var destinations_container = $('#destinations_' + that.destination + '_container');
    destinations_container.find('.dashboard-content').hide();
    
    var res_wizard = proto.Wizard.load(that.destination + '_'+ resource_type +'_wizard', {
      validate: true,
      cancel: function () {
        $fw_manager.client.resource[that.destination].setupDestination();
      },
      finish: function () {
        $fw_manager.client.resource[that.destination].setupDestination();
      }
    }, {
      modal: false,
      container: '#' + that.destination + '_resource_wizard_container'
    }); 
    var validation_rules = {};
    validation_rules[that.destination + '_'+resource_type+'_upload_file'] = 'required';
    res_wizard.validate({
      rules: validation_rules
    });
    // TODO: refactor, code duplication below !!!
    res_wizard.find('#' + that.destination + '_'+resource_type+'_finish').bind('show', function () {
      console.log('uploading ' + resource_type);
      var step = $(this);
      
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Upload');
      
      // TODO: remove this apple/iphone specific check
      var upload_dest = that.destination;
      var file_input_id = that.destination + '_' + resource_type +'_upload_file';
      var upload_url = Constants.UPLOAD_RESOURCE_URL;
      var data = {
        dest: upload_dest,
        resourceType: resource_type,
        buildType: 'release'
      };
      console.log("params: " + JSON.stringify(data));
     $fw_manager.app.startUpload(res_wizard.find('#' + file_input_id), upload_url, data, function (result) {
        console.log('upload result > ' + JSON.stringify(result));
        if ('undefined' !== typeof result.error && result.error.length > 0) {  
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
          proto.Wizard.previousStep(res_wizard, result.error);
        }   
        else {  
          // TODO: better way for this temporary workaround for finishing wizard after successful upload  
          res_wizard.find('.jw-button-finish').trigger('click');
          
          proto.ProgressDialog.setProgress(step, 100);
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_complete'));     
        }
      }, false, function(xhr, err){
        var error = $fw.client.lang.getLangString('file_upload_error');
        proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
        proto.Wizard.previousStep(res_wizard, error);
      });
    });
  }
  
});