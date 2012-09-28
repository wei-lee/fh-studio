var Apps = Apps || {};

Apps.Import = Apps.Import || {};

Apps.Import.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    //templates_grid: "#gbox_templates_grid"
  },

  container: null,

  init: function () {
    
  },

  show: function() {
    this._super();

    console.log('app.import.controller show');
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
          }, 200);
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

      setTimeout(function(){
        fileToUpload.submit();
      }, 300); // :(
    });
  },
  
  // duplicate of what's in apps.create.controller
  // ok to duplicate as it will not be needed when wizards are gone
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
    
    $fw.data.set('template_mode', false);
    $fw.client.tab.apps.manageapps.show(app_identifier, function () {
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
  }

});