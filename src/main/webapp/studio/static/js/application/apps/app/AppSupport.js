application.AppSupport = Class.extend({
  
  init: function () {
    Log.append('init AppSupport');
  },
  
  initCloneAppWizard: function () {
    Log.append('initCloneAppWizard');
    var clone_app_wizard = proto.Wizard.load('clone_app_wizard', {
      validate: true,
      finish: function () {
        var finish_option = clone_app_wizard.find('#clone_app_next input:radio:checked').val();

        $fw_manager.client.app.support.finishAppWizard(finish_option, function () {
           if ($fw.client.app.isScmApp()) { // Only display te Git Url warning for SCM hosted Apps
              $fw.client.dialog.warning($fw.client.lang.getLangString('post_cloned_git_app'));
           }
          }, function(postFn) {
             if ($fw.client.app.isScmApp()) {
               $fw.client.app.triggerScm($.noop, $.noop, postFn);   // this needs to be called after app is cloned/read
               // Don't need to stage app here because triggering the scm automatically stages the app after scm updates files
             } else {
              // for non-scm apps, trigger staging and proceed as normal
               $fw.client.app.stageApp();
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
      
      Log.append('sending clone request to server');
      $fw_manager.server.post(Constants.CLONE_APP_URL, {
        guid : $fw_manager.data.get('clone_from_app'),
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
              Log.append('timeout error > ' + JSON.stringify(res));
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
              Log.append('clone successful, good to go > ' + JSON.stringify(res));
              $fw_manager.data.set('new_app_name', result.appId);
              Log.append('jumping to final step and hiding progress dialog');
              proto.Wizard.jumpToStep(clone_app_wizard, 3);
              proto.Wizard.hidePreviousButton(clone_app_wizard); 
            },
            error: function (res) {
              Log.append('clone error > ' + JSON.stringify(res));
              proto.Wizard.jumpToStep(clone_app_wizard, 1, $fw_manager.client.lang.getLangString('clone_server_error'));
            },
            retriesLimit: function () {
              proto.Wizard.jumpToStep(clone_app_wizard, 1, $fw_manager.client.lang.getLangString('clone_server_error'));
            },
            end: function () {
              // nothing to do here
            }
          });
          clone_task.run();
        } else {
          proto.Wizard.jumpToStep(clone_app_wizard, 1, result.message || $fw_manager.client.lang.getLangString('clone_server_error'));
        }
      }, function () {
        proto.Wizard.jumpToStep(clone_app_wizard, 1, $fw_manager.client.lang.getLangString('clone_server_error'));
        Log.append('clone failed', 'ERROR');
      });
    });
    
    return clone_app_wizard;
  },

  initCreateAppWizard: function () {
    var create_app_wizard = proto.Wizard.load('create_app_wizard', {
      validate: true,
      finish: function () {
        var finish_option = create_app_wizard.find('#create_app_next input:radio:checked').val();
        
        $fw_manager.client.app.support.finishAppWizard(finish_option);
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
      $fw.data.set('app_type', $fw.client.app.EXTERNAL_APP_TYPE);
    });
    create_app_wizard.find("#create_app_details").unbind('show').bind('show', function (e) {
      $fw.data.set('app_type', $fw.client.app.DEFAULT_APP_TYPE);
    });
    
    create_app_wizard.find('#create_app_frameworks').unbind('show').bind('show', function(e){
      var self = $(this);
      if(self.find('input').length == 0){
      	var contentHtml = $fw_manager.client.app.support.getAppFramworksHtml();
        self.find('#create_app_frameworks_text').after(contentHtml);
      }
    })
        
    create_app_wizard.find("#create_app_progress").unbind('show').bind('show', function (e) {
      var step = $(this),
          appType = $fw.data.get('app_type'),
          details_step;
      
      var framework_step = null;
      
      if ($fw.client.app.EXTERNAL_APP_TYPE === appType) {
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
      if ($fw.client.app.EXTERNAL_APP_TYPE === appType) {
        params.scmurl = details_step.find('input[name=scmurl]').val();
        params.scmbranch = details_step.find('input[name=scmbranch]').val();
      }
      
      if(null != framework_step){
      	var selected_fws = framework_step.find('input[type=checkbox]:checked');
      	var fw_values = [];
      	for(var i=0;i<selected_fws.length;i++){
      		fw_values.push($(selected_fws[i]).val());
      	}
      	if(fw_values.length > 0){
      		params.frameworks = fw_values;
      	}
      }
      
      $fw_manager.client.model.App.create(params, 
        function (app) {
          Log.append('create ok');
          proto.ProgressDialog.append(step, 'App created successfully.');
          $fw_manager.data.set('new_app', app.guid);
          
          var nextStep = create_app_wizard.find('#create_app_next');
          // Disable 'edit' as a follow on option for scm based apps
          if ($fw.client.app.EXTERNAL_APP_TYPE === appType) {
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
                $fw.client.app.triggerScm(function () {
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
                Log.append('timeout error > ' + JSON.stringify(res));
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
                Log.append('clone error > ' + JSON.stringify(res));
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
          Log.append('create not ok > ' + result.message);
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
      $fw_manager.client.model.Template.list(function (list) {
        if (list.length === 0) {
          proto.Wizard.previousStep(create_app_wizard, $fw_manager.client.lang.getLangString('no_templates_message'));
        }
        else {
          Log.append("got template app list");
          //console.log(template_select);
          for (var li = 0; li < list.length; li++) {
            var template = list[li];
            //console.log(template);
            var item = $('<option>', {'value': li, 'text': template.title });
            //console.log(item);
            template_select.append(item);
          }
          
          $fw_manager.client.app.showTemplateDetails(self, list[0]);
          template_select.unbind('change').bind('change', {templates: list}, function (event) {
            var templates = event.data.templates;
            var index = $(this).val();
            Log.append("selected template index: " + index);
            var t = templates[index];
            Log.append("selected template guid: " + t.id + ":: title: " + t.title + " :: desc:: " + t.description);
            $fw_manager.client.app.showTemplateDetails(self, t);
          });
        }
      }, function (error) {
        
      });
    });
    
    // TODO: clone steps should be brought in as well automatically rather than chaining 2 wizards
    
    create_app_wizard.find('#create_app_clone').unbind('show').bind('show', function () {
      // close the create app dialog, then call doClone
      
      var app_id = $fw_manager.data.get('clone_from_app');
      $fw_manager.client.app.doClone(app_id);
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
    container.find('#template_icon').html($('<img>', {'src': $fw_manager.client.icon.getIconUrl(template.id, $fw_manager.client.icon.ICON_TYPE_LARGE)}));
    container.find('#template_preview_button').unbind().bind('click', function () {
      $fw_manager.client.preview.showInDialog($fw_manager.client.preview.getTemplatePreviewUrl(template.id, 'studio', template.domain), template.width);
    });
    $fw_manager.data.set('clone_from_app', template.id);
  },
  
  finishAppWizard: function (finish_option, callback, intermediate) {
    var app_guid = $fw_manager.data.get('new_app');
    var app_name = $fw_manager.data.get('new_app_name');
    
    // Remove this key straight away to prevent it from being used as app to show any subsequent times an app is created.
    // This key is only ever set by the clone wizard as it doesn't have a guid to work with, only an id/name
    // e.g. com.example.devadmin.dave_test_preview_011
    $fw_manager.data.remove('new_app_name');

    var is_app_name = app_name !== undefined;
    var app_identifier = is_app_name ? app_name : app_guid;
    
    Log.append('finished... is_app_name = ' + is_app_name + ' app_identifier = ' + app_identifier + ' > ' + finish_option);
    
    if ('edit' === finish_option) {
      // force state to Editor > Files
      $fw_manager.state.set('manage_apps_accordion_app', 'selected', 1);
      $fw_manager.state.set('manage_apps_accordion_accordion_item_editor', 'selected', 0);
    }
    else {
      // force state to manage > publish
      $fw_manager.state.set('manage_apps_accordion_app', 'selected', 0);
      $fw_manager.state.set('manage_apps_accordion_accordion_item_manage', 'selected', 4);
    }
      
    // have to manually set selected item to 'my apps' to ensure breadcrumb updates
    list_apps_buttons.find('li').removeClass('ui-state-active');
    list_apps_buttons.find('#list_apps_button_my_apps').addClass('ui-state-active');
     
    // TODO: As we don't know if we cloned from a git based app until after the fact,
    //       the solution is to alert the user to change the git url when the app is 
    //       read i.e. here
    $fw_manager.client.app.doManage(app_identifier, callback, $.noop, is_app_name, intermediate);
  },
  
  showPublish: function () {
    $('#manage_publish').click();
  },
  
  getAppFramworksHtml: function(){
  	var fw_options = $fw_manager.getClientProp('appFrameworks');
    var getFwHtml = function(fw){
      var dom_id = fw.key.replace(/\./g, "_") + "_check";
      var html = "<td><input type='checkbox' id='"+ dom_id +"' ";
      html += "value='"+fw.key+"' />";
      html += "<label for='" + dom_id + " '>"
      html += fw.name.replace('_', ' ') + "  (v" + fw.version + ")";
      html += "</label></td>";
      return html;
    }
    var contentHtml = "<table><tr>";
    var column = 3;
    for(var i=0;i<fw_options.length;i++){
      var fw = fw_options[i];
      contentHtml += getFwHtml(fw);
      if((i+1)%column == 0 || i==fw_options.length - 1){
        contentHtml += "</tr>";
        if(i != fw_options.length - 1){
            contentHtml += "<tr>";
        }
      }
    }
    return contentHtml;   	
  }
});