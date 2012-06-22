application.DestinationIos = application.DestinationGeneral.extend({
  dev_resources: null,

  init: function (dest_id) {
    this._super(dest_id);
  },

  'export': function () {
    Log.append("iOS - " + this.destination_id + " :: Export");
    this.doAsyncExport();
  },

  publish: function () {
    this.doAsyncPublish();
  },

  resourceCheckCallback: function (res, that) {
    var main_container = $('#app_publish_' + this.destination_id + '_build');
    that.dev_resources = res;
    var dist_cert_found = false;
    var debug_cert_found = false;
    for (var i = 0; i < res.certificates.length; i++) {
      var cert = res.certificates[i];
      if ("distribution" === cert.type) {
        dist_cert_found = true;
        continue;
      }
      if ("debug" === cert.type) {
        debug_cert_found = true;
        continue;
      }
    }

    if (debug_cert_found) {
      that.enableButton(main_container.find("#app_ios_build_debug"), 'debug');
    } else {
      that.disableButton(main_container.find("#app_ios_build_debug"), 'debug');
    }

    if (dist_cert_found) {
      that.enableButton(main_container.find("#app_ios_build_distribution"), 'distribution');
      that.enableButton(main_container.find("#app_ios_build_release"), 'release');
    } else {
      that.disableButton(main_container.find("#app_ios_build_distribution"), 'distribution');
      that.disableButton(main_container.find("#app_ios_build_release"), 'release');
    }
  },

  doPublishWizardSetup: function (main_container, wizard) {
    var rules = {};
    rules[this.destination_id + '_provisioning_upload_file'] = 'required';
    wizard.validate({
      rules: rules
    });
  },

  bindFileUploadProgress: function (config, wizard) {
    var that = this;
    wizard.find("#app_publish_" + that.destination_id + "_upload_progress").bind("show", function () {
      var step = $(this);
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Upload');

      var upload_url = Constants.UPLOAD_RESOURCE_URL;
      var data = {
        dest: that.destination_id,
        resourceType: 'provisioning',
        buildType: config,
        templateInstance: $fw_manager.data.get('inst').guid
      };
      $fw_manager.app.startUpload(wizard.find("#" + that.destination_id + "_provisioning_upload_file"), upload_url, data, function (result) {
        if ('undefined' !== typeof result.error && result.error.length > 0) {
          Log.append('upload failed');
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_failed'));
          proto.Wizard.previousStep(wizard, result.error);
        } else {
          Log.append('upload Complete');
          proto.ProgressDialog.setProgress(step, 100);
          proto.ProgressDialog.append(step, $fw.client.lang.getLangString('file_upload_complete'));
          wizard.jWizard("nextStep");
        }
      });
    });
  },

  changeWizardStep: function (config, wizard) {
    this._super(config, wizard);
    var found_prov = false;
    for (var i = 0; i < this.dev_resources.provisionings.length; i++) {
      Log.append(JSON.stringify(this.dev_resources.provisionings[i]));
      var provisioning = this.dev_resources.provisionings[i];
      Log.append("temp:" + $fw_manager.data.get("inst").guid);
      Log.append("config: " + config);
      if ($fw_manager.data.get('inst').guid.toLowerCase() === provisioning.templateInstance.toLowerCase() && config.toLowerCase() === provisioning.type.toLowerCase()) {
        Log.append("pro temp:" + provisioning.templateInstance);
        Log.append("pro type:" + provisioning.type);
        found_prov = true;
        break;
      }
    }
    if (!found_prov) {
      proto.Wizard.jumpToStep(wizard, 2);
      proto.Wizard.hidePreviousButton(wizard);
    } else {
      proto.Wizard.jumpToStep(wizard, 1);
    }
  },

  getExportData: function (wizard) {
    var export_version_id = '#app_export_' + this.destination_id + '_versions';
    var version = wizard.find(export_version_id + ' input:checked').val();
    Log.append("Export version: " + version);
    if (version === "" || version === undefined) {
      proto.Wizard.jumpToStep(wizard, 2, "Please select the SDK version");
      return null;
    }
    var data = {
      generateSrc: true,
      config: 'debug',
      version: version,
      deviceType: this.destination_id
    };
    return data;
  },

  getPublishData: function (config, versions_select, wizard) {
    var export_version_id = '#app_publish_' + this.destination_id + '_versions';
    var version = wizard.find(export_version_id + ' input:checked').val();
    var pk_pass = wizard.find("#app_publish_" + this.destination_id + "_pk_password").val();
    var cert_pass = wizard.find("#app_publish_" + this.destination_id + "_cert_password").val();
    Log.append("cert pass: " + cert_pass);
    Log.append("Export version: " + version);
    var data = {
      generateSrc: false,
      config: config,
      version: version,
      deviceType: this.destination_id,
      privateKeyPass: pk_pass,
      certPass: cert_pass
    };
    return data;
  }

});