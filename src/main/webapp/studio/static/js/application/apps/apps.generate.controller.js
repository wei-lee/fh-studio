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
  wufoo_single_form_client: {
    config: {
      app_type: "single_form"
    },
    wrapper: 'var wufoo_config = '
  },
  wufoo_single_form_cloud: {
    config: {
      app_type: "single_form"
    },
    wrapper: 'exports.wufoo_config = '
  },
  wufoo_multi_form_client: {
    config: {
      app_type: "multi_form"
    },
    wrapper: 'var wufoo_config = '
  },
  wufoo_multi_form_cloud: {
    config: {
      app_type: "multi_form"
    },
    wrapper: 'exports.wufoo_config = '
  },
  getConfig: function(key, global_name, merge) {
    var default_config = GenerateApp.Configs[key];

    // Merge with custom config
    var merged_config = GenerateApp.Utils.merge(default_config.config, merge);
    var config = default_config.wrapper + JSON.stringify(merged_config) + ';';
    return config;
  }
};

GenerateApp.Models.Wufoo = Class.extend({
  all: null,

  init: function() {},

  loadForms: function(api_key, domain, cb) {
    var url = 'https://' + domain + '/api/v3/forms.json';

    var local_url = Constants.EXTERNAL_REQUEST_URL;
    params = {
      url: url,
      method: "GET",
      auth: {
        username: api_key,
        password: "foostatic"
      },
      allowSelfSignedCert: true
    };

    $fw.server.post(local_url, params, function(res) {
      if (res.status == 200) {
        try {
          var json_data = JSON.parse(res.body);
          return cb({
            status: "ok",
            data: json_data
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

    $(self.container).find('.wufoo_api_domain').keyup(function() {
      var url = 'https://' + $(this).val() + '/api/code/';
      var link = $('<a>').attr('href', url).text(url).attr('target', '_blank');
      $(self.container).find('.wufoo_api_key_url').empty().append(link);
    });

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

    self.showProgressModal(title, message, function () {
      self.clearProgressModal();
      self.appendProgressLog('Cloning Wufoo app template.');

      // Import template & configure
      var import_url = Constants.IMPORT_APP_VIA_URL;
      params = {
        url: self.template_url
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
                console.log(res.log[i]);
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
      do_stage: false
    };

    var custom_client_config, custom_cloud_config, client_config, cloud_config;
    if (this.type == 'single') {
      var url = "https://" + this.getDomain() + "/forms/" + app_config.form.Hash + "/";

      custom_client_config = {
        form_hash: app_config.form.Hash,
        form_url: url
      };

      custom_cloud_config = {
        form_hash: app_config.form.Hash,
        form_url: url,
        api_key: self.getApiKey(),
        api_domain: self.getDomain()
      };

      custom_cloud_config.form_password = app_config.wufoo_form_password || null;

      client_config = GenerateApp.Configs.getConfig('wufoo_single_form_client', 'wufoo_config', custom_client_config);
      cloud_config = GenerateApp.Configs.getConfig('wufoo_single_form_cloud', 'wufoo_config', custom_cloud_config);
    } else {
      custom_client_config = {};
      custom_cloud_config = {
        api_key: self.getApiKey(),
        api_domain: self.getDomain()
      };
      custom_cloud_config.form_password = app_config.wufoo_form_password || null;
      client_config = GenerateApp.Configs.getConfig('wufoo_multi_form_client', 'wufoo_config', custom_client_config);
      cloud_config = GenerateApp.Configs.getConfig('wufoo_multi_form_cloud', 'wufoo_config', custom_cloud_config);
    }

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

          $fw.client.tab.apps.manageapps.controllers['apps.deploy.controller'].simpleDevDeploy(guid, function(res) {
            self.appendProgressLog('App configured.');
            cb();
          });

        });
      });
    });
  },

  selectedFormData: function() {
    var self = this;
    return $(self.container).find('.available_forms option:selected').data() || null;
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
      wufoo_api_key: $(self.container).find('.wufoo_api_key').val(),
      wufoo_api_domain: $(self.container).find('.wufoo_api_domain').val()
    };

    var password_checked = $(self.container).find('.protected_password').is(':checked');
    var password_value = $(self.container).find('.wufoo_form_password').val();

    if (password_checked && password_value !== '') {
      app_config.wufoo_form_password = password_value;
    }

    var wufoo_form_password = $(self.container).find('.wufoo_api_key:visible');

    var selected_form_data = self.selectedFormData();

    app_config.form = selected_form_data;
    return app_config;
  },

  show: function() {
    this.parent_controller.hideGeneratorList();
    $(this.container).show();
    this.bind();
  },

  hide: function() {
    $(this.container).hide();
    this.parent_controller.showGeneratorList();
  },

  validate: function() {
    var self = this;
    this.showLoader();
    var api_key = $('.wufoo_api_key:visible').val();
    var domain = $('.wufoo_api_domain:visible').val();
    this.model.loadForms(api_key, domain, function(res) {
      self.hideLoader();

      if (res.status == "ok") {
        self.showSuccess("Your credentials look good to us, you're ready to generate your app.");
        self.updateFormListing(res.data.Forms);
        self.enableAllInputs();
      } else {
        self.showError("We couldn't load your Wufoo forms. Please check your details below and try again.");
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
  }
});

GenerateApp.Controllers.WufooSingle = GenerateApp.Controllers.Wufoo.extend({
  template_url: "https://github.com/feedhenry/Wufoo-Template/zipball/master",
  container: '#wufoo_single_generator_form',
  type: 'single'
});

GenerateApp.Controllers.WufooMulti = GenerateApp.Controllers.Wufoo.extend({
  template_url: "https://github.com/feedhenry/Wufoo-Template/zipball/master",
  container: '#wufoo_multi_generator_form',
  type: 'multi'
});

var Apps = Apps || {};
Apps.Generate = Apps.Generate || {};

Apps.Generate.Controller = GenerateApp.Controller = Class.extend({
  config: null,
  generator_controllers: null,

  init: function(params) {
    var self = this;
    params = params || {};
    this.config = params.config || null;
    this.initGenerators();
  },

  bind: function() {
    var self = this;
    $('.generate_single_wufoo_app').unbind().click(function() {
      self.generators.wufoo_single.show();
    });
    $('.generate_multi_wufoo_app').unbind().click(function() {
      self.generators.wufoo_multi.show();
    });
  },

  initGenerators: function() {
    this.generators = {
      wufoo_single: new GenerateApp.Controllers.WufooSingle({
        controller: this
      }),
      wufoo_multi: new GenerateApp.Controllers.WufooMulti({
        controller: this
      })
    };
  },

  hide: function () {
    $('#generate_app').hide();
  },

  // hideCenterViews: function() {
  //   $('#list_apps_grid_wrapper > *').hide();
  // },

  resizeLayouts: function() {
    try {
      //apps_layout.resizeAll();
      //list_apps_layout.resizeAll();
      proto.Grid.resizeVisible();
    } catch (err) {
      console.log("Couldn't resize layouts, elements probably not displaying right now");
    }
  },

  show: function() {
    //this.hideCenterViews();
    // show new grid
    $('#generate_app').show();

    this.bind();
    this.showGeneratorList();
    this.resizeLayouts();
  },

  hideGeneratorList: function() {
    $('#generator_list').hide();
  },

  showGeneratorList: function() {
    $('#generator_list').show();
    $('.app_generator:visible').hide();
  }
});
