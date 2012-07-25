application.AppManager = Class.extend({
  
  EXTERNAL_APP_TYPE: 'EXTERNAL',
  DEFAULT_APP_TYPE: 'DEFAULT',
  support: null,
  
  init: function () {
    this.support = new application.AppSupport();
    this.generate_app_controller = new GenerateApp.Controller();
  },
  
  /* 
   *
   */
  doManage: function (guid, success, fail, is_name, intermediate) {
    $fw_manager.data.set('template_mode', false);
    $fw_manager.client.app.doShowManage(guid, success, fail, is_name, intermediate);
  },
  
  doShowManage: function (guid, success, fail, is_name, intermediate) {
    log('app.doManage');
    if (!$('#apps_tab').parent().hasClass('ui-state-active')) {
      //this function is called from home page, need to set state information to show the manage apps view
      this.setStateForAppView(guid);
      
      // click apps tab to trigger state restoration
      $('#apps_tab').click();
    }
    $fw_manager.app.resetApp();
    var is_app_name = false;
    if (typeof is_name !== "undefined" && is_name) {
      is_app_name = true;
    }
    $fw_manager.client.model.App.read(guid, function (result) {
      log('app read result > ' + JSON.stringify(result));
      if (result.app && result.inst) {
        var inst = result.inst;
        
        $fw_manager.client.app.updateAppData(result.app, inst);
        $fw_manager.client.app.updateDetails();
        var postFn = function() {
          var template_mode = $fw_manager.data.get('template_mode');
          if (template_mode) {
            // make sure correct button is active on list apps layout
            $('#list_apps_buttons li').removeClass('ui-state-active');
            $('#list_apps_button_templates').addClass('ui-state-active');
            // update state information
            $fw_manager.state.set('apps_tab_options', 'selected', 'template');
            $fw_manager.state.set('template', 'id', inst.guid);
            $fw_manager.client.template.applyPreRestrictions();
          }
          else {
            // make sure correct button is active on list apps layout
            $('#list_apps_buttons li').removeClass('ui-state-active');
            $('#list_apps_button_my_apps').addClass('ui-state-active');
            // update state information
            $fw_manager.state.set('apps_tab_options', 'selected', 'app');
            $fw_manager.state.set('app', 'id', inst.guid);
            $fw_manager.client.template.removePreRestrictions();
          }
          
          // Check if the current app is a scm based app, and if crud operations are allowed
          var is_scm = $fw.client.app.isScmApp();
          var scmCrudEnabled = $fw_manager.getClientProp('scmCrudEnabled') == "true";
          log('scmCrudEnabled = ' + scmCrudEnabled);
          if (is_scm) {
            log('scm based app, applying restrictions');
            $fw.client.app.enableScmApp(scmCrudEnabled);
          }
          else {
            log('non-scm based app, removing restrictions');
            $fw.client.app.disableScmApp();
          }

          // Check if the current app is a Node.js one
          if ($fw.client.app.isNodeJsApp()) {
            log('Node.js based app, applying changes');
            
            // Show Node cloud logo
            $('#cloud_logo').removeClass().addClass('node').unbind().bind('click', function(){
              window.open('http://nodejs.org/', '_blank');
            });
          } else {
            log('Rhino based app, applying changes');
            $fw.client.app.disableNodeJsApp();

            // Show Rhino cloud logo
            $('#cloud_logo').removeClass().addClass('rhino').unbind().bind('click', function(){
              window.open('http://www.mozilla.org/rhino/', '_blank');
            });
          }
          
          $fw_manager.client.tab.apps.showManageApps( success );
          if (template_mode) {
            $fw_manager.client.template.applyPostRestrictions();
          }
          else {
            $fw_manager.client.template.removePostRestrictions();
          }
        };
        if($.isFunction(intermediate)) {
          intermediate(postFn);
        } else {
          postFn();
        }
      }
      else {
        // TODO: call a failure callback, if specified
        log('error reading app > ' + result.message, 'ERROR');
        if ($.isFunction(fail)) {
          fail.call();
        }
      }
    }, function () {
      log('app.doManage:ERROR');
      if ($.isFunction(fail)) {
        fail.call();
      }
    }, is_app_name);
  },

  disableNodeJsApp: function() {
    $('#staging').hide();
    $('#status').hide();

    // Change some "next" steps in wizards
    $('input[name=app_publish_ipad_provisioning_radio]:first').attr('next', 'app_publish_ipad_versions');
    $('input[name=app_publish_iphone_provisioning_radio]:first').attr('next', 'app_publish_iphone_versions');
  },
  
  /*
   *
   */
  doClone: function (guid) {
    log('app.doclone');
    $fw_manager.data.set('clone_from_app', guid);
    var clone_app_wizard = $fw_manager.client.app.initCloneAppWizard();
    clone_app_wizard.jWizard('firstStep');
    proto.Wizard.hidePreviousButton(clone_app_wizard);
  },
  
  /*
   *
   */
  doDelete: function (guid) {
    log('app.doDelete guid:' + guid);
    var icon_html = "<span class=\"ui-icon ui-icon-alert content_icon\"></span>",
        app_title = $('<div>').html(my_apps_grid.jqGrid('getRowData', guid).title);
    $fw_manager.client.dialog.showConfirmDialog($fw_manager.client.lang.getLangString('caution'), icon_html + $fw_manager.client.lang.getLangString('delete_app_confirm_text').replace('<APP>', $.trim(app_title.text())), function () {
      proto.ProgressDialog.reset($fw_manager.client.dialog.progress);
      proto.ProgressDialog.setTitle($fw_manager.client.dialog.progress, 'Delete Progress');
      proto.ProgressDialog.setProgress($fw_manager.client.dialog.progress, 10);
      proto.ProgressDialog($fw_manager.client.dialog.progress, 'Starting delete');
      proto.ProgressDialog.show($fw_manager.client.dialog.progress);
      $fw_manager.client.model.App['delete'](guid, function (data) {
        if (data.inst && data.inst.id) {
          proto.ProgressDialog.setProgress($fw_manager.client.dialog.progress, 100);
          proto.ProgressDialog($fw_manager.client.dialog.progress, 'Delete complete');
          my_apps_grid.jqGrid('delRowData', guid);
          my_apps_grid.trigger('reloadGrid');
          setTimeout(function () {
            proto.ProgressDialog.hide($fw_manager.client.dialog.progress);
          }, 1500);
        } else if (data.status && data.status === "error") {
          proto.ProgressDialog.hide($fw_manager.client.dialog.progress);
          $fw_manager.client.dialog.error(data.message);
        }
      });
    });
  },
  
  doBuild: function (guid) {
    return this.doPublish(guid);
  },
  
  doPublish: function (guid) {
    log('app.doPublish');
    
    // force state to manage > publish
    $fw_manager.state.set('manage_apps_accordion_app', 'selected', 0);
    $fw_manager.state.set('manage_apps_accordion_accordion_item_manage', 'selected', 4);
    
    $fw_manager.client.app.doManage(guid); 
  },
  
  /*
   * Show the create app wizard
   */
  doCreate: function () {
    log('app.docreate');
    var create_app_wizard = $fw_manager.client.app.initCreateAppWizard();
  },
  
  /*
   *
   */
  doImport: function () {
    log('app.doimport');
    var import_app_wizard = proto.Wizard.load('import_app_wizard', {
      validate: true,
      finish: function () {
        var finish_option = import_app_wizard.find('#import_app_next input:radio:checked').val();
        
        $fw_manager.client.app.support.finishAppWizard(finish_option);
      }
    });
    /*import_app_wizard.jWizard('firstStep');
    proto.Wizard.hidePreviousButton(import_app_wizard);*/
    
    import_app_wizard.validate({
      rules: {
        location: {
          required: true,
          accept: "zip|wgt|wgz"
        },
        type: 'required'
      },
      messages: {
        location: {
          accept: 'Invalid file type'
        }
      }
    });
    
    //import_app_wizard.find("input:file").replaceWith($('<input id="import_app_location" class="form_file" name="location" type="file" />'));
    import_app_wizard[0].reset();
    var fileToUpload = null;
    var fileUploader = import_app_wizard.parent().fileupload({
      url: Constants.IMPORT_APP_URL,
        dataType: 'json',
        replaceFileInput: false,
        add: function(e, data){
          setTimeout(function(){
            fileToUpload = data;
            return false;
          }, 100);
        }, 
        timeout: 300000
    });
    
    // When next is clicked on details page, intercept and send back to details page until 
    // import is attempted
    import_app_wizard.find('#import_app_progress').bind('show', function () {      
      log('doing import');
      var step = $(this);
      
      // show import progress
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog(step, 'Starting Import');
      
      var currentProgress;
      var callbacks = {
        progress: function(e, data){
          var progress = parseInt(data.loaded/data.total*100, 10);
          if(progress != currentProgress){
            log("upload progress: " + progress);
            proto.ProgressDialog.setProgress(step, parseInt(progress*0.5, 10));
            proto.ProgressDialog(step, "Uploaded: " + progress + "%");
          }
          currentProgress = progress;
        },
        done: function (e, data) {
          var result = data.result;
          log('import result > ' + JSON.stringify(result));
          var cache_key = result.cacheKey;
          
          // If the cache key was sent back, set up a new asynchronous server task to 
          // repeatedly look for updates on the task progress  
          if ('undefined' !== typeof cache_key && cache_key.length > 0) {
            var import_task = new ASyncServerTask({
              cacheKey: cache_key
            }, {
              updateInterval: Properties.cache_lookup_interval,
              maxTime: Properties.cache_lookup_timeout,
              timeout: function (res) {
                log('timeout error > ' + JSON.stringify(res));
                // TODO: internationalise during refactor
                proto.Wizard.jumpToStep(import_app_wizard, 1, 'Import timed out');  
              },
              update: function (res) {
                for (var i = 0;i < res.log.length; i++) {
                  proto.ProgressDialog(step, res.log[i]);
                }
                if (res.progress) {
                  proto.ProgressDialog.setProgress(step, parseInt(50 + res.progress*0.5, 10));
                }
              },
              complete: function (res) {
                proto.ProgressDialog.setProgress(step, 100);
                log('import successful, good to go > ' + JSON.stringify(res));
                $fw_manager.data.set('new_app', res.action.guid);
                log('jumping to final step and hiding progress dialog');
                proto.Wizard.jumpToStep(import_app_wizard, 3);
                proto.Wizard.hidePreviousButton(import_app_wizard); 
              },
              error: function (res) {
                log('import error > ' + JSON.stringify(res));
                proto.Wizard.jumpToStep(import_app_wizard, 1, res.error);  
              },
              end: function () {
                // nothing to do here
              }
            });
            import_task.run();
          }          
        },
        fail: function (e, data) {
          log('import failed > ' + e);
          // Not good, first step, with error
          proto.Wizard.jumpToStep(import_app_wizard, 1, 'import failed');
        },
        always: function(e, data){
          fileUploader.fileupload('destroy');
        }
      };
      
      fileUploader.bind("fileuploadprogress", callbacks.progress);
      fileUploader.bind("fileuploaddone", callbacks.done);
      fileUploader.bind("fileuploadfai", callbacks.fail);
      fileUploader.bind('fileuploadalways', callbacks.always);
      fileToUpload.submit();
    });
  },
  
  /*
   *
   */
  doUpdate: function (callback) {
    // get fields
    // TODO: move this out to the proper area for validation of the app details
    var form = $('#manage_update_app_details'),
        rules = {
          rules: {
            title: "required",
            scmurl: "giturl"
          }
        };
    form.validate(rules);
    
    if ($fw.data.get('scm_mode')) {
      form.find('#new_app_scmurl').rules('add', 'required');
      form.find('#new_app_scmbranch').rules('add', 'required');
    }
    else {
      form.find('#new_app_scmurl').rules('remove', 'required');
      form.find('#new_app_scmbranch').rules('remove', 'required');
    }
    
    // validate them
    if (!form.valid()) {
      callback();
      return;
    }
    //var target = form.find('#new_app_target option:selected').val();
    // TODO: re-enable when preview iframe height issue is fixed
    
    // TODO: take preview device option for preview area select for now, instead of in manage details section
    var target = $('#preview_temporary_select option:selected').val();
    log('target:' + target);
    var device = $fw.client.preview.resolveDevice(target);
    
    var app = $fw_manager.data.get('app'),
        inst = $fw_manager.data.get('inst');
      
    var fields = {
      app: app.guid,
      inst: inst.guid,
      title: form.find('input[name=title]').val(),
      description: form.find('textarea[name=description]').val(),
      height: device.height,
      width: device.width,
      config: $.extend(true, {}, inst.config, {preview: {device: target}}),
      widgetConfig: $.extend(true, {}, app.config, {
        scm: {
          url: form.find('input[name=scmurl]').val(),
          key: form.find('textarea[name=scmkey]').val(),
          branch: form.find('input[name=scmbranch]').val()
        }
      })
    };
    // submit to server
    $fw_manager.client.model.App.update(fields, function (result) {
      log('update success:' + result);
      $fw_manager.client.dialog.info.flash($fw_manager.client.lang.getLangString('app_updated'));
      // TODO: overkill here by doing a second call to read the app

      // Run custom callback if its passed in, otherwise, do normal App reset (for now)
      if ($.isFunction(callback)) {
        callback();
      }
      else {
        $fw_manager.client.app.doManage(result.inst.guid);
      }
    }, function (error) {
      $fw_manager.client.dialog.error(error);
      log('update failed:' + error);
      if ($.isFunction(callback)) {
        callback();
      }
    });
  },
  
  /*
   * Search all of the users apps and update the displayed apps accordingly
   */
  doSearch: function (query) {
    // Send the query to the server
    $fw.client.model.App.search(query, function (results) {
      log('search results:' + results.length);
      // make sure the correct apps grid is showing
      $fw.app.showAppsGrid('my_apps', results);
    });
  },
  
  updateAppData: function (app, inst) {
    $fw_manager.data.set('app', app);
    $fw_manager.data.set('inst', inst);
  },
  
  updateDetails: function () {
    var app = $fw_manager.data.get('app'),
        inst = $fw_manager.data.get('inst'),
        detailsContainer = $('#manage_details_container');
    inst.w3cid = app.w3cid;
    
    detailsContainer.find('input,textarea').each(function () {
      var el = $(this);
      el.val(inst[el.attr('name')]);
    });
    
    var scm = 'undefined' !== typeof app.config ? app.config.scm : undefined;
    if ('undefined' !== typeof scm) {
      detailsContainer.find('input[name=scmurl]').val(scm.url);
      if ('undefined' === typeof scm.key || scm.key.length < 1) {
        detailsContainer.find('textarea[name=scmkey]').parent().hide(); // hide scm key input as it's being deprecated
      } else {
        detailsContainer.find('textarea[name=scmkey]').val(scm.key); 
      }
      detailsContainer.find('input[name=scmbranch]').val(scm.branch);
      detailsContainer.find('input[name=postreceiveurl]').val($fw.client.app.getPostReceiveUrl()).focus(function () {
        this.select();
      });
    }
    if ('undefined' !== typeof app.config && 'undefined' !== typeof app.config.keys) {
      detailsContainer.find('textarea[name=keyspublic]').val(app.config.keys['public']);
    }

    detailsContainer.find('input[name=app_id]').val(inst.guid);
        
    var preview_config = inst.config.preview || {};
    var preview_list = $('#manage_details_container #new_app_target');
    $fw_manager.client.preview.insertPreviewOptionsIntoSelect(preview_list, preview_config.device);
  },
  
  showCurrentFrameworks: function(){
    var container = $('#manage_frameworks_container');
    var contentHtml = $fw_manager.client.app.support.getAppFramworksHtml();
    container.find('#manage_update_app_frameworks').html(contentHtml);
    var app = $fw_manager.data.get('app');
    var frameworks = app.frameworks;
    if(frameworks && frameworks.length > 0){
      for(var i=0;i<frameworks.length;i++){
        var fw_key = frameworks[i];
        var dom_id = fw_key.replace(/\./g, "_") + "_check";
        var dom = $('#manage_update_app_frameworks').find('#' + dom_id);
        $(dom).attr('checked', true);
      }
    }
  },
  
  doUpdateFrameworks: function(){
    var selected_fws = $('#manage_update_app_frameworks').find('input[type=checkbox]:checked');
    var fw_values = [];
    for(var i=0;i<selected_fws.length;i++){
        fw_values.push($(selected_fws[i]).val());
    }
    var guid = $fw_manager.data.get('app').guid;
    $fw_manager.client.model.App.updateFrameworks(guid, fw_values, function(res){
      var app = $fw_manager.data.get('app');
      app.frameworks = fw_values;
      $fw_manager.data.set('app', app);
      $fw_manager.client.dialog.info.flash($fw_manager.client.lang.getLangString('app_frameworks_updated'));
    }, function(err){
        $fw_manager.client.dialog.error(error);
    });
  },
  
  setStateForAppView: function (id) {
    // TODO: index of Apps tab could change from 1 in the future 
    $fw_manager.state.set('main_tabs', 'selected', 1);
    $fw_manager.state.set('apps_tab_options', 'selected', 'app');
    $fw_manager.state.set('app', 'id', id);
  },
  
  enableScmApp: function (scmCrudEnabled) {
    $fw.data.set('scm_mode', true);
    
    if( ! scmCrudEnabled ) {
      var files_div = $('#accordion_item_editor').next();
      var temp = $('<p>').addClass('editor_disabled_p').text($fw.client.lang.getLangString('scm_editor_disabled'));
      files_div.children().hide().end().append(temp);
    }
    
    $('#new_app_scmurl').parent().show();
    $('#new_app_scmkey').parent().show();
    $('#new_app_scmbranch').parent().show();
    $('#postreceiveurl').parent().show();
    $('#scm_trigger_button').show();
    $('#scm_trigger_button_editor').show();
  },
  
  disableScmApp: function () {
    $fw.data.set('scm_mode', false);
    
    $('.editor_disabled_p').remove();
    $('#accordion_item_editor').next().children().show();
    $('#new_app_scmkey').parent().hide();
    $('#new_app_scmurl').parent().hide();
    $('#new_app_scmbranch').parent().hide();
    $('#postreceiveurl').parent().hide();
    $('#scm_trigger_button').hide();
    $('#scm_trigger_button_editor').hide();    
  },
  
  isScmApp: function () {
    var isScm = false,
        app = $fw.data.get('app'),
        inst = $fw.data.get('inst'),
        appConfig = 'undefined' !== typeof app.config ? app.config : {};
    
    if (('undefined' !== typeof appConfig.scm) && ('EXTERNAL' === app.config.scm.type)) {
      isScm = true;
    }
    else {
      // TODO: If required, can lookup an app that isn't open in the studio.
    }
    
    return isScm;
  },

  isNodeJsApp: function() {
    var isNodeJs = false;
    
    var inst = $fw.data.get('inst');
    if (null != inst) {
      isNodeJs = inst.nodejs === 'true';
    }
    
    return isNodeJs;
  },
  
  /*
   * Gets the scm trigger url for the current app
   * e.g. /box/srv/1.1/pub/app/xzEWsLxpEp60ED-PxM8Zlc0B/refresh
   */
  getTriggerUrl: function () {
    var app = $fw.data.get('app'),
        url;
    
    url = Constants.TRIGGER_SCM_URL.replace('<GUID>', app.guid);
    
    return url;
  },
  
  /*
   * Gets the post receive url for the current app.
   * e.g. https://apps.feedhenry.com/box/srv/1.1/pub/app/xzEWsLxpEp60ED-PxM8Zlc0B/refresh
   */
  getPostReceiveUrl: function () {
    var postReceiveUrl,
        host;
    
    host = document.location.protocol + '//' + document.location.host;
    postReceiveUrl = host + $fw.client.app.getTriggerUrl();
    
    return postReceiveUrl;
  },
  
  stageApp: function (guid, cb) {
    var url, params, app;
    
    if (!guid) {
      guid = $fw.data.get('app').guid;
    }

    url = Constants.STAGE_APP_URL;
    params = {
      guid: guid
    };
    
    $fw.server.post(url, params, function (result) {
      // TODO: succeed or fail quietly for now
      log('stage result:' + JSON.stringify(result));
      cb(result);
    });
  },
  
  /*
   * Trigger an update or pull from the scm for the currently open app
   */
  triggerScm: function (success, fail, always) {
    var url;
    
    url = $fw.client.app.getTriggerUrl();
    $fw_manager.client.dialog.info.flash($fw_manager.client.lang.getLangString('scm_update_started'), 2500);
        $fw.server.post(url, {}, function (result) {
          if (result.cacheKey) {
            var clone_task = new ASyncServerTask({
              cacheKey: result.cacheKey
            }, {
              updateInterval: Properties.cache_lookup_interval,
              maxTime: Properties.cache_lookup_timeout, // 5 minutes
              maxRetries: Properties.cache_lookup_retries,
              timeout: function (res) {
                log('timeout error > ' + JSON.stringify(res));
                $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error'));
                // TODO: internationalise during refactor
                // ALERT THE USER OF TIMEOUT proto.Wizard.jumpToStep(clone_app_wizard, 1, 'Clone timed out');  
                if($.isFunction(fail)) {
                   fail();
                }
              },
              update: function (res) {
                for (var i = 0; i < res.log.length; i++) {
                   log(res.log[i]);
                }
              },
              complete: function (res) {
                log('SCM refresh successful > ' + JSON.stringify(res));
                $fw_manager.client.dialog.info.flash($fw_manager.client.lang.getLangString('scm_updated'), 2000);
        
                if($.isFunction(success)) {
                   success();
                }
              },
              error: function (res) {
                log('clone error > ' + JSON.stringify(res));
                $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error') + "<br /> Error Message:" + res.error);
                if($.isFunction(fail)) {
                   fail();
                }
              },
              retriesLimit: function () {
                log('retriesLimit exceeded: ' + Properties.cache_lookup_retries);
            $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error'));
                if($.isFunction(fail)) {
                   fail();
                }
              },
              end: function () {
                if($.isFunction(always)) {
                   always();
                }
              }
          });
          clone_task.run();
        } else {
                log('No CacheKey in response > ' + JSON.stringify(result));
          $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error'));
               if($.isFunction(fail)) {
                  fail();
            }
        }
    });
  },
  
  /*
   * Support functions
   */
   
  initCloneAppWizard: function () {
    return $fw_manager.client.app.support.initCloneAppWizard();
  },
  
  initCreateAppWizard: function () {
    return $fw_manager.client.app.support.initCreateAppWizard();
  },
  
  showTemplateDetails: function (container, template_app) {
    return $fw_manager.client.app.support.showTemplateDetails(container, template_app);
  }
  
});