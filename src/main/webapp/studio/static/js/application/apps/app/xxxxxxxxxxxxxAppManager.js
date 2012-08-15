application.AppManager = Class.extend({
  
  init: function () {
    
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
  }
});