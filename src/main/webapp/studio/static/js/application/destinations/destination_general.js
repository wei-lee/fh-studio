application.DestinationGeneral = Class.extend({

  destination_id: null,
  base_url: null,

  init: function(dest_id) {
    this.destination_id = dest_id;
    this.base_url = Constants.WID_URL_PREFIX + this.destination_id + "/" + $fw_manager.data.get('inst').guid + "/deliver";
  },

  doGeneration: function(is_source) {
    var that = this;
    if (is_source) {
      var error_msg = "free_source_export_disabled";
      // Only allow non free accounts to export source
      // If this client-side check is by-passed, the server also checks
      // the user account type
      if ($fw.getClientProp('accountType') !== 'free') {
        that['export']();
      } else {
        $fw_manager.client.dialog.error($fw_manager.client.lang.getLangString(error_msg));
      }
    } else {
      that.publish();
    }
  },

  'export': function() {
    console.log("generate for " + this.destination_id + ":: Type: Export");
    var url = this.base_url + "?generateSrc=true";
    $fw_manager.app.startDownload(url);
  },

  publish: function() {
    var url = this.base_url + "?generateSrc=false";
    $fw_manager.app.startDownload(url);
  },

  doAsyncExport: function() {
    var that = this;
    var main_container = $('#manage_export_container');
    main_container.find(".dashboard-content").hide();
    main_container.find("#app_export_wizard_container").show();
    var wizard_name = this.destination_id + "_export_wizard";
    var progress_id = '#app_export_' + this.destination_id + '_progress';
    var export_version_id = '#app_export_' + this.destination_id + '_versions';
    var wizard = proto.Wizard.load(wizard_name, {
      cancel: function() {
        that.showDestinations('export');
      },
      finish: function() {
        that.showDestinations('export');
      },
      validate: true
    }, {
      modal: false,
      container: '#app_export_wizard_container'
    });

    if ($.isFunction(this.bindVersionViewShow)) {
      this.bindVersionViewShow('#app_export_device_types', '#app_export_iphone_versions, #app_export_ipad_versions', wizard, 1);
    }

    // call any destination specific setup
    this.doExportWizardSetup(main_container, wizard);
    wizard.find(export_version_id).bind('postShow', function() {
      proto.Wizard.showCancelButton(wizard);
    });

    wizard.find(progress_id).bind('show', function(e) {
      var data = that.getExportData(wizard, export_version_id);
      if (null === data) {
        return;
      }
      var step = $(this);
      that.showGenerateProgress("Export", wizard, data, step, function(res) {
        // TODO: better way for this temporary workaround for finishing wizard after successful upload  
        wizard.find('.jw-button-finish').trigger('click');

        if (res.error) {
          $fw_manager.client.dialog.error($fw_manager.client.lang.getLangString('free_source_export_disabled'));
        } else if (res.action && res.action.url) {
          var source_url = res.action.url;
          $fw_manager.app.startDownload(source_url);
        }
      });
    }).bind('postShow', function() {
      proto.Wizard.hideCancelButton(wizard);
    });
  },

  doExportWizardSetup: function(main_container, wizard) {
    // abstract interface
    wizard.validate();
  },


  showGenerateProgress: function(type, wizard, data, step, complete) {
    var that = this;
    proto.ProgressDialog.resetBarAndLog(step);
    proto.ProgressDialog.setProgress(step, 1);
    proto.ProgressDialog.append(step, 'Starting ' + type);

    console.log('sending request to server');
    console.log('request url ' + that.base_url);

    $.post(that.base_url, data, function(result) {

      console.log('import result > ' + JSON.stringify(result));
      var cacheKey, stageKey;

      cacheKey = result.cacheKey;
      stageKey = result.stageKey;

      // If the cache key was sent back, set up a new asynchronous server task to 
      // repeatedly look for updates on the task progress  
      var progress_val = 3;
      if ('undefined' !== typeof cacheKey && cacheKey.length > 0) {
        var cacheKeys = [{
          cacheKey: cacheKey,
          complete: function(res) {
            proto.ProgressDialog.setProgress(step, 100);
            proto.ProgressDialog.append(step, "Starting Download");
            console.log('jumping to final step and hiding progress dialog');
            setTimeout(function() {
              complete(res);
            }, 1000);
          }
        }];
        var taskNames = {};
        taskNames[cacheKey] = 'BUILD';
        // TODO: Logging the progress of app staging may be an unnecessary slowdown
        //       because after building an app there is a time lag anyways before
        //       the app is deployed to a device/simulator
        if ('undefined' !== typeof stageKey && stageKey.length > 0) {
          cacheKeys.push({
            cacheKey: stageKey
          });
          taskNames[stageKey] = 'STAGING';
        }

        var export_task = new ASyncServerTask(cacheKeys, {
          updateInterval: Properties.cache_lookup_interval,
          maxTime: Properties.cache_lookup_timeout,
          timeout: function(res) {
            console.log('timeout error > ' + JSON.stringify(res));
            proto.Wizard.jumpToStep(wizard, 1, type + ' timed out');
          },
          update: function(res) {
            for (var i = 0; i < res.log.length; i++) {
              // If there's more than one task, send on the task name to the progress dialog
              if (cacheKeys.length > 1) {
                proto.ProgressDialog.append(step, res.log[i], taskNames[res.cacheKey]);
              } else {
                proto.ProgressDialog.append(step, res.log[i]);
              }
              if (res.log[i] && res.log[i].length > 0) {
                console.log("increase progress: " + progress_val);
                progress_val = progress_val + 3;
                proto.ProgressDialog.setProgress(step, parseInt(progress_val, 10));
              }
            }
          },
          error: function(res) {
            console.log('export error > ' + JSON.stringify(res));
            proto.Wizard.jumpToStep(wizard, 1, res.error);
          },
          end: function() {
            // no need to do anything here
          }
        });
        export_task.run();
      } else if (result.error) {
        // Exporting of source disabled.
        console.log('export error > Exporting of source disabled');
        complete(result);
      }
    });
  },

  enableButton: function(button, type, text) {
    var that = this;
    button.find("h3").addClass("resource-ready").parent().find("button.resource-uploaded").unbind().click(

    function() {
      that.startBuild(type);
    }).show().parent().find('button.resource-not-uploaded').hide();

    var content_text = text ? text : "You can start to build " + type + " version of the app";
    button.find('.resource-content').text(content_text);
  },

  disableButton: function(button, type, text) {
    var that = this;
    button.find("h3").parent().find("button.resource-not-uploaded").unbind().click(

    function() {
      that.redirectToAccount(that.destination_id);
    }).show().parent().find('button.resource-uploaded').hide();

    var content_text = text ? text : "You can not build " + type + " version of the app until you have uploaded your certificate";
    button.find('.resource-content').text(content_text);
  },
  redirectToAccount: function(target) {
    // TODO: use id's instead of indexes
    // force state to show relevant accordion item
    $fw_manager.state.set('account_accordion', 'selected', 1);
    $fw_manager.state.set('account_accordion_accordion_item_destinations', 'selected', ((target === 'iphone') || (target === 'ipad')) ? 0 : 1);

    $('#account_tab').click();
  },

  showDestinations: function() {
    var type;
    if (arguments.length === 0) {
      type = 'publish';
    } else {
      type = arguments[0];
    }
    var main_container = $('#manage_' + type + '_container');
    main_container.find(".dashboard-content").hide();
    main_container.find("#app_" + type + "_destinations").show();
  },

  doAsyncPublish: function() {
    console.log("Publish :: " + this.destination_id);
    var main_container = $('#manage_publish_container');
    main_container.find(".dashboard-content").hide();
    var that = this;
    $.post(Constants.LIST_RESOURCES_URL, {
      dest: this.destination_id,
      appId: $fw_manager.data.get('inst').guid
    }, function(res) {
      that.resourceCheckCallback(res, that);
      console.log('resource checked :: ' + that.destination_id);
      main_container.find('#app_publish_' + that.destination_id + '_build').show();
      main_container.find("#app_publish_" + that.destination_id).show();
    });
  },

  startDeploy: function(config, wizard, step) {
    var self = this;

    // To stage or not to stage?
    var checkbox = $(wizard).find("input[name='app_publish_" + this.destination_id + "_deploying']:checked");

    function skip() {
      setTimeout(function() {
        if (self.destination_id == 'ipad' || self.destination_id == 'iphone') {
          proto.Wizard.jumpToStep(wizard, 6);
        } else {
          proto.Wizard.jumpToStep(wizard, 3);
        }
      }, 0);
    }
    
    if (checkbox.length < 1) {
      // Don't stage
      return skip();
    }

    var deploying_env;
    if (config == 'distribution' || config == 'release') {
      deploying_env = 'live';
    } else {
      deploying_env = 'dev';
    }


    // Clear visible progresslog
    $('#wizard_dialog .progresslog:visible').val('');

    console.log("Starting deploy :: " + deploying_env);

    if (deploying_env == 'dev') {
      self.doDevDeploy(wizard, step);
    } else if (deploying_env == 'live') {
      self.doLiveDeploy(wizard, step);
    }
  },

  doDevDeploy: function(wizard, step) {
    console.log('destination_general.doDevDeploy');
    var self = this;
    var guid = $fw_manager.data.get('app').guid;
    var url = Constants.DEPLOY_APP_URL;
    var params = {
      guid: guid
    };

    $fw_manager.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.deployStarted("dev", res.cacheKey, wizard, step);
      } else {
        console.log('dev deploy failed:' + res);
      }
    }, null, true);
  },

  doLiveDeploy: function(wizard, step) {
    console.log('destination_general.doLiveDeploy');
    var self = this;
    var guid = $fw_manager.data.get('app').guid;
    var url = Constants.RELEASE_DEPLOY_APP_URL;
    var params = {
      guid: guid
    };
    $fw_manager.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.deployStarted("live", res.cacheKey, wizard, step);
      } else {
        console.log('live deploy failed:' + res);
      }
    }, null, true);
  },

  updateProgressLog: function(env, log) {
    var self = this;
    var progress_log_el = $('#wizard_dialog .progresslog:visible');

    if (log.length > 0) {
      var current_log = progress_log_el.val();
      var log_value = current_log + '\n' + log.join('\n');
      progress_log_el.val(log_value);
    }
  },

  deployComplete: function(wizard, step) {
    console.log('deployComplete');

    if (this.destination_id == 'ipad' || this.destination_id == 'iphone') {
      proto.Wizard.jumpToStep(wizard, 6);
    } else {
      proto.Wizard.jumpToStep(wizard, 3);
    }

  },

  deployStarted: function(deploying_env, cacheKey, wizard, step) {
    var self = this;
    console.log('destination_general.deployStarted: [' + deploying_env + '] [' + cacheKey + ']');

    var deploy_task = new ASyncServerTask({
      cacheKey: cacheKey
    }, {
      updateInterval: Properties.cache_lookup_interval,
      maxTime: Properties.cache_lookup_timeout,
      // 5 minutes
      maxRetries: Properties.cache_lookup_retries,
      timeout: function(res) {
        console.log('Deplying timeout error > ' + JSON.stringify(res));
        proto.Wizard.jumpToStep(import_app_wizard, 1, 'Deploying timed-out');
      },
      update: function(res) {
        for (var i = 0; i < res.log.length; i++) {
          console.log(res.log[i]);
        }
        self.updateProgressLog(deploying_env, res.log);
      },
      complete: function(res) {
        console.log('Deploy successful > ' + JSON.stringify(res));
        if ($.isFunction(self.deployComplete)) {
          self.deployComplete(wizard, step);
        }
      },
      error: function(res) {
        console.log('Deploy error > ' + JSON.stringify(res));
        self.updateProgressLog(deploying_env, [res.error]);
        proto.Wizard.jumpToStep(import_app_wizard, 1, 'Deploying failed');
      },
      retriesLimit: function() {
        console.log('Deploy retriesLimit exceeded: ' + Properties.cache_lookup_retries);
        proto.Wizard.jumpToStep(import_app_wizard, 1, 'Deploying retries exceeded');
      },
      end: function() {}
    });
    deploy_task.run();
  },

  startBuild: function(config) {
    var main_container = $('#manage_publish_container');
    main_container.find('#app_publish_' + this.destination_id + '_build').hide();
    var wizard_name = this.destination_id + "_publish_wizard";
    var that = this;
    var step = $(this);

    var wizard = proto.Wizard.load(wizard_name, {
      cancel: function() {
        that.showDestinations();
      },
      validate: true,
      finish: function() {
        that.showDestinations();
      }
    });

    var versions_select = wizard.find("#app_publish_" + this.destination_id + "_versions");
    var progress_view = wizard.find("#app_publish_" + this.destination_id + "_progress");

    // Binding for showing staging progress
    wizard.find(".app_publish_deploying_progress").unbind('show').bind('show', function(e) {
      that.startDeploy(config, wizard, step);
    });

    if ($.isFunction(this.bindExtraConfig)) {
      this.bindExtraConfig(wizard, config);
    }

    progress_view.bind("show", function() {
      var data = that.getPublishData(config, versions_select, wizard);
      that.showGenerateProgress("Build", wizard, data, progress_view, function(res) {
        // TODO: better way for this temporary workaround for finishing wizard after successful upload  
        wizard.find('.jw-button-finish').trigger('click');
        console.log('publish successful: ' + JSON.stringify(res));

        var source_url = res.action.url;
        var ota_url = res.action.ota_url;
        var ipa_url = res.action.ipa_url;
        //$fw_manager.app.startDownload(source_url);
        var showOTA = false;
        var showIPA = false;
        if(typeof ota_url !== "undefined"){
          showOTA = true;
        }
        if(typeof ipa_url !== "undefined"){
          showIPA = true;
        }
        var showDownload = function(message){
          var dialog = $('#confirm_dialog').clone();
          dialog.find('#confirm_dialog_text').html(message);
          proto.Dialog.load(dialog, {
            autoOpen: true,
            height: 235,
            title: 'Download',
            stack: true,
            dialogClass: 'success-dialog popup-dialog',
            width: 340,
            buttons: {
              'OK': function () {
                $(this).dialog('close');
              }
            }
          });
        };
        var html = "<p> The build is ready. Please click the link below to download";
        
        if( showOTA ){
          html += ", or you can use the OTA link to install the application directly on to your phone.</p>";
        } else {
          html += ".</p>";
        }
        html += "<br><ul> <li> <a target='_blank' href='"+source_url+"'> Download </a></li>";
        if(showIPA){
          html += "<li> <a target='_blank' href='"+ipa_url+"'> Download IPA File </a></li>";
        }
        if(showOTA){
          that.getOTALink(ota_url, function(otalink){
            html += "<li> OTA Link : <a target='_blank' href='"+otalink+"'>" + otalink + " </a></li></ul>";
            showDownload(html);
          });
        } else {
          html += "</ul>";
          showDownload(html);
        }
      });
    });

    this.doPublishWizardSetup(main_container, wizard);

    if ($.isFunction(this.bindFileUploadProgress)) {
      this.bindFileUploadProgress(config, wizard);
    }

    if ($.isFunction(this.bindVersionViewShow)) {
      this.bindVersionViewShow('#app_publish_iphone_device_types', '#app_publish_iphone_versions, #app_publish_ipad_versions', wizard, 4);
    }

    if ($.isFunction(this.changeWizardStep)) {
      this.changeWizardStep(config, wizard, step);
    }
  },

  changeWizardStep: function(config, wizard, step) {
    console.log("changeWizardStep");
  },

  doPublishWizardSetup: function(main_container, wizard) {
    //abstract interface
    wizard.validate({});
  },

  getOTALink: function(download_url, cb) {
    var url = download_url;
    this.getShortenUrl(download_url, cb);
  },

  getShortenUrl: function(url, cb){
    var shortenerRequestBody = { "longUrl": url};
    var req = {url: 'https://www.googleapis.com/urlshortener/v1/url', method:"POST", body: JSON.stringify(shortenerRequestBody), headers: [{"name":"Content-Type", "value":"application/json"}]};
    $.ajax({
      url: '/box/srv/1.1/act/wid/web', 
      type: 'POST', 
      contentType: "application/json",
      dataType: 'json',
      data: JSON.stringify(req), 
      success: function(res){
        if(res.status == 200){
          var resObj = JSON.parse(res.body);
          var shortUrl = resObj.id.replace("\\", "");
          console.log("ota link is " + shortUrl);
          cb(shortUrl);
        } else {
          console.log("Failed to get shortened link.");
          cb(url);
        }
      },
      error: function(){
        console.log("Failed to get shortened link.");
        cb(url);
      }
    });
  }
});