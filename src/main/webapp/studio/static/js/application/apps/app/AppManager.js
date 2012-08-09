application.AppManager = Class.extend({
  
  EXTERNAL_APP_TYPE: 'EXTERNAL',
  DEFAULT_APP_TYPE: 'DEFAULT',
  
  init: function () {
    this.generate_app_controller = new GenerateApp.Controller();
  },
  
  /*
   *
   */
  // doManage: function (guid, success, fail, is_name, intermediate) {
  //   $fw.data.set('template_mode', false);
  //   this.doShowManage(guid, success, fail, is_name, intermediate);
  // },
  
  // doShowManage: function (guid, success, fail, is_name, intermediate) {
  //   var self = this;

  //   console.log('app.doManage');
  //   if (!$('#apps_tab').parent().hasClass('ui-state-active')) {
  //     //this function is called from home page, need to set state information to show the manage apps view
  //     this.setStateForAppView(guid);
      
  //     // click apps tab to trigger state restoration
  //     $('#apps_tab').click();
  //   }
  //   $fw.app.resetApp();
  //   var is_app_name = false;
  //   if (typeof is_name !== "undefined" && is_name) {
  //     is_app_name = true;
  //   }
  //   $fw.client.model.App.read(guid, function (result) {
  //     console.log('app read result > ' + JSON.stringify(result));
  //     if (result.app && result.inst) {
  //       var inst = result.inst;
        
  //       self.updateAppData(result.app, inst);
  //       self.updateDetails();
  //       var postFn = function() {
  //         var template_mode = $fw.data.get('template_mode');
  //         if (template_mode) {
  //           // make sure correct button is active on list apps layout
  //           $('#list_apps_buttons li').removeClass('ui-state-active');
  //           $('#list_apps_button_templates').addClass('ui-state-active');
  //           // update state information
  //           $fw.state.set('apps_tab_options', 'selected', 'template');
  //           $fw.state.set('template', 'id', inst.guid);
  //           $fw.client.template.applyPreRestrictions();
  //         }
  //         else {
  //           // make sure correct button is active on list apps layout
  //           $('#list_apps_buttons li').removeClass('ui-state-active');
  //           $('#list_apps_button_my_apps').addClass('ui-state-active');
  //           // update state information
  //           $fw.state.set('apps_tab_options', 'selected', 'app');
  //           $fw.state.set('app', 'id', inst.guid);
  //           $fw.client.template.removePreRestrictions();
  //         }
          
  //         // Check if the current app is a scm based app, and if crud operations are allowed
  //         var is_scm = self.isScmApp();
  //         var scmCrudEnabled = $fw.getClientProp('scmCrudEnabled') == "true";
  //         console.log('scmCrudEnabled = ' + scmCrudEnabled);
  //         if (is_scm) {
  //           console.log('scm based app, applying restrictions');
  //           self.enableScmApp(scmCrudEnabled);
  //         }
  //         else {
  //           console.log('non-scm based app, removing restrictions');
  //           self.disableScmApp();
  //         }

  //         // Check if the current app is a Node.js one
  //         if (self.isNodeJsApp()) {
  //           console.log('Node.js based app, applying changes');
            
  //           // Show Node cloud logo
  //           $('#cloud_logo').removeClass().addClass('node').unbind().bind('click', function(){
  //             window.open('http://nodejs.org/', '_blank');
  //           });
  //         } else {
  //           console.log('Rhino based app, applying changes');
  //           self.disableNodeJsApp();

  //           // Show Rhino cloud logo
  //           $('#cloud_logo').removeClass().addClass('rhino').unbind().bind('click', function(){
  //             window.open('http://www.mozilla.org/rhino/', '_blank');
  //           });
  //         }
          
  //         $fw.client.tab.apps.showManageapps( success );
  //         if (template_mode) {
  //           $fw.client.template.applyPostRestrictions();
  //         }
  //         else {
  //           $fw.client.template.removePostRestrictions();
  //         }
  //       };
  //       if($.isFunction(intermediate)) {
  //         intermediate(postFn);
  //       } else {
  //         postFn();
  //       }
  //     }
  //     else {
  //       // TODO: call a failure callback, if specified
  //       console.log('error reading app > ' + result.message, 'ERROR');
  //       if ($.isFunction(fail)) {
  //         fail.call();
  //       }
  //     }
  //   }, function () {
  //     console.log('app.doManage:ERROR');
  //     if ($.isFunction(fail)) {
  //       fail.call();
  //     }
  //   }, is_app_name);
  // },

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
    console.log('app.doclone');
    $fw.data.set('clone_from_app', guid);
    var clone_app_wizard = self.initCloneAppWizard();
    clone_app_wizard.jWizard('firstStep');
    proto.Wizard.hidePreviousButton(clone_app_wizard);
  },
  
  /*
   *
   */
  doDelete: function (guid) {
    console.log('app.doDelete guid:' + guid);
    var icon_html = "<span class=\"ui-icon ui-icon-alert content_icon\"></span>",
        app_title = $('<div>').html(my_apps_grid.jqGrid('getRowData', guid).title);
    $fw.client.dialog.showConfirmDialog($fw.client.lang.getLangString('caution'), icon_html + $fw.client.lang.getLangString('delete_app_confirm_text').replace('<APP>', $.trim(app_title.text())), function () {
      proto.ProgressDialog.reset($fw.client.dialog.progress);
      proto.ProgressDialog.setTitle($fw.client.dialog.progress, 'Delete Progress');
      proto.ProgressDialog.setProgress($fw.client.dialog.progress, 10);
      proto.ProgressDialog.append($fw.client.dialog.progress, 'Starting delete');
      proto.ProgressDialog.show($fw.client.dialog.progress);
      $fw.client.model.App['delete'](guid, function (data) {
        if (data.inst && data.inst.id) {
          proto.ProgressDialog.setProgress($fw.client.dialog.progress, 100);
          proto.ProgressDialog.append($fw.client.dialog.progress, 'Delete complete');
          my_apps_grid.jqGrid('delRowData', guid);
          my_apps_grid.trigger('reloadGrid');
          setTimeout(function () {
            proto.ProgressDialog.hide($fw.client.dialog.progress);
          }, 1500);
        } else if (data.status && data.status === "error") {
          proto.ProgressDialog.hide($fw.client.dialog.progress);
          $fw.client.dialog.error(data.message);
        }
      });
    });
  },
  
  doBuild: function (guid) {
    return this.doPublish(guid);
  },
  
  doPublish: function (guid) {
    console.log('app.doPublish');
    
    // force state to manage > publish
    $fw.state.set('manage_apps_accordion_app', 'selected', 0);
    $fw.state.set('manage_apps_accordion_accordion_item_manage', 'selected', 4);
    
    this.doManage(guid);
  },
  
  /*
   * Show the create app wizard
   */
  doCreate: function () {
    console.log('app.docreate');
    var create_app_wizard = this.initCreateAppWizard();
  },
  
  /*
   *
   */
  doImport: function () {
    console.log('app.doimport');
    var self = this;

    var import_app_wizard = proto.Wizard.load('import_app_wizard', {
      validate: true,
      finish: function () {
        var finish_option = import_app_wizard.find('#import_app_next input:radio:checked').val();
        
        self.finishAppWizard(finish_option);
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
      console.log('doing import');
      var step = $(this);
      
      // show import progress
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Import');
      
      var currentProgress;
      var callbacks = {
        progress: function(e, data){
          var progress = parseInt(data.loaded/data.total*100, 10);
          if(progress != currentProgress){
            console.log("upload progress: " + progress);
            proto.ProgressDialog.setProgress(step, parseInt(progress*0.5, 10));
            proto.ProgressDialog.append(step, "Uploaded: " + progress + "%");
          }
          currentProgress = progress;
        },
        done: function (e, data) {
          var result = data.result;
          console.log('import result > ' + JSON.stringify(result));
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
                console.log('timeout error > ' + JSON.stringify(res));
                // TODO: internationalise during refactor
                proto.Wizard.jumpToStep(import_app_wizard, 1, 'Import timed out');
              },
              update: function (res) {
                for (var i = 0;i < res.log.length; i++) {
                  proto.ProgressDialog.append(step, res.log[i]);
                }
                if (res.progress) {
                  proto.ProgressDialog.setProgress(step, parseInt(50 + res.progress*0.5, 10));
                }
              },
              complete: function (res) {
                proto.ProgressDialog.setProgress(step, 100);
                console.log('import successful, good to go > ' + JSON.stringify(res));
                $fw.data.set('new_app', res.action.guid);
                console.log('jumping to final step and hiding progress dialog');
                proto.Wizard.jumpToStep(import_app_wizard, 3);
                proto.Wizard.hidePreviousButton(import_app_wizard);
              },
              error: function (res) {
                console.log('import error > ' + JSON.stringify(res));
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
          console.log('import failed > ' + e);
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
    var self = this;

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
    console.log('target:' + target);
    var device = $fw.client.preview.resolveDevice(target);
    
    var app = $fw.data.get('app'),
        inst = $fw.data.get('inst');
      
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
    $fw.client.model.App.update(fields, function (result) {
      console.log('update success:' + result);
      $fw.client.dialog.info.flash($fw.client.lang.getLangString('app_updated'));
      // TODO: overkill here by doing a second call to read the app

      // Run custom callback if its passed in, otherwise, do normal App reset (for now)
      if ($.isFunction(callback)) {
        callback();
      }
      else {
        self.doManage(result.inst.guid);
      }
    }, function (error) {
      $fw.client.dialog.error(error);
      console.log('update failed:' + error);
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
      console.log('search results:' + results.length);
      // make sure the correct apps grid is showing
      $fw.app.showAppsGrid('my_apps', results);
    });
  },
  
  updateAppData: function (app, inst) {
    $fw.data.set('app', app);
    $fw.data.set('inst', inst);
  },
  
  updateDetails: function () {
    var self = this,
        app = $fw.data.get('app'),
        inst = $fw.data.get('inst'),
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
      detailsContainer.find('input[name=postreceiveurl]').val(self.getPostReceiveUrl()).focus(function () {
        this.select();
      });
    }
    if ('undefined' !== typeof app.config && 'undefined' !== typeof app.config.keys) {
      detailsContainer.find('textarea[name=keyspublic]').val(app.config.keys['public']);
    }

    detailsContainer.find('input[name=app_id]').val(inst.guid);
        
    var preview_config = inst.config.preview || {};
    var preview_list = $('#manage_details_container #new_app_target');
    $fw.client.preview.insertPreviewOptionsIntoSelect(preview_list, preview_config.device);
  },
  
  showCurrentFrameworks: function(){
    var self = this;

    var container = $('#manage_frameworks_container');
    var contentHtml = self.getAppFramworksHtml();
    container.find('#manage_update_app_frameworks').html(contentHtml);
    var app = $fw.data.get('app');
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
    var guid = $fw.data.get('app').guid;
    $fw.client.model.App.updateFrameworks(guid, fw_values, function(res){
      var app = $fw.data.get('app');
      app.frameworks = fw_values;
      $fw.data.set('app', app);
      $fw.client.dialog.info.flash($fw.client.lang.getLangString('app_frameworks_updated'));
    }, function(err){
        $fw.client.dialog.error(error);
    });
  },
  
  setStateForAppView: function (id) {
    // TODO: index of Apps tab could change from 1 in the future
    $fw.state.set('main_tabs', 'selected', 1);
    $fw.state.set('apps_tab_options', 'selected', 'app');
    $fw.state.set('app', 'id', id);
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
  // getTriggerUrl: function () {
  //   var app = $fw.data.get('app'),
  //       url;
    
  //   url = Constants.TRIGGER_SCM_URL.replace('<GUID>', app.guid);
    
  //   return url;
  // },
  
  /*
   * Gets the post receive url for the current app.
   * e.g. https://apps.feedhenry.com/box/srv/1.1/pub/app/xzEWsLxpEp60ED-PxM8Zlc0B/refresh
   */
  // getPostReceiveUrl: function () {
  //   var postReceiveUrl,
  //       host;
    
  //   host = document.location.protocol + '//' + document.location.host;
  //   postReceiveUrl = host + this.getTriggerUrl();
    
  //   return postReceiveUrl;
  // },
  
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
      console.log('stage result:' + JSON.stringify(result));
      cb(result);
    });
  },
  
  /*
   * Trigger an update or pull from the scm for the currently open app
   */
  triggerScm: function (success, fail, always) {
    var url;
    
    url = this.getTriggerUrl();
    $fw.client.dialog.info.flash($fw.client.lang.getLangString('scm_update_started'), 2500);
        $fw.server.post(url, {}, function (result) {
          if (result.cacheKey) {
            var clone_task = new ASyncServerTask({
              cacheKey: result.cacheKey
            }, {
              updateInterval: Properties.cache_lookup_interval,
              maxTime: Properties.cache_lookup_timeout, // 5 minutes
              maxRetries: Properties.cache_lookup_retries,
              timeout: function (res) {
                console.log('timeout error > ' + JSON.stringify(res));
                $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error'));
                // TODO: internationalise during refactor
                // ALERT THE USER OF TIMEOUT proto.Wizard.jumpToStep(clone_app_wizard, 1, 'Clone timed out');
                if($.isFunction(fail)) {
                   fail();
                }
              },
              update: function (res) {
                for (var i = 0; i < res.log.length; i++) {
                   console.log(res.log[i]);
                }
              },
              complete: function (res) {
                console.log('SCM refresh successful > ' + JSON.stringify(res));
                $fw.client.dialog.info.flash($fw.client.lang.getLangString('scm_updated'), 2000);
        
                if($.isFunction(success)) {
                   success();
                }
              },
              error: function (res) {
                console.log('clone error > ' + JSON.stringify(res));
                $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error') + "<br /> Error Message:" + res.error);
                if($.isFunction(fail)) {
                   fail();
                }
              },
              retriesLimit: function () {
                console.log('retriesLimit exceeded: ' + Properties.cache_lookup_retries);
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
                console.log('No CacheKey in response > ' + JSON.stringify(result));
          $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error'));
               if($.isFunction(fail)) {
                  fail();
            }
        }
    });
  },

  initCloneAppWizard: function () {
    var self = this;
    console.log('initCloneAppWizard');
    var clone_app_wizard = proto.Wizard.load('clone_app_wizard', {
      validate: true,
      finish: function () {
        var finish_option = clone_app_wizard.find('#clone_app_next input:radio:checked').val();

        self.finishAppWizard(finish_option, function () {
           if (self.isScmApp()) { // Only display te Git Url warning for SCM hosted Apps
              $fw.client.dialog.warning($fw.client.lang.getLangString('post_cloned_git_app'));
           }
          }, function(postFn) {
             if (self.isScmApp()) {
               self.triggerScm($.noop, $.noop, postFn);   // this needs to be called after app is cloned/read
               // Don't need to stage app here because triggering the scm automatically stages the app after scm updates files
             } else {
              // for non-scm apps, trigger staging and proceed as normal
               self.stageApp();
               postFn();
             }
          });
        }
      }
    );

    clone_app_wizard.validate({
      rules: {
        app_title: 'required'
      }
    });
    
    clone_app_wizard.find("#clone_app_progress").unbind('show').bind('show', function (e) {
      var step = $(this);
      
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Clone');
      
      console.log('sending clone request to server');
      $fw.server.post(Constants.CLONE_APP_URL, {
        guid : $fw.data.get('clone_from_app'),
        title: clone_app_wizard.find('input[name=app_title]').val()
      }, function (result) {
        if (result.cacheKey && result.appId) {
          var clone_task = new ASyncServerTask({
            cacheKey: result.cacheKey
            }, {
            updateInterval: Properties.cache_lookup_interval,
            maxTime: Properties.cache_lookup_timeout, // 5 minutes
            maxRetries: Properties.cache_lookup_retries,
            timeout: function (res) {
              console.log('timeout error > ' + JSON.stringify(res));
              // TODO: internationalise during refactor
              proto.Wizard.jumpToStep(clone_app_wizard, 1, 'Clone timed out');
            },
            update: function (res) {
              for (var i = 0; i < res.log.length; i++) {
                proto.ProgressDialog.append(step, res.log[i]);
              }
              if (res.progress) {
                proto.ProgressDialog.setProgress(step, parseInt(res.progress, 10));
              }
            },
            complete: function (res) {
              proto.ProgressDialog.setProgress(step, 100);
              console.log('clone successful, good to go > ' + JSON.stringify(res));
              $fw.data.set('new_app_name', result.appId);
              console.log('jumping to final step and hiding progress dialog');
              proto.Wizard.jumpToStep(clone_app_wizard, 3);
              proto.Wizard.hidePreviousButton(clone_app_wizard);
            },
            error: function (res) {
              console.log('clone error > ' + JSON.stringify(res));
              proto.Wizard.jumpToStep(clone_app_wizard, 1, $fw.client.lang.getLangString('clone_server_error'));
            },
            retriesLimit: function () {
              proto.Wizard.jumpToStep(clone_app_wizard, 1, $fw.client.lang.getLangString('clone_server_error'));
            },
            end: function () {
              // nothing to do here
            }
          });
          clone_task.run();
        } else {
          proto.Wizard.jumpToStep(clone_app_wizard, 1, result.message || $fw.client.lang.getLangString('clone_server_error'));
        }
      }, function () {
        proto.Wizard.jumpToStep(clone_app_wizard, 1, $fw.client.lang.getLangString('clone_server_error'));
        console.log('clone failed', 'ERROR');
      });
    });
    
    return clone_app_wizard;
  },

  initCreateAppWizard: function () {
    var self = this;

    var create_app_wizard = proto.Wizard.load('create_app_wizard', {
      validate: true,
      finish: function () {
        var finish_option = create_app_wizard.find('#create_app_next input:radio:checked').val();
        
        self.finishAppWizard(finish_option);
      }
    });
    
    create_app_wizard.validate({
      rules: {
        title: "required",
        scmurl: {
          "required": true,
          "giturl": true
        },
        scmbranch: "required"
      }
    });
    
    create_app_wizard.find("#create_app_from_scm").unbind('show').bind('show', function (e) {
      $fw.data.set('app_type', self.EXTERNAL_APP_TYPE);
    });
    create_app_wizard.find("#create_app_details").unbind('show').bind('show', function (e) {
      $fw.data.set('app_type', self.DEFAULT_APP_TYPE);
    });
    
    create_app_wizard.find('#create_app_frameworks').unbind('show').bind('show', function(e){
      var self = $(this);
      if(self.find('input').length === 0){
        var contentHtml = self.getAppFramworksHtml();
        self.find('#create_app_frameworks_text').after(contentHtml);
      }
    });
        
    create_app_wizard.find("#create_app_progress").unbind('show').bind('show', function (e) {
      var step = $(this),
          appType = $fw.data.get('app_type'),
          details_step;
      
      var framework_step = null;
      
      if (self.EXTERNAL_APP_TYPE === appType) {
        details_step = create_app_wizard.find("#create_app_from_scm");
      }
      else {
        details_step = create_app_wizard.find("#create_app_details");
        framework_step = create_app_wizard.find('#create_app_frameworks');
      }
      
      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Create');
      
      var id = $fw.client.preview.getDefaultDeviceId();
      var device = $fw.client.preview.resolveDevice(id);
      
      var params = {
        title: details_step.find('input[name=title]').val(),
        description: details_step.find('textarea[name=description]').val(),
        height: device.height,
        width: device.width,
        config: {preview: {device: id}}
      };
      if (self.EXTERNAL_APP_TYPE === appType) {
        params.scmurl = details_step.find('input[name=scmurl]').val();
        params.scmbranch = details_step.find('input[name=scmbranch]').val();
      }
      
      if(null != framework_step) {
        var selected_fws = framework_step.find('input[type=checkbox]:checked');
        var fw_values = [];
        for(var i=0;i<selected_fws.length;i++){
          fw_values.push($(selected_fws[i]).val());
        }
        if(fw_values.length > 0){
          params.frameworks = fw_values;
        }
      }
      
      $fw.client.model.App.create(params,
        function (app) {
          console.log('create ok');
          proto.ProgressDialog.append(step, 'App created successfully.');
          $fw.data.set('new_app', app.guid);
          
          var nextStep = create_app_wizard.find('#create_app_next');
          // Disable 'edit' as a follow on option for scm based apps
          if (self.EXTERNAL_APP_TYPE === appType) {
            nextStep.find('#create_app_wiz_edit').parent().hide();
          }
          
          var completeFn;
          if (app.isScmApp && app.isScmPrivate) {
            completeFn = function () {
              var publicKeyStep = create_app_wizard.find('#create_app_publickeysetup');
              publicKeyStep.find('#scmpublickey').text(app.publicKey);
              proto.Wizard.jumpToStep(create_app_wizard, publicKeyStep);
              
              var scmProgressStep = create_app_wizard.find('#create_app_scmprogress');
              scmProgressStep.unbind('show').bind('show', function () {
                // trigger scm update now that user has gone past public key setup step
                $fw.data.set('app', {
                  "guid": app.guid
                });
                self.triggerScm(function () {
                  proto.ProgressDialog.setProgress(scmProgressStep, 100);
                  proto.Wizard.jumpToStep(create_app_wizard, nextStep);
                  proto.Wizard.hidePreviousButton(create_app_wizard);
                }, function () {
                  proto.Wizard.jumpToStep(create_app_wizard, details_step, 'An error occured while creating your App. Please try again.');
                });
              });
            };
          } else {
            completeFn = function () {
              proto.Wizard.jumpToStep(create_app_wizard, nextStep);
              proto.Wizard.hidePreviousButton(create_app_wizard);
              proto.ProgressDialog.setProgress(step, 100);
            };
          }
          
          if ($.isArray(app.tasks) && app.tasks.length > 0) {
            var keys = [];
            for(var ti=0, tl=app.tasks.length; ti<tl; ti++) {
              var tempTask = app.tasks[ti];
              keys.push({
                cacheKey: tempTask
              });
            }
            
            var createTask = new ASyncServerTask(keys, {
              updateInterval: 2000,
              timeout: function (res) {
                console.log('timeout error > ' + JSON.stringify(res));
                proto.Wizard.jumpToStep(create_app_wizard, details_step, 'Create timed out');
              },
              update: function (res) {
                for (var i = 0; i < res.log.length; i++) {
                  proto.ProgressDialog.append(step, res.log[i]);
                }
                if (res.progress) {
                  proto.ProgressDialog.setProgress(step, parseInt(res.progress, 10));
                }
              },
              complete: completeFn,
              error: function (res) {
                console.log('clone error > ' + JSON.stringify(res));
                proto.Wizard.jumpToStep(create_app_wizard, details_step, 'An error occured while creating your App. Please try again.');
              },
              retriesLimit: function () {
                proto.Wizard.jumpToStep(create_app_wizard, details_step, 'An error occured while creating your App. Please try again.');
              },
              end: function () {
                // nothing to do here
              }
            });
            createTask.run();
          }
          else {
            completeFn();
          }
        },
        function (result) {
          console.log('create not ok > ' + result.message);
          // Jump back to details step and show error
          proto.Wizard.jumpToStep(create_app_wizard, details_step, result.message);
        }
      );
    });
    
    create_app_wizard.find('#create_app_from_template').unbind('show').bind('show', function () {
      // list template apps
      var self = $(this);
      var template_select = self.find('#template_select');
      template_select.empty();
      self.find('#template_preview_button').button({'icons': {'primary': 'ui-icon-gear'}});
      $fw.client.model.Template.list(function (list) {
        if (list.length === 0) {
          proto.Wizard.previousStep(create_app_wizard, $fw.client.lang.getLangString('no_templates_message'));
        }
        else {
          console.log("got template app list");
          //log(template_select);
          for (var li = 0; li < list.length; li++) {
            var template = list[li];
            //log(template);
            var item = $('<option>', {'value': li, 'text': template.title });
            //log(item);
            template_select.append(item);
          }
          
          self.showTemplateDetails(self, list[0]);
          template_select.unbind('change').bind('change', {templates: list}, function (event) {
            var templates = event.data.templates;
            var index = $(this).val();
            console.log("selected template index: " + index);
            var t = templates[index];
            console.log("selected template guid: " + t.id + ":: title: " + t.title + " :: desc:: " + t.description);
            self.showTemplateDetails(self, t);
          });
        }
      }, function (error) {
        
      });
    });
    
    // TODO: clone steps should be brought in as well automatically rather than chaining 2 wizards
    
    create_app_wizard.find('#create_app_clone').unbind('show').bind('show', function () {
      // close the create app dialog, then call doClone
      
      var app_id = $fw.data.get('clone_from_app');
      self.doClone(app_id);
    });

    create_app_wizard.find('#generate_app').unbind('show').bind('show', function () {
      // Hide wizard, init App generator controller
      $('.jw-button-cancel').click();
      $('#list_apps_button_generate_app').click();
    });
    
    return create_app_wizard;
  },
  
  showTemplateDetails: function (container, template) {
    container.find('#template_title').text(template.title);
    container.find('#template_description').text(template.description);
    container.find('#template_icon').html($('<img>', {'src': $fw.client.icon.getIconUrl(template.id, $fw.client.icon.ICON_TYPE_LARGE)}));
    container.find('#template_preview_button').unbind().bind('click', function (e) {
      e.preventDefault();
      $fw.client.preview.showInDialog($fw.client.preview.getTemplatePreviewUrl(template.id, 'studio', template.domain), template.width);
    });
    $fw.data.set('clone_from_app', template.id);
  },
  
  finishAppWizard: function (finish_option, callback, intermediate) {
    var app_guid = $fw.data.get('new_app');
    var app_name = $fw.data.get('new_app_name');
    
    // Remove this key straight away to prevent it from being used as app to show any subsequent times an app is created.
    // This key is only ever set by the clone wizard as it doesn't have a guid to work with, only an id/name
    // e.g. com.example.devadmin.dave_test_preview_011
    $fw.data.remove('new_app_name');

    var is_app_name = app_name !== undefined;
    var app_identifier = is_app_name ? app_name : app_guid;
    
    console.log('finished... is_app_name = ' + is_app_name + ' app_identifier = ' + app_identifier + ' > ' + finish_option);
    
    if ('edit' === finish_option) {
      // force state to Editor > Files
      $fw.state.set('manage_apps_accordion_app', 'selected', 1);
      $fw.state.set('manage_apps_accordion_accordion_item_editor', 'selected', 0);
    }
    else {
      // force state to manage > publish
      $fw.state.set('manage_apps_accordion_app', 'selected', 0);
      $fw.state.set('manage_apps_accordion_accordion_item_manage', 'selected', 4);
    }
      
    // have to manually set selected item to 'my apps' to ensure breadcrumb updates
    list_apps_buttons.find('li').removeClass('ui-state-active');
    list_apps_buttons.find('#list_apps_button_my_apps').addClass('ui-state-active');
     
    // TODO: As we don't know if we cloned from a git based app until after the fact,
    //       the solution is to alert the user to change the git url when the app is
    //       read i.e. here
    self.doManage(app_identifier, callback, $.noop, is_app_name, intermediate);
  },
  
  showPublish: function () {
    $('#manage_publish').click();
  },
  
  getAppFramworksHtml: function(){
    var fw_options = $fw.getClientProp('appFrameworks');
    var getFwHtml = function(fw){
      var dom_id = fw.key.replace(/\./g, "_") + "_check";
      var html = "<td><input type='checkbox' id='"+ dom_id +"' ";
      html += "value='"+fw.key+"' />";
      html += "<label for='" + dom_id + " '>";
      html += fw.name.replace('_', ' ') + "  (v" + fw.version + ")";
      html += "</label></td>";
      return html;
    };
    var contentHtml = "<table><tr>";
    var column = 3;
    for(var i=0;i<fw_options.length;i++){
      var fw = fw_options[i];
      contentHtml += getFwHtml(fw);
      if(((i+1)%column === 0) || (i === (fw_options.length - 1))){
        contentHtml += "</tr>";
        if(i != fw_options.length - 1){
            contentHtml += "<tr>";
        }
      }
    }
    return contentHtml;
  }
});