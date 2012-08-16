var Apps = Apps || {};

Apps.Details = Apps.Details || {};

Apps.Details.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    manage_details_container: '#manage_details_container'
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,
  showPreview: true,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  show: function(){
    this._super();
    
    console.log('app details show');
    this.initFn();

    console.log('updateAppDetails');
    this.updateDetails();

    this.hide();
    this.container = this.views.manage_details_container;
    $(this.container).show();
  },

  initBindings: function () {
    var self = this;

    var pleaseWaitText = $fw.client.lang.getLangString('please_wait_text');
    var scmTriggerButtonText = $fw.client.lang.getLangString('scm_trigger_button_text');

    // setup update details button
    var updateButtonText = $fw.client.lang.getLangString('manage_details_update_button_text'),
        updateButton = $('#manage_details_update_button');
    updateButton.text(updateButtonText).bind('click', function () {
      updateButton.attr('disabled', 'disabled').text(pleaseWaitText);
      self.doUpdate(function () {
        updateButton.removeAttr('disabled').text(updateButtonText).removeClass('ui-state-hover');
      });
    });
    
    // also enable the scm trigger button
    var scmTriggerButton = $('#scm_trigger_button');
    scmTriggerButton.text(scmTriggerButtonText).bind('click', function () {
      scmTriggerButton.attr('disabled', 'disabled').text(pleaseWaitText);
      $fw.client.tab.apps.manageapps.triggerScm(function () {
        $fw.client.preview.show();
        $fw.client.tab.apps.manageapps.getController('apps.editor.controller').reloadFiles();
      },
      $.noop,
      function () {
        scmTriggerButton.removeAttr('disabled').text(scmTriggerButtonText).removeClass('ui-state-hover');
      });
    });
    $fw.client.lang.insertLangForContainer($(this.views.manage_details_container));
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
        // FIXME: what to set/reset here
        
        //$fw.client.tab.apps.manageapps.show(result.inst.guid);
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
   * Gets the post receive url for the current app.
   * e.g. https://apps.feedhenry.com/box/srv/1.1/pub/app/xzEWsLxpEp60ED-PxM8Zlc0B/refresh
   */
  getPostReceiveUrl: function () {
    var postReceiveUrl,
        host;
    
    host = document.location.protocol + '//' + document.location.host;
    postReceiveUrl = host + $fw.client.tab.apps.manageapps.getTriggerUrl();
    
    return postReceiveUrl;
  }

});