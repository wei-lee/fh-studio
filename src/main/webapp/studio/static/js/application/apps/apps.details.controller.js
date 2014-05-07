var Apps = Apps || {};

Apps.Details = Apps.Details || {};

Apps.Details.Controller = Apps.Controller.extend({

  models: {
    app: new model.App()
  },

  views: {
    manage_details_container: '#manage_details_container'
  },

  container: null,
  showPreview: true,

  init: function() {
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super();

    console.log('app details show');
    this.initFn();

    console.log('updateAppDetails');
    this.updateDetails();

    this.hide();
    this.container = this.views.manage_details_container;
    $(this.container).show();

    this.bindCopyButtons();
  },

  initBindings: function() {
    var self = this;

    var pleaseWaitText = $fw.client.lang.getLangString('please_wait_text');
    var scmTriggerButtonText = $fw.client.lang.getLangString('scm_trigger_button_text');

    // setup update details button
    var updateButtonText = $fw.client.lang.getLangString('manage_details_update_button_text'),
      updateButton = $('#manage_details_update_button');

    updateButton.text(updateButtonText).bind('click', function() {
      updateButton.attr('disabled', 'disabled').text(pleaseWaitText);
      self.doUpdate(function() {
        updateButton.removeAttr('disabled').text(updateButtonText).removeClass('ui-state-hover');
      });
    });

    // Migration bindings
    var migrateButton = $('#manage_details_migrate_app_button');
    migrateButton.on('click', function(e) {
      e.preventDefault();
      self.doMigrate();
      return false;
    });

    // also enable the scm trigger button
    var scmTriggerButton = $('#scm_trigger_button');
    scmTriggerButton.text(scmTriggerButtonText).bind('click', function(e) {
      e.preventDefault();
      scmTriggerButton.attr('disabled', 'disabled').text(pleaseWaitText);
      $fw.client.tab.apps.manageapps.triggerScm(function() {
        $fw.client.tab.apps.manageapps.getController('apps.preview.controller').show();
        $fw.client.tab.apps.manageapps.getController('apps.editor.controller').reloadFiles();
      }, $.noop, function() {
        scmTriggerButton.removeAttr('disabled').text(scmTriggerButtonText).removeClass('ui-state-hover');
      });
      return false;
    });

    // clone button
    $fw.client.tab.apps.manageapps.getController('apps.templates.controller').bindCloneButtons();
    $fw.client.lang.insertLangForContainer($(this.views.manage_details_container));

    // delete button
    $('#delete_app_button').text($fw.client.lang.getLangString('delete_app_button_text')).bind('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.doDelete();
    });
  },

  bindCopyButtons: function() {
    // Destroy existing agents
    $.each(ZeroClipboard.clients, function(i, client) {
      if ($(client.domElement).is(':visible')) {
        client.destroy();
      }
    });
    $(this.views.manage_details_container + " .d_clip_container").each(function() {
      var clip = new ZeroClipboard.Client();
      clip.setHandCursor(true);
      clip.glue($(this).find('.d_clip_button')[0], this);

      clip.addEventListener('mouseDown', function(client) {
        var text = $(client.domElement).closest('.controls').find('input,textarea').val();
        clip.setText(text);
        $fw.client.dialog.info.flash('Copied to your clipboard.');
      });
    });
  },

  updateDetails: function() {
    var self = this,
      app = $fw.data.get('app'),
      inst = $fw.data.get('inst'),
      detailsContainer = $('#manage_details_container');

    detailsContainer.find('input,textarea').each(function() {
      var el = $(this);
      el.val(inst[el.attr('name')]);
    });

    if (typeof inst.config.analyticsTag !== 'undefined') {
      detailsContainer.find('input[name=analytics_tag]').val(inst.config.analyticsTag.tag_name);
    }

    var scm = 'undefined' !== typeof app.config ? app.config.scm : undefined;
    if ('undefined' !== typeof scm) {
      detailsContainer.find('input[name=scmurl]').val(scm.url);
      if ('undefined' === typeof scm.key || scm.key.length < 1) {
        detailsContainer.find('textarea[name=scmkey]').parent().hide(); // hide scm key input as it's being deprecated
      } else {
        detailsContainer.find('textarea[name=scmkey]').val(scm.key);
      }
      detailsContainer.find('input[name=scmbranch]').val(scm.branch);
      detailsContainer.find('input[name=postreceiveurl]').val(self.getPostReceiveUrl()).focus(function() {
        this.select();
      });
    }
    if ('undefined' !== typeof app.config && 'undefined' !== typeof app.config.keys) {
      detailsContainer.find('textarea[name=keyspublic]').val(app.config.keys['public']);
    }

    detailsContainer.find('input[name=app_id]').val(inst.guid);
    if (inst.apiKey != null) {
      detailsContainer.find('input[name=app_apikey]').val(inst.apiKey);
    }

    var preview_config = inst.config.preview || {};
    var preview_list = $('#manage_details_container #new_app_target');
    $fw.client.tab.apps.manageapps.getController('apps.preview.controller').insertPreviewOptionsIntoSelect(preview_list, preview_config.device);
  },

  /*
   *
   */
  doUpdate: function(callback) {
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
    } else {
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
    var device = $fw.client.tab.apps.manageapps.getController('apps.preview.controller').resolveDevice(target);

    var app = $fw.data.get('app'),
      inst = $fw.data.get('inst');

    var fields = {
      app: app.guid,
      inst: inst.guid,
      title: form.find('input[name=title]').val(),
      description: form.find('textarea[name=description]').val(),
      height: device.height,
      width: device.width,
      config: $.extend(true, {}, inst.config, {
        analyticsTag: {
          tag_name: form.find('input[name=analytics_tag]').val(),
          updated: moment().valueOf()
        },
        preview: {
          device: target
        }
      }),
      widgetConfig: $.extend(true, {}, app.config, {
        scm: {
          url: form.find('input[name=scmurl]').val(),
          key: form.find('textarea[name=scmkey]').val(),
          branch: form.find('input[name=scmbranch]').val()
        }
      })
    };
    // submit to server
    self.models.app.update(fields, function(result) {
      console.log('update success:' + result);
      $fw.client.dialog.info.flash($fw.client.lang.getLangString('app_updated'));
      // TODO: overkill here by doing a second call to read the app
      // Run custom callback if its passed in, otherwise, do normal App reset (for now)

      $fw.client.tab.apps.manageapps.show(inst.guid);
      if ($.isFunction(callback)) {
        callback();
      }
    }, function(error) {
      $fw.client.dialog.error(error);
      console.log('update failed:' + error);
      if ($.isFunction(callback)) {
        callback();
      }
    });
  },

  /*
   * Gets the post receive url for the current app.
   * e.g. https://apps.feedhenry.com/box/srv/1.1/pub/app/xzEWsLxpEp60ED-PxM8Zlc0B/refresh
   */
  getPostReceiveUrl: function() {
    var postReceiveUrl, host;

    host = document.location.protocol + '//' + document.location.host;
    postReceiveUrl = host + $fw.client.tab.apps.manageapps.getTriggerUrl();

    return postReceiveUrl;
  },

  doDelete: function() {
    var self = this;

    // use guid of currently active app
    var inst = $fw.data.get('inst');

    if (inst != null) {
      console.log('app.doDelete guid:' + inst.guid);

      //$fw.client.dialog.showConfirmDialog($fw.client.lang.getLangString('caution'), icon_html + $fw.client.lang.getLangString('delete_app_confirm_text').replace('<APP>', $.trim(app_title.text())), function () {
      self.showBooleanModal('Are you sure you want to delete this App (' + inst.title + ')?', function() {
        self.showAlert('info', '<strong>Deleting App</strong> (' + inst.title + ') This may take some time.');
        // delete app
        self.models.app['delete'](inst.guid, function(res) {
          // move back to listapps view
          self.showAlert('success', '<strong>App Successfully Deleted</strong> (' + inst.title + ')');
          setTimeout(function() {
            $fw.client.tab.apps.listapps.show();
          }, 1000);
        }, function(e) {
          self.showAlert('error', '<strong>Error Deleting App</strong> (' + inst.title + ') ' + e);
        });
      });
    }
  },

  doMigrate: function() {
    var self = this;

    var project_id = $fw.data.get('app').guid;

    var import_progress = 10;

    self.showProgressModal("App Migration", "Migrating your App to FH3...", function() {
      self.clearProgressModal();
      self.appendProgressLog('Beginning FH2 to FH3 migration');
      self.updateProgressBar(import_progress);

      self.models.app.migrate({
        projectguid: project_id
      }, function(res) {
        console.log('migrate request success:' + res);

        var migrate_task = new ASyncServerTask({
          cacheKey: res.result
        }, {
          updateInterval: Properties.cache_lookup_interval,
          maxTime: Properties.cache_lookup_timeout,
          // 5 minutes
          maxRetries: Properties.cache_lookup_retries,
          timeout: function(res) {
            console.log('timeout > ' + JSON.stringify(res));
            self.markCompleteFailure();
          },
          update: function(res) {
            console.log('update > ' + JSON.stringify(res));
            for (var i = 0; i < res.log.length; i++) {
              console.log(res.log[i]);
              self.appendProgressLog(res.log[i]);
              console.log("Current progress> " + import_progress);
            }
            import_progress = import_progress + 2;
            self.updateProgressBar(import_progress);
          },
          complete: function(res) {
            console.log('complete > ' + JSON.stringify(res));
            self.markCompleteSuccess();
          },
          error: function(res) {
            console.log('error > ' + JSON.stringify(res));
            self.markCompleteFailure();
          },
          retriesLimit: function() {
            console.log('retries limit!');
            self.markCompleteFailure();
          },
          end: function() {
            // nothing to do here
          }
        });
        migrate_task.run();
      });

    }, function(error) {
      console.log('migrate failed:' + error);
    });
  }
});