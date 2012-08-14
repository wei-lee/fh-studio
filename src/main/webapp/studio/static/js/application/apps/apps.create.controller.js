var Apps = Apps || {};

Apps.Create = Apps.Create || {};

Apps.Create.Controller = Controller.extend({

  model: {
    // TODO: Add models for app and template, used below

    //device: new model.Device()
  },

  views: {
    // manage_publish_container: "#manage_publish_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,
  
  EXTERNAL_APP_TYPE: 'EXTERNAL',
  DEFAULT_APP_TYPE: 'DEFAULT',

  init: function () {
    
  },

  show: function(){
    this._super();

    console.log('app create show');
    this.initCreateAppWizard();
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
      var frameworksEl = $(this);
      if(frameworksEl.find('input').length === 0){
        var contentHtml = $fw.client.tab.apps.manageapps.getController('apps.libraries.controller').getAppFramworksHtml();
        frameworksEl.find('#create_app_frameworks_text').after(contentHtml);
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
    
    // FIXME: readd state restoration
    
    // if ('edit' === finish_option) {
    //   // force state to Editor > Files
    //   $fw.state.set('manage_apps_accordion_app', 'selected', 1);
    //   $fw.state.set('manage_apps_accordion_accordion_item_editor', 'selected', 0);
    // }
    // else {
    //   // force state to manage > publish
    //   $fw.state.set('manage_apps_accordion_app', 'selected', 0);
    //   $fw.state.set('manage_apps_accordion_accordion_item_manage', 'selected', 4);
    // }
      
    // have to manually set selected item to 'my apps' to ensure breadcrumb updates
    // var list_apps_buttons = $('#list_apps_buttons');
    // list_apps_buttons.find('li').removeClass('ui-state-active');
    // list_apps_buttons.find('#list_apps_button_my_apps').addClass('ui-state-active');
     
    // TODO: As we don't know if we cloned from a git based app until after the fact,
    //       the solution is to alert the user to change the git url when the app is
    //       read i.e. here
    $fw.client.tab.apps.manageapps.show(app_identifier, callback, $.noop, is_app_name, intermediate);
  }

});