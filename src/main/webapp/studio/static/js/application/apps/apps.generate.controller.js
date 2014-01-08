var GenerateApp = GenerateApp || {};
GenerateApp.Controllers = GenerateApp.Controllers || {};
GenerateApp.Models = GenerateApp.Models || {};
GenerateApp.Configs = GenerateApp.Configs || {};
GenerateApp.Utils = GenerateApp.Utils || {};

GenerateApp.Utils = {
  merge: function(a, b) {
    if (b == null || typeof b == 'undefined') {
      return a;
    }
    for (var z in b) {
      // No prototype munging, thanks
      if (b.hasOwnProperty(z)) {
        a[z] = b[z];
      }
    }
    return a;
  }
};

GenerateApp.Configs = {
  client: {
    wrapper: 'var wufoo_config = '
  },
  cloud: {
    wrapper: 'exports.wufoo_config = '
  }
};

GenerateApp.Models.Wufoo = Class.extend({
  all: null,

  init: function() {},

  loadForms: function(domain, apiKey, user, password, cb) {
    var self = this;

    if( apiKey ) {
      self.getFormInfoWithKey(domain, apiKey, cb);
    }
    else if( user && password ) {
      self.getApiKeyFromCreds(domain, user, password, function(res) {
        if( res && res.status && res.status == "error") return cb(res);
        self.getFormInfoWithKey(domain, res.data.apiKey, cb);
      });
    }
  },

  getApiKeyFromCreds: function(domain, user, password, cb) {
    var local_url = Constants.EXTERNAL_REQUEST_URL;
    var login_cookies = ["PHPSESSID", "wuSecureCookie"];

    var loginParams = {
      url: 'https://' + domain + '/login/',
      method: "POST",
      body: "email=" + user + "&password=" + password,
      allowSelfSignedCert: true,
      contentType: "application/x-www-form-urlencoded"
    };

    $fw.server.post(local_url, loginParams, function(res) {
      if (res.status == 302) {
        try {
          var cookieHeader = '';
          if( res.cookies ) {
            for(var i=0; i < res.cookies.length; i++ ) {
              var c = res.cookies[i];
              if( c && c.name && $.inArray(c.name, login_cookies) != -1 ) {
                cookieHeader += c.name + "=" + c.value + ";";
              }
            }
          }

          var apiKeyParams = {
            url: 'https://' + domain + '/api/code/',
            method: "GET",
            headers: [{"name":"Cookie", "value" : cookieHeader}],
            allowSelfSignedCert: true
          };

          $fw.server.post(local_url, apiKeyParams, function(res) {
            if (res.status == 200) {
              var apiCodeRes = res.body;
              var apikeyText = $('#apikey', apiCodeRes);
              var apiKey = apikeyText.text();
              if( apiKey ) {
                return cb({
                  status: "ok",
                  data: {apiKey: apiKey}
                });
              }
              else {
                return cb({
                  status: "error",
                  data: "Unable to login to App Forms (not authenticated)"
                });
              }
            } else {
              return cb({
                status: "error",
                data: "Unable to login to App Forms (not authenticated)"
              });
            }
          });
        } catch (err) {
          return cb({
            status: "error",
            data: err
          });
        }
      } else {
        return cb({
          status: "error",
          data: "Unable to login to App Forms (not authenticated)"
        });
      }
    });
  },

  getFormInfoWithKey: function(domain, apiKey, cb) {
    var url = 'https://' + domain + '/api/v3/forms.json';

    var local_url = Constants.EXTERNAL_REQUEST_URL;
    params = {
      url: url,
      method: "GET",
      auth: {
        username: apiKey,
        password: 'footastic'
      },
      allowSelfSignedCert: true
    };

    $fw.server.post(local_url, params, function(res) {
      if (res.status == 200) {
        try {
          var json_data = JSON.parse(res.body);
          return cb({
            status: "ok",
            data: json_data,
            apiKey: apiKey
          });
        } catch (err) {
          return cb({
            status: "error",
            data: err
          });
        }
      } else {
        return cb({
          status: "error",
          data: res
        });
      }
    });
  }
});

