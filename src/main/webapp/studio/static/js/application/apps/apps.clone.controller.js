var Apps = Apps || {};

Apps.Clone = Apps.Clone || {};

Apps.Clone.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {},

  container: null,

  init: function() {

  },

  show: function(guid) {
    console.log('app.doclone');
    $fw.data.set('clone_from_app', guid);
    var clone_app_wizard = this.initCloneAppWizard();
    clone_app_wizard.jWizard('firstStep');
    proto.Wizard.hidePreviousButton(clone_app_wizard);
  },

  initCloneAppWizard: function() {
    var self = this;
    console.log('initCloneAppWizard');
    var clone_app_wizard = proto.Wizard.load('clone_app_wizard', {
      validate: true,
      finish: function() {
        var finish_option = clone_app_wizard.find('#clone_app_next input:radio:checked').val();

        self.finishAppWizard(finish_option, function() {
          if ($fw.client.tab.apps.manageapps.isScmApp()) { // Only display te Git Url warning for SCM hosted Apps
            $fw.client.dialog.warning($fw.client.lang.getLangString('post_cloned_git_app'));
          }
        }, function(postFn) {
          if ($fw.client.tab.apps.manageapps.isScmApp()) {
            $fw.client.tab.apps.manageapps.triggerScm($.noop, $.noop, postFn); // this needs to be called after app is cloned/read
            // Don't need to stage app here because triggering the scm automatically stages the app after scm updates files
          } else {
            // for non-scm apps, trigger staging and proceed as normal
            self.deployApp();
            postFn();
          }
        });
      }
    });

    clone_app_wizard.validate({
      rules: {
        app_title: 'required'
      }
    });

    clone_app_wizard.find("#clone_app_progress").unbind('show').bind('show', function(e) {
      var step = $(this);

      proto.ProgressDialog.resetBarAndLog(step);
      proto.ProgressDialog.setProgress(step, 1);
      proto.ProgressDialog.append(step, 'Starting Clone');

      console.log('sending clone request to server');
      $fw.server.post(Constants.CLONE_APP_URL, {
        guid: $fw.data.get('clone_from_app'),
        title: clone_app_wizard.find('input[name=app_title]').val()
      }, function(result) {
        if (result.cacheKey && result.appId) {
          var clone_task = new ASyncServerTask({
            cacheKey: result.cacheKey
          }, {
            updateInterval: Properties.cache_lookup_interval,
            maxTime: Properties.cache_lookup_timeout,
            // 5 minutes
            maxRetries: Properties.cache_lookup_retries,
            timeout: function(res) {
              console.log('timeout error > ' + JSON.stringify(res));
              // TODO: internationalise during refactor
              proto.Wizard.jumpToStep(clone_app_wizard, 1, 'Clone timed out');
            },
            update: function(res) {
              for (var i = 0; i < res.log.length; i++) {
                proto.ProgressDialog.append(step, res.log[i]);
              }
              if (res.progress) {
                proto.ProgressDialog.setProgress(step, parseInt(res.progress, 10));
              }
            },
            complete: function(res) {
              proto.ProgressDialog.setProgress(step, 100);
              console.log('clone successful, good to go > ' + JSON.stringify(res));
              $fw.data.set('new_app_name', result.appId);
              console.log('jumping to final step and hiding progress dialog');
              proto.Wizard.jumpToStep(clone_app_wizard, 3);
              proto.Wizard.hidePreviousButton(clone_app_wizard);
            },
            error: function(res) {
              console.log('clone error > ' + JSON.stringify(res));
              proto.Wizard.jumpToStep(clone_app_wizard, 1, $fw.client.lang.getLangString('clone_server_error'));
            },
            retriesLimit: function() {
              proto.Wizard.jumpToStep(clone_app_wizard, 1, $fw.client.lang.getLangString('clone_server_error'));
            },
            end: function() {
              // nothing to do here
            }
          });
          clone_task.run();
        } else {
          proto.Wizard.jumpToStep(clone_app_wizard, 1, result.message || $fw.client.lang.getLangString('clone_server_error'));
        }
      }, function() {
        proto.Wizard.jumpToStep(clone_app_wizard, 1, $fw.client.lang.getLangString('clone_server_error'));
        console.log('clone failed', 'ERROR');
      });
    });

    return clone_app_wizard;
  },

  finishAppWizard: function(finish_option, callback, intermediate) {
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
    } else {
      // force state to manage > publish
      $fw.state.set('manage_apps_accordion_app', 'selected', 0);
      $fw.state.set('manage_apps_accordion_accordion_item_manage', 'selected', 4);
    }

    // have to manually set selected item to 'my apps' to ensure breadcrumb updates
    // list_apps_buttons.find('li').removeClass('ui-state-active');
    // list_apps_buttons.find('#list_apps_button_my_apps').addClass('ui-state-active');
    // TODO: As we don't know if we cloned from a git based app until after the fact,
    //       the solution is to alert the user to change the git url when the app is
    //       read i.e. here
    $fw.client.tab.apps.listapps.show();
    $('#myapps_listitem a').trigger('click');
    $fw.data.set('template_mode', false);
    $fw.client.tab.apps.manageapps.show(app_identifier, function() {
      // TODO: Duplicated from apps create controller!!
      //       better way of doing this as show will be called twice for 2 different controllers.
      //       once above for manageapps show, and once below
      var controller = 'apps.quickstart.controller';
      if ('publish' === finish_option) {
        controller = 'apps.build.controller';
      } else if ('edit' === finish_option) {
        controller = 'apps.editor.controller';
      }
      $('.manageapps_nav_list a[data-controller="' + controller + '"]').trigger('click');

      if ($.isFunction(callback)) {
        callback();
      }
    }, $.noop, is_app_name, intermediate);
  },

  deployApp: function(guid, cb) {
    var url, params, app;

    if (!guid) {
      guid = $fw.data.get('app').guid;
    }

    url = Constants.DEPLOY_APP_URL;
    params = {
      guid: guid
    };

    $fw.server.post(url, params, function(result) {
      // TODO: succeed or fail quietly for now
      console.log('deploy result:' + JSON.stringify(result));
      if ($.isFunction(cb)) {
        cb(result);
      }
    });
  }

});