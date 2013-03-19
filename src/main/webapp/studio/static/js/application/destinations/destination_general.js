application.DestinationGeneral = Class.extend({

  destination_id: null,
  base_url: null,

  init: function(dest_id) {
    this.destination_id = dest_id;
    this.base_url = Constants.WID_URL_PREFIX + this.destination_id + "/" + $fw.data.get('inst').guid + "/deliver";
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
        $fw.client.dialog.error($fw.client.lang.getLangString(error_msg));
      }
    } else {
      that.publish();
    }
  },

  'export': function() {
    console.log("generate for " + this.destination_id + ":: Type: Export");
    var url = this.base_url + "?generateSrc=true";
    document.location = url;
  },

  publish: function() {
    var url = this.base_url + "?generateSrc=false";
    document.location = url;
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
      this.bindVersionViewShow('#app_export_device_types', '#app_export_iphone_versions, #app_export_ipad_versions, #app_publish_ios_versions', wizard, 1);
    }

    // call any destination specific setup
    this.doExportWizardSetup(main_container, wizard);
    wizard.find(export_version_id).bind('postShow', function() {
      proto.Wizard.showCancelButton(wizard);
    });

    var doGeneration = function(step){
      var data = that.getExportData(wizard, export_version_id);
      if (null === data) {
        return;
      }
      that.showGenerateProgress("Export", wizard, data, step, function(res) {
        // TODO: better way for this temporary workaround for finishing wizard after successful upload  
        wizard.find('.jw-button-finish').trigger('click');

        if (res.error) {
          $fw.client.dialog.error($fw.client.lang.getLangString('free_source_export_disabled'));
        } else if (res.action && res.action.url) {
          var source_url = res.action.url;
          document.location = source_url;
        }
      });
    };
    
    if(wizard.find(progress_id).is(":visible")){
      doGeneration($(wizard.find(progress_id)));
      proto.Wizard.hideCancelButton(wizard);
    } else {
      wizard.find(progress_id).bind('show', function(e) {
      doGeneration($(this));
    }).bind('postShow', function() {
      proto.Wizard.hideCancelButton(wizard);
    });
    }
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
            proto.ProgressDialog.append(step, "Completed");
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
    if(typeof text === "string"){
      button.find('.resource-content').text(content_text);
    } else {
      button.find('.resource-content').html(content_text);
    }

  },

  disableButton: function(button, type, text) {
    var that = this;
    button.find("h3").parent().find("button.resource-not-uploaded").unbind().click(

    function() {
      that.redirectToAccount(that.destination_id);
    }).show().parent().find('button.resource-uploaded').hide();

    var content_text = text ? text : "You can not build " + type + " version of the app until you have uploaded your certificate";
    if(typeof text === "string"){
      button.find('.resource-content').text(content_text);
    } else {
      button.find('.resource-content').html(content_text);
    }
  },
  redirectToAccount: function(target) {
    // TODO: use id's instead of indexes
    // force state to show relevant accordion item
    $fw.state.set('account_accordion', 'selected', 1);
    $fw.state.set('account_accordion_accordion_item_destinations', 'selected', ((target === 'iphone') || (target === 'ipad')) ? 0 : 1);

    $('#account_tab').click();
    target = target.toLowerCase();
    if(target === "iphone" || target === "ios" || target === "ipad"){
      $('a#appleResource').click();
    }else if(target === "android"){
      $('a#androidResource').click();
    }else if(target === "blackberry"){
      $('#blackberryResource').click();
    }
  },

  /**
   * show the deploys page
   * @param $cancel trigger click on thhis element to cancel current operatrion (do nothing if not supplied)
   * @param e the trigger event
   * @return {Boolean}
   */
  showDeploys: function($cancel,e) {
    if(e) {
      e.preventDefault();
    }
    $cancel.trigger("click");
    $('a[data-controller="apps.deploy.controller"]').trigger("click");
    return false;
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
      appId: $fw.data.get('inst').guid
    }, function(res) {
      that.resourceCheckCallback(res, that);
      console.log('resource checked :: ' + that.destination_id);
      main_container.find('#app_publish_' + that.destination_id + '_build').show();
      main_container.find("#app_publish_" + that.destination_id).show();
    });
  },

  /**
   * check if the applicatin is currently running.
   *
   * @param config if set to 'distribution' or 'release' then this is a live build
   * @param wizard the wizard
   *
   * Note: this will only be executed once per build
   * @see startBuild
   */
  checkDeploy: function(config, wizard) {
    var env = 'dev';
    if (config == 'distribution' || config == 'release' || config == 'live') {
      env = 'live';
    }
    var appId = $fw.data.get('inst').guid;
    var handleRunning = _.bind(this.renderRunning, this ,env, wizard);
    var handleNotRunning = _.bind(this.renderNotRunning, this, env, wizard);

    this.renderCancelable(".check-deploy-template", env,wizard);
    this.ping(appId,env,handleRunning,handleNotRunning);
  },


  /**
   * render the running message
   * @param env live or dev
   * @param wizard the current wizard
   */
  renderRunning: function(env,wizard) {
    var $el = this.render(".build-wizard-deployed-template",{env:env,link:"click"});
    this.renderApplicationStatus(wizard,$el);
  },

  /**
   * render not running message
   * @param env live or dev
   * @param wizard the current wizard
   */
  renderNotRunning: function(env,wizard) {
    this.renderCancelable(".build-wizard-deploy-template", env,wizard);
  },

  /**
   * render a cancelable message (either starting or in progress)
   * @param template the template to render
   * @param env live or dev
   * @param wizard the current wizard
   */
  renderCancelable: function(template, env,wizard) {
    var $el= this.render(template,{env:env,link:"click"});
    var cancel = _.bind(this.showDeploys, this, $("button.jw-button-cancel",wizard));
    $("a", $el).on("click", cancel);
    this.renderApplicationStatus(wizard,$el);
  },

  /**
   * render application status
   * @param wizard the wizard
   * @param $el the element to render into the wizard
   */
  renderApplicationStatus: function(wizard,$el) {
    $(".jw-steps-wrap .application-status", wizard).html($el);
  },

  /**
   * render a template
   * @param template the template to render
   * @param vars the vars to replace in the template
   * @return {*}
   */
  render: function(template ,  vars) {
    var t = $(template).html();
    return $(_.template(t,vars));
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

    // Binding for checking the deploy status
    var $info = wizard.find(".app_publish_info");
    $info.unbind('show').bind('show', function(e) {
      that.checkDeploy = _.once(that.checkDeploy);
      that.checkDeploy(config, wizard, step);
    });
    // we need to check if the wizard has shown this page before the wizard load returned
    if($info.is(":visible")) {
      $info.trigger("show");
    }

    if ($.isFunction(this.bindExtraConfig)) {
      this.bindExtraConfig(wizard, config);
    }

    progress_view.bind("show", function() {
      var data = that.getPublishData(config, versions_select, wizard);
      that.showGenerateProgress("Build", wizard, data, progress_view, function(res) {
        // TODO: better way for this temporary workaround for finishing wizard after successful upload  
        wizard.find('.jw-button-finish').trigger('click');
        console.log('publish successful: ' + JSON.stringify(res));
        that.handleDownload(res, config);
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

  /**
   * ping the remote server
   * @param appId the application id
   * @param env live or dev
   * @param success callback
   * @param failure callback
   */
  ping: function(appId, env, success, failure) {
    var url = Constants.PING_APP_URL;
    var params = {
      guid: appId,
      deploytarget: env
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        success(res);
      } else {
        failure(res);
      }
    });
  },
  handleDownload: function(res){
    var that = this;
    var source_url = res.action.url;
    var ota_url = res.action.ota_url;
    var ipa_url = res.action.ipa_url;
    var showOTA = false;
    var showIPA = false;
    if(typeof ota_url !== "undefined"){
      showOTA = true;
    }
    if(typeof ipa_url !== "undefined"){
      showIPA = true;
    }

    var showDownload = function(message) {
      var dialog = $('#binary_download_dialog').clone();
      modal.find(".modal-body").html(message).end().appendTo($("body")).modal({
        "keyboard": false,
        "backdrop": "static"
      });
    };

    var modal = $('#binary_download_dialog').clone();
    var html = "<h3>Your build is complete!</h3><br/><p> <a target='_blank' class='btn' href='"+source_url+"'> <i class='icon-download'></i> Download </a>";

    if(showIPA){
      html += "  <a target='_blank' class='btn' href='"+ipa_url+"'><i class='icon-download'></i> Download IPA File</a>";
    }
    html += "</p><br>";

    if(showOTA) {
      that.getOTALink(ota_url, function(otalink, shortened) {
        html += "<h4>-- or --</h4><br/><p>Install directly onto a device with this OTA link</p>";
        html += "<h4><a class='otalink' target='_blank' href='"+otalink+"'>" + otalink + " </a></h4>";
        if(shortened) {
          html += "<img src='"+otalink+".qr' alt='qr'>";
        }
        showDownload(html);
      });
    } else {
      showDownload(html);
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
          cb(shortUrl, true);
        } else {
          console.log("Failed to get shortened link.");
          cb(url, false);
        }
      },
      error: function(){
        console.log("Failed to get shortened link.");
        cb(url, false);
      }
    });
  }
});