GenerateApp.Controllers.Wufoo = Controller.extend({
  config: null,
  parent_controller: null,
  type: null,
  model: new GenerateApp.Models.Wufoo(),
  current_progress: 0,
  alert_timeout: 10000,

  template_url : $fw.getClientProp('appforms-repo'),
  require_credentials : $fw.getClientProp('appforms-require-credentials'),
  require_apikey : $fw.getClientProp('appforms-require-apikey'),

  showError: function(message) {
    var self = this;
    var alerts_area = $(this.container).find('#alerts');
    var alert = $('<div>').addClass('alert fade in alert-error').text(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    alerts_area.append(alert);
    setTimeout(function() {
      alert.slideUp(function () {
        alert.remove();
      });
    }, self.alert_timeout);
  },

  showSuccess: function(message) {
    var self = this;
    var alerts_area = $(this.container).find('#alerts');
    var alert = $('<div>').addClass('alert fade in alert-success').text(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    alerts_area.append(alert);
    setTimeout(function() {
      alert.slideUp(function () {
        alert.remove();
      });
    }, self.alert_timeout);
  },

  init: function(params) {
    var self = this;
    params = params || {};
    this.config = params.config || null;
    this.parent_controller = params.controller || null;
  },

  bind: function() {
    var self = this;
    $(self.container).find('.cancel_generate_app:visible').unbind().click(function() {
      self.hide();
      return false;
    });

    var updateApiKeyUrl = function() {
      var url = 'https://' + $(this).val() + '/api/code/';
      var link = $('<a>').attr('href', url).text(url).attr('target', '_blank');
      $(self.container).find('.wufoo_api_key_url').empty().append(link);
    };

    var api_domain_field = $(self.container).find('.wufoo_api_domain');
    api_domain_field.keyup(updateApiKeyUrl);
    api_domain_field.blur(updateApiKeyUrl);

    $(self.container).find('.validate:visible').unbind().click(function() {
      self.validate();
      return false;
    });

    $(self.container).find('.generate_app:visible').unbind().click(function() {
      self.generateApp();
      return false;
    });

    $(self.container).find('.view_selected_form:visible').unbind().click(function() {
      var selected_form_data = self.selectedFormData();
      var domain = self.getDomain();
      self.previewForm(domain, selected_form_data);
      return false;
    });

    $(self.container).find('.protected_password').unbind().click(function() {
      self.togglePasswordProtection($(this).is(':checked'));
    });
  },

  togglePasswordProtection: function(to_check) {
    var self = this;
    if (to_check) {
      // Transitioning to checked, show password field
      $(self.container).find('.form_password_container').show();
    } else {
      $(self.container).find('.form_password_container').hide();
    }
  },

  previewForm: function(domain, form_data) {
    var partial_url = form_data.Url;
    var url = "https://" + domain + "/forms/" + partial_url + "/";
    window.open(url, "_blank");
  },

  hideLoader: function() {
    $(this.container).find('.loader').hide();
  },

  showLoader: function() {
    $(this.container).find('.loader').show();
  },

  generateApp: function() {
    var self = this;
    var app_config = this.buildAppConfig();
    var title = "Generating Your App";
    var message = "We're generating your app...";

    var name = $('.wufoo_app_name:visible').val();

    self.showProgressModal(title, message, function () {
      self.clearProgressModal();
      self.appendProgressLog('Cloning App Forms app template.');

      // Import template & configure
      var import_url = Constants.IMPORT_APP_VIA_URL;
      params = {
        url: self.template_url,
        title: name
      };

      $fw.server.post(import_url, params, function(res) {
        if (res.cacheKey) {
          var cacheKey = res.cacheKey;
          self.appendProgressLog('Fetching template.');
          self.updateProgressBar(10);

          var new_guid = null;

          // Poll cacheKey
          var import_task = new ASyncServerTask({
            cacheKey: cacheKey
          }, {
            updateInterval: Properties.cache_lookup_interval,
            maxTime: Properties.cache_lookup_timeout,
            // 5 minutes
            maxRetries: Properties.cache_lookup_retries,
            timeout: function(res) {
              console.log('timeout error > ' + JSON.stringify(res));
              $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error'));
              self.updateProgressBar(100);
              if (typeof fail != 'undefined') {
                fail();
              }
            },
            update: function(res) {
              for (var i = 0; i < res.log.length; i++) {
                if (typeof res.action.guid != 'undefined') {
                  new_guid = res.action.guid;
                  console.log('GUID for new app > ' + new_guid);
                }
                self.appendProgressLog(res.log[i]);
                console.log("Current progress> " + self.current_progress);
              }
              self.updateProgressBar(self.current_progress + 1);
            },
            complete: function(res) {
              console.log('SCM refresh successful > ' + JSON.stringify(res));
              self.updateProgressBar(75);
            },
            error: function(res) {
              console.log('clone error > ' + JSON.stringify(res));
              $fw.client.dialog.error('App generation failed.' + "<br /> Error Message:" + res.error);
              self.updateProgressBar(100);
              if (typeof fail != 'undefined') {
                fail();
              }
            },
            retriesLimit: function() {
              console.log('retriesLimit exceeded: ' + Properties.cache_lookup_retries);
              $fw.client.dialog.error('App generation failed.');
              self.updateProgressBar(100);
              if (typeof fail != 'undefined') {
                fail();
              }
            },
            end: function() {
              self.injectConfig(app_config, new_guid, function() {
                self.destroyProgressModal();
                setTimeout(function() {
                  // Reset state back to the manage tab/build app
                  $fw.state.set('manage_apps_accordion_accordion_item_manage', 'selected', 4);
                  $fw.state.set('manage_apps_accordion_app', 'selected', 0);
                  $fw.data.set('template_mode', false);
                  $fw.client.tab.apps.manageapps.show(new_guid);
                }, 250);
              });
            }
          });
          import_task.run();
        } else {
          self.showError("Template fetching failed, we couldn't generate your app. Please try again.");
        }
      });
    });
  },

  injectConfig: function(app_config, guid, cb) {
    var self = this;

    var create_url = Constants.CREATE_FILE_URL;
    var update_url = Constants.SAVE_FILE_URL;

    var create_client_config_params = {
      widget: guid,
      filePath: "/client/default/js/",
      fileName: "wufoo_config.js",
      type: "file",
      do_stage: false
    };

    var create_cloud_config_params = {
      widget: guid,
      filePath: "/cloud/",
      fileName: "wufoo_config.js",
      type: "file",
      do_stage: false,
      csrftoken: $('input[name="csrftoken"]').val()
    };

    var config = self.buildConfig(app_config);

    var client_config = self.getConfig('client', config.client);
    var cloud_config = self.getConfig('cloud', config.cloud);

    var update_client_config_params = {
      files: [{
        path: "/client/default/js/wufoo_config.js",
        contents: client_config
      }, {
        path: "/cloud/wufoo_config.js",
        contents: cloud_config
      }],
      "appId": guid,
      do_stage: false
    };

    // Create client config
    $fw.server.post(create_url, create_client_config_params, function(res) {
      console.log('Client config created');
      // Create cloud config
      $fw.server.post(create_url, create_cloud_config_params, function(res) {
        console.log('Cloud config created');
        // Update client & cloud config
        $fw.server.post(update_url, update_client_config_params, function(res) {
          console.log('Configs updated');

          self.appendProgressLog('Configuring your app.');

          $fw.client.tab.apps.manageapps.getController('apps.deploy.controller').simpleDevDeploy(guid, 'default', function(res) {
            self.appendProgressLog('App configured.');
            cb();
          });

        });
      });
    });
  },

  buildConfig: function(app_config) {
    // Dummy function which should be over-ridden for each implmentation
    throw Error("Build Config must be over written!");
  },


  getDomain: function() {
    var self = this;
    return $(self.container).find('.wufoo_api_domain:visible').val() || null;
  },

  getApiKey: function() {
    var self = this;
    return $(self.container).find('.wufoo_api_key:visible').val() || null;
  },

  buildAppConfig: function() {
    var self = this;
    var app_config = {
      generated_app_type: "wufoo",
      email: $(self.container).find('.wufoo_email').val().trim(),
      password: $(self.container).find('.wufoo_password').val().trim(),
      api_key: $(self.container).find('.wufoo_api_key').val().trim(),
      api_domain: $(self.container).find('.wufoo_api_domain').val().trim()
    };

    var password_checked = $(self.container).find('.protected_password').is(':checked');
    var password_value = $(self.container).find('.wufoo_form_password').val();

    if (password_checked && password_value !== '') {
      app_config.form_password = password_value;
    }

    return app_config;
  },

  show: function() {
    var self = this;

    self.parent_controller.hideGeneratorList();

    $(self.container + ' #wufoo_auth_group').hide();
    $(self.container + ' #wufoo_apikey_group').hide();

    if( self.require_credentials == "true") {
      $(self.container + ' #wufoo_auth_group').show();
    }
    if( self.require_apikey == "true") {
      $(self.container + ' #wufoo_apikey_group').show();
    }

    $(self.container).show();
    this.bind();
  },

  hide: function() {
    $(this.container).hide();
    this.parent_controller.showGeneratorList();
  },

  validate: function() {
    var self = this;
    this.showLoader();
    var domain = $('.wufoo_api_domain:visible').val();
    var apiKey = $('.wufoo_api_key:visible').val();
    var email = $('.wufoo_email:visible').val();
    var password = $('.wufoo_password:visible').val();
    this.model.loadForms(domain, apiKey, email, password, function(res) {
      self.hideLoader();

      if (res.status == "ok") {
        // Put the API Key into the text field if it is in the res.
        // This is required for username/password authentication where API key is not provided by user
        if( res.apiKey ) {
          $(self.container).find('.wufoo_api_key').val(res.apiKey);
        }
        self.showSuccess("Your credentials look good to us, you're ready to generate your app.");
        self.updateFormListing(res.data.Forms);
        self.enableAllInputs();
      } else {
        self.showError("We couldn't load your App Forms forms. Please check your details below and try again.");
        self.disableInputs();
      }
    });
  },

  updateFormListing: function(forms) {
    var self = this;
    var form_selector = $(self.container).find('.available_forms:visible');
    form_selector.empty();
    this.enableAllInputs();

    $.each(forms, function(i, form) {
      var option = $('<option>').text(form.Name);
      // Data attributes
      option.data(form);
      form_selector.append(option);
    });
  },

  enableAllInputs: function() {
    var self = this;
    var inputs = $(self.container).find('input, select, button');
    $.each(inputs, function(i, input) {
      $(input).removeAttr("disabled");
      $(input).removeClass("disabled");
    });
  },

  disableInputs: function() {
    var self = this;
    $(self.container).find('.available_forms').empty().attr("disabled", "disabled");
    $(self.container).find('input[name=storage_type]').each(function(i, input) {
      $(input).attr("disabled", "disabled");
    });
    $(self.container).find('.generate_app, .view_selected_form').attr("disabled", "disabled");
  },

  getConfig: function(side, config) {

    config.app_type = this.type;

    var default_config = GenerateApp.Configs[side];

    var ret = default_config.wrapper + JSON.stringify(config, null, 2) + ';';
    return ret;
  }
});

GenerateApp.Controllers.WufooSingle = GenerateApp.Controllers.Wufoo.extend({
  li: '#wufoo_single_generator_option',
  container: '#wufoo_single_generator_form',
  type: 'single_form',

  selectedFormData: function() {
    var self = this;
    return $(self.container).find('.available_forms option:selected').data() || null;
  },

  buildConfig: function(app_config) {
    var self = this;
    var res = {};

    var selected_form_data = self.selectedFormData();
    var url = "https://" + this.getDomain() + "/forms/" + selected_form_data.Hash + "/";

    res.client = {
      form_hash: selected_form_data.Hash,
      form_url: url
    };

    res.cloud = app_config;
    res.cloud.form_hash = selected_form_data.Hash;
    res.cloud.form_url = url;
    return res;
  }
});

GenerateApp.Controllers.WufooMulti = GenerateApp.Controllers.Wufoo.extend({
  li: '#wufoo_multi_generator_option',
  container: '#wufoo_multi_generator_form',
  type: 'multi_form',

  buildConfig: function(app_config) {
    var res = {};
    res.client = {};
    res.cloud = app_config;
    return res;
  }
});

GenerateApp.Controllers.WufooSelection = GenerateApp.Controllers.Wufoo.extend({
  li: '#wufoo_selection_generator_option',
  container: '#wufoo_selection_generator_form',
  type: 'selection_form',
  swap_select_container: '#app_forms_swap_div',

  updateFormListing: function(forms) {

    var from = [];
    $.each(forms, function(i, item) {
      from.push([item.Name, item.Hash]);
    });
    this.bindSwapSelect(this.swap_select_container);
    this.updateSwapSelect(this.swap_select_container, from, []);
  },

  selectedFormData: function() {
    var self = this;

    var formHashes = self.getSelectedItems(self.swap_select_container);

    return formHashes;
  },

  buildConfig: function(app_config) {
    var self = this;
    var res = {};

    res.client = {};
    res.cloud = app_config;
    res.cloud.form_hashes = self.selectedFormData();
    return res;
  }
});

var Apps = Apps || {};
Apps.Generate = Apps.Generate || {};

Apps.Generate.Controller = GenerateApp.Controller = Class.extend({
  config: null,
  generators: null,

  init: function(params) {
    var self = this;
    params = params || {};
    this.config = params.config || null;
    this.initGenerators();
  },

  bind: function() {
    var self = this;
    $('.generate_appforms_app').unbind().click(function() {
      self.generators.appforms.show();
    });
    $('.show_wufoo_generator_app').unbind().click(function() {
      self.showWufooList();
    });

    $('.hide_wufoo_generator_app').unbind().click(function() {
      self.hideWufooList();
    });

    $('.generate_single_wufoo_app').unbind().click(function() {
      if(true){
        //todo change to be some property
        this.collection = new App.Collection.FormApps();
        this.pluralTitle = 'Forms Apps';
        this.singleTitle = 'Forms App';
        var mode = "create";
        this.singleId = this.singleTitle.toLowerCase().replace(/ /g, "");
        var createView = new App.View.FormAppsCreateEdit({ collection : this.collection, mode : mode, singleTitle : this.singleTitle, singleId : this.singleId, pluralTitle : this.pluralTitle });


        self.generators.wufoo_single.show();
        var step = $('.app_generator').find('.step_1').empty();
        $('.app_generator').find('.step_2').remove();

        createView.on("rendered", function (){
          console.log("rendered called");
          step.html(createView.$el);
        });


      }else{
        self.generators.wufoo_single.show();
      }

    });
    $('.generate_multi_wufoo_app').unbind().click(function() {
      self.generators.wufoo_multi.show();
    });
    $('.generate_selection_wufoo_app').unbind().click(function() {
      self.generators.wufoo_selection.show();
    });
  },

  initGenerators: function() {
    var self = this;

    self.all_generators = {
      wufoo_single: new GenerateApp.Controllers.WufooSingle({
        controller: this
      }),
      wufoo_multi: new GenerateApp.Controllers.WufooMulti({
        controller: this
      }),
      wufoo_selection: new GenerateApp.Controllers.WufooSelection({
        controller: this
      })
    };

    self.generators = {};

    var available_generators = $fw.getClientProp('appforms-available');

    var gens = available_generators.split(',');

    $('#app_generators li').hide();

    $.each(gens, function(i, item) {
      item = item.trim();
      var value = self.all_generators[item];
      if( value ) {
        self.generators[item] = value;

        var li_id = value['li'];
        $('#app_generators ' + li_id).show();
      }

    });

  },

  showWufooList: function () {
    $('#generator_list').show();
  },

  hideWufooList: function () {
    $('#generator_list').hide();
  },

  hide: function () {
    $('#generate_app').hide();
  },

  show: function() {
    $('#generate_app').show();

    this.bind();
    this.showGeneratorList();
  },

  hideGeneratorList: function() {
    $('#appforms_generator_list').hide();
    this.hideWufooList();
    $('#generator_list').hide();
  },

  showGeneratorList: function() {
    $('#appforms_generator_list').show();
    this.hideWufooList();
    $('.app_generator:visible').hide();
  }

});
