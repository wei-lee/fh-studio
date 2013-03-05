proto.Wizard = {
  jq_defaults: {
    counter: {
      enable: true,
      type: "percentage",     // Default: "count"
      progressbar: true,      // Default: false
      location: "header",     // Default: "footer"
      startCount: true,       // Default: true
      finishCount: false,     // Default: true
      finishHide: false,      // Default: false
      appendText: "Done",     // Default: "Complete"
      orientText: "center"     // Default: "left" ("center" is also valid)
    }
  },
  
  fh_defaults: {
    modal: true,
    container: '#wizard_dialog'
  },
  
  load: function (wizard_id, jq_overrides, fh_overrides) {
    // setup analytics callbacks
    $fw.client.analytics.doWizard(wizard_id, jq_overrides);
    
    var fh_config = $.extend(true, {}, proto.Wizard.fh_defaults, fh_overrides || {});
    
    var el = proto.Wizard.createWizardHtml(wizard_id);
    
    // TODO: this shouldn't have to be done every time
    // insert lang text
    $fw.client.lang.insertLangForContainer(el, true);
    
    // Add elements from config, if needed
    el.find('*[config-radio]').each(function () {
      var parent, config, ci, cl, ct;
      
      parent = $(this);
      try {
        config = $fw.getClientProp(parent.attr('config-radio')).config;
        for (ci = 0, cl = config.length; ci < cl; ci += 1) {
          ct = config[ci];
          parent.append($('<div>', {
            'class': 'form-field ui-helper-reset ui-helper-clearfix'
          }).append($('<input>', {
            type: 'radio',
            id: parent.attr('id') + '_radio' + ci,
            name: parent.attr('id') + '_radio',
            value: ct.value,
            checked: ci === 0 ? 'checked': false
          })).append($('<label>', {
            'for': parent.attr('id') + '_radio' + ci 
          }).text(ct.label)));
        }
      } catch(e) {
        console.log('could not apply config for ' + parent.attr('config-radio') + ' :: ' + e.toString(), 'ERROR');
      }
      // make sure the radios aren't added every time wizard is re-used
      parent.removeAttr('config-radio');
    });
    
    // post tidy used by cancel and finish 
    var postTidy = function () {
      // close the modal dialog, if its used
      if (fh_config.modal) {
        $(fh_config.container).dialog('close');
      }
      el.jWizard('destroy');
      $(fh_config.container).dialog('destroy').empty();
    };
    
    // bind finish and cancel for tracking purposes
    var orig_cancel = jq_overrides.cancel;
    jq_overrides.cancel = function () {
      if ($.isFunction(orig_cancel)) {
        orig_cancel.call(this);
      }
      postTidy();
    };
    var orig_finish = jq_overrides.finish;
    jq_overrides.finish = function (event) {
      var form = $(event.target);
      // get inputs from anywhere in form/wizard
      proto.Wizard.updateInputs(form, form);
      if ($.isFunction(orig_finish)) {
        orig_finish.call(this);
      }
      postTidy();
    };
    var orig_next = jq_overrides.next;
    jq_overrides.next = function (event, args) {
      var next_step = args[0];
      var prev_step =args[1];
      proto.Wizard.updateInputs($(this), prev_step);
      if ($.isFunction(orig_next)) {
        orig_next.call(this, event, args);
      }
    };
    // callback after every change, going forward, even on finish
    /*jq_overrides.change = function (event, args) {
    }*/
    
    $(fh_config.container).show();
    
    // Insert wizard html into correct container
    $(fh_config.container).html(el);
    
    // apply wizard plugin
    el = el.jWizard($.extend(true, {}, proto.Wizard.jq_defaults, jq_overrides));
    
    // turn on the modal dialog if required
    if (fh_config.modal) {
      console.log('set up dialog');
      proto.Dialog.load($(fh_config.container), {}).dialog('open');
    }
    
    return el;
  },
  
  showAllButtons: function (el) {
    el.find('.jw-buttons button').show();
  },
  
  showCancelButton: function (el) {
    el.find('.jw-button-cancel').show();
  },
  
  hideAllButtons: function (el) {
    el.find('.jw-buttons button').hide();
  },
  
  hideCancelButton: function (el) {
    el.find('.jw-button-cancel').hide();
  },
  
  hidePreviousButton: function (el) {
    el.find('.jw-button-previous').hide();
  },
  
  jumpToStep: function (el, num, msg) {
    if ('number' === typeof num) {
      el.jWizard('changeStep', num -1);
    }
    else {
      // num is  an actual step, not a number
      el.jWizard('changeStep', num);
    }
    
    if ('undefined' !== typeof msg) {
      console.log('jumpToStep ' + num + ':' + msg);
      // TODO: show message inside wizard
      //        and specify the container to show the message in
      $fw.client.dialog.error(msg);
    }
  },
  
  previousStep: function (el, msg) {
    el.jWizard('previousStep');
    if ('undefined' !== typeof msg) {
      console.log('previousStep:' + msg);
      // TODO: show message inside wizard
      $fw.client.dialog.error(msg);
    }
  },
  
  destroy: function(el){
      el.jWizard('destroy');
  },
  
  createWizardHtml: function (id) {
    var steps = proto.Wizard.getWizards()[id];
    
    var step_wrapper = $('<form>', {
      id: id,
      jwtitle: $fw.client.lang.getLangString(id + '_supertitle'),
      autocomplete: 'off'
    });
    
    for (var si=0; si<steps.length; si++) {
      var step = steps[si];
      
      var jq_step = $('#' + step).clone();
      jq_step.attr('jwtitle', $fw.client.lang.getLangString(jq_step.attr('id') + '_title'));
      if (jq_step.hasClass('progress-step')) {
        jq_step.append($('<div>', {
          'class': 'progressbar'
        }).progressbar({
          value: 0
        })).append($('<div>', {
          'class': 'progresslog-wrapper'
        }).append($('<textarea>', {
          'class': 'progresslog'
        })));
      }
      step_wrapper.append(jq_step);
    }
    step_wrapper.addClass('form-horizontal');
    
    return step_wrapper;
  },
  
  getAllData: function (wizard) {
    return wizard.data('input_data') || {};
  },
  
  getData: function (wizard, key) {
    var data = wizard.data('input_data') || {};
    return data[key];
  },
  
  storeData: function (wizard, key, value) {
    var data = wizard.data('input_data') || {};
    data[key] = value;
    wizard.data('input_data', data);
  },
  
  updateInputs: function (wizard, container) {
    var data = proto.Wizard.getData(wizard, 'inputs') || {};
    container.find('input,textarea').each( function () {
      var el = $(this);
      if (el.is('[type=radio]')) {
        if (el.is(':checked')) {
          data[el.attr('id')] = 'checked';
        }
        else {
          data[el.attr('id')] = 'not_checked';
        }
      }
      else {
        data[el.attr('id')] = el.val();
      }
    });
    proto.Wizard.storeData(wizard, 'inputs', data);
  },

  getWizards: function() {
    // TODO: wizard steps should come with any necessary bindings (e.g. upload) and validation
    var wizards = {
      create_app_wizard: ['create_app_type', 'create_app_from_template', 'create_app_clone', 'create_app_details', 'create_app_from_scm', 'generate_app', 'create_app_progress', 'create_app_publickeysetup', 'create_app_scmprogress', 'create_app_next'],
      clone_app_wizard: ['clone_app_details', 'clone_app_progress', 'clone_app_next'],
      import_app_wizard: ['import_app_details', 'import_app_progress', 'import_app_next'],
      upload_icon_wizard: ['upload_icon_details', 'upload_icon_progress'],
      import_file_wizard: ['import_file_details', 'import_file_progress'],
      apple_getstarted_wizard: ['apple_getstarted_user', 'apple_getstarted_new', 'apple_getstarted_openssl', 'apple_getstarted_csr', 'apple_getstarted_account_help', 'apple_getstarted_finish'],
      apple_key_wizard: ['apple_key_upload', 'apple_key_finish'],
      apple_cert_wizard: ['apple_cert_upload', 'apple_cert_finish'],
      iphone_export_wizard: ['app_export_iphone_progress'],
      iphone_publish_wizard: ['app_publish_iphone_select_provisionings', 'app_publish_iphone_upload_provisionings', 'app_publish_iphone_upload_progress', 'app_publish_iphone_versions', 'app_publish_iphone_password', 'app_publish_iphone_progress'],
      ipad_export_wizard: ['app_export_ipad_progress'],
      ipad_publish_wizard: ['app_publish_ipad_select_provisionings', 'app_publish_ipad_upload_provisionings', 'app_publish_ipad_upload_progress', 'app_publish_ipad_versions', 'app_publish_ipad_password', 'app_publish_ipad_progress'],
      ios_export_wizard: ['app_export_ios_progress'],
      ios_publish_wizard: ['app_publish_ios_select_provisionings', 'app_publish_ios_upload_provisionings', 'app_publish_ios_upload_progress', 'app_publish_ios_versions', 'app_publish_ios_password', 'app_publish_ios_progress'],
      android_getstarted_wizard: ['android_getstarted_resources', 'android_getstarted_generate_password', 'android_getstarted_generate', 'android_getstarted_finish'],
      android_key_wizard: ['android_key_upload', 'android_key_finish'],
      android_export_wizard: ['app_export_android_progress'],
      android_publish_wizard: ['app_publish_android_versions', 'app_publish_android_password', 'app_publish_android_progress'],
      android_cert_wizard: ['android_cert_upload', 'android_cert_finish'],
      windowsphone7_export_wizard: ['app_export_windowsphone7_versions', 'app_export_windowsphone7_progress'],
      windowsphone7_publish_wizard: ['app_publish_windowsphone7_versions', 'app_publish_windowsphone7_progress'],
      blackberry_export_wizard: ['app_export_blackberry_versions', 'app_export_blackberry_progress'],
      blackberry_publish_wizard: ['app_publish_blackberry_versions', 'app_publish_blackberry_password', 'app_publish_blackberry_progress'],
      blackberry_getstarted_wizard: ['blackberry_csk_upload', 'blackberry_csk_finish', 'blackberry_db_upload', 'blackberry_db_finish'],
      blackberry_csk_wizard: ['blackberry_csk_upload', 'blackberry_csk_finish'],
      blackberry_db_wizard: ['blackberry_db_upload', 'blackberry_db_finish']
    };

    if ($fw.client.tab.apps.manageapps != null && $fw.client.tab.apps.manageapps.isNodeJsApp()) {
      console.log('Node.js based app, applying wizard changes');
      wizards.blackberry_publish_wizard = ['app_publish_blackberry_versions', 'app_publish_blackberry_password', 'app_publish_blackberry_progress'];
      wizards.ipad_publish_wizard = ['app_publish_ipad_select_provisionings', 'app_publish_ipad_upload_provisionings', 'app_publish_ipad_upload_progress', 'app_publish_ipad_versions', 'app_publish_ipad_password', 'app_publish_ipad_progress'];
      wizards.iphone_publish_wizard = ['app_publish_iphone_select_provisionings', 'app_publish_iphone_upload_provisionings', 'app_publish_iphone_upload_progress','app_publish_iphone_versions', 'app_publish_iphone_password', 'app_publish_iphone_progress'];
      wizards.ios_publish_wizard = ['app_publish_ios_select_provisionings', 'app_publish_ios_upload_provisionings', 'app_publish_ios_upload_progress', 'app_publish_ios_versions', 'app_publish_ios_password', 'app_publish_ios_progress'];
      wizards.windowsphone7_publish_wizard = ['app_publish_windowsphone7_versions', 'app_publish_windowsphone7_progress'];
      wizards.android_publish_wizard = ['app_publish_android_versions', 'app_publish_android_password', 'app_publish_android_progress'];
      wizards.embed_publish_wizard = ['app_publish_embed_deploying_env', 'app_publish_embed_deploying_progress', 'app_publish_embed_progress'];
    }

    return wizards;
  }

};