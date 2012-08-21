var Apps = Apps || {};
Apps.Tab = Apps.Tab || {};

Apps.Tab.Manager = Tab.Manager.extend({

  init: function() {
    this.listapps = new ListappsTabManager();
    this.manageapps = new ManageappsTabManager();
    // FIXME state restoration
    this.initFn = _.once(this.listapps.show); // show list apps first
    this.postFn = $.noop;

    var nodejs_domain = $fw.getClientProp('nodejsEnabled') == "true";
    if (nodejs_domain) {
      this.enableNodejsDomain();
    } else {
      this.enableRhinoDomain();
    }
  },

  show: function() {
    // purposely overwrite super's show and don't call it
    // this tab manager is made up of 2 tab managers
    // - list.apps.tab.manager
    // - manage.apps.tab.manager
    // TODO: state restoration
    this.initFn();
  },

  enableRhinoDomain: function () {
    // disable nodejs stuff and enable rhino stuff at 'domain' level i.e. some apps be still be nodejs enabled inside a rhino domain

    // remove generate app from create app wizard
    $('#create_app_generator_container').hide().remove();
  },

  enableNodejsDomain: function () {
    // disable rhino stuff and enable nodejs stuff at 'domain' level i.e. some apps be still be rhino enabled inside a nodejs domain
    var app_generation_enabled = $fw.getClientProp('app-generation-enabled') == "true";
    if (!app_generation_enabled) {
      // app generation disabled, remove generate app from create app wizard
      $('#create_app_generator_container').hide().remove();
    }
  }
});

ListappsTabManager = Tab.Manager.extend({
  id: 'list_apps_layout',
  breadcrumbId: 'apps_breadcrumb',
  visible: false,

  init: function() {
    this._super();
    this.postFn = $.noop;
    this.initFn(); // ??? TODO: why is this called here??? should be in show??, but breaks if it's moved there. hmmm
  },

  show: function() {
    this._super();

    // also setup apps create/generate/import/clone controller as this isn't defined as a 'data-controller' in html
    this.getController('apps.create.controller').hide();
    this.getController('apps.import.controller').hide();
    this.getController('apps.generate.controller').hide();
    this.getController('apps.clone.controller').hide();

    // hide preveiw show/hide buttons
    $('.preview_toggle').hide();

    $('#manage_apps_layout').hide();
    $('#list_apps_layout').show();

    var itemToClick = $('.listapps_nav_list li.active:visible a');
    if (itemToClick.length === 0) {
      itemToClick = $('.listapps_nav_list li:visible a:eq(0)');
    }
    itemToClick.trigger('click');
  },

  updateCrumbs: function (self) {
    var breadcrumbs = $('#' + self.breadcrumbId);

    var preview_buttons = breadcrumbs.find('.preview_buttons').detach(); // detach is important here
    this._super(self);
    breadcrumbs.append(preview_buttons);
  }

});

ManageappsTabManager = Tab.Manager.extend({
  id: 'manage_apps_layout',
  breadcrumbId: 'apps_breadcrumb',

  init: function() {
    this._super();

    this.postFn = $.noop;
  },

  show: function(guid, success, fail, is_name, intermediate) {
    var self = this;
    // clear current app data
    $fw.data.set('inst', null);
    $fw.data.set('app', null);

    this._super();

    // make sure preview contorller is initialised
    this.getController('apps.preview.controller');

    $('#list_apps_layout').hide();

    this.hideAll();
    this.doManage(guid, success, fail, is_name, intermediate);
  },

  // see http://twitter.github.com/bootstrap/components.html#breadcrumbs
  updateCrumbs: function(self) {
    console.log('custom apps breadcrumbs');

    var el = $('#' + self.id);
    var navList = el.find('.nav-list');
    var jqEl = $(this);
    // update active status of navlist
    navList.find('li').removeClass('active');
    jqEl.closest('li').addClass('active');

    // udpate breadcrumbs
    var crumbs = [jqEl.text()];
    var header = jqEl.closest('li').prevAll('.nav-header:eq(0)');
    if (header.length > 0) {
      crumbs.unshift(header.text());
    }

    var addCrumbWithDivider = function (text) {
      crumb.append($('<li>').append($('<a>', {
        "href": "#",
        "text": text
      }).on('click', function(e) {
        e.preventDefault();
        $fw.client.tab.apps.listapps.show();
      }))).append($('<span>', {
        "class": "divider",
        "text": "/"
      }));
    };

    // get prefix from select list item in listapps view e.g. 'My Apps'
    var crumb = $('#' + self.breadcrumbId).empty();
    var prefixHeaderCrumb = $('.listapps_nav_list li.active').prevAll('.nav-header').first();
    if (prefixHeaderCrumb.length > 0) {
      addCrumbWithDivider(prefixHeaderCrumb.text().trim());
    }

    var prefixCrumb = $('.listapps_nav_list li.active a');
    // assemble start of breadcrumb
    var preview_buttons = $('#' + self.breadcrumbId).find('.preview_buttons').detach(); // detach is important here
    addCrumbWithDivider(prefixCrumb.text().trim());

    // add placeholder item for app title
    crumb.append($('<li>', {
      "class": "app_title_placeholder"
    })).append($('<span>', {
      "class": "divider",
      "text": "/"
    }));

    for (var ci = 0, cl = crumbs.length; ci < cl; ci += 1) {
      var ct = crumbs[ci];

      if (ci !== (cl - 1)) {
        // non-final crumb
        crumb.append($('<li>', {
          //"href": "#",
          "text": ct
        })).append($('<span>', {
          "class": "divider",
          "text": "/"
        }));
      } else {
        // final crumb
        crumb.append($('<li>', {
          "class": "active",
          "text": ct
        }));
      }
    }

    crumb.append(preview_buttons);
    self.updateAppTitleInCrumbs();
  },

  updateAppTitleInCrumbs: function () {
    var inst = $fw.data.get('inst');
    if (inst != null) {
      var appTitle = inst.title;
      $('.app_title_placeholder').text(appTitle);
    }
  },

  /*
   *
   */
  doManage: function(guid, success, fail, is_name, intermediate) {
    this.doShowManage(guid, success, fail, is_name, intermediate);
  },

  doShowManage: function(guid, success, fail, is_name, intermediate) {
    var self = this;

    console.log('app.doManage');
    // FIXME: handle going in here from recent apps list

    // if (!$('#apps_tab').parent().hasClass('ui-state-active')) {
    //   //this function is called from home page, need to set state information to show the manage apps view
    //   this.setStateForAppView(guid);

    //   // click apps tab to trigger state restoration
    //   $('#apps_tab').click();
    // }
    var is_app_name = false;
    if (typeof is_name !== "undefined" && is_name) {
      is_app_name = true;
    }
    $fw.client.model.App.read(guid, function(result) {
      console.log('app read result > ' + JSON.stringify(result));
      if (result.app && result.inst) {
        var inst = result.inst;
        
        // set current app details
        self.setSelectedApp(result.app, inst);

        // update breadcrumb with app title, and finally show it
        self.updateAppTitleInCrumbs();

        // show manage apps layout
        $('#manage_apps_layout').show();
        
        // necessary to update the details section with this apps details to ensure any 'udpate' calls outside of the
        // details screen work e.g. push notifications save, preview device save
        self.getController('apps.details.controller').updateDetails();

        // Reload preview
        $fw.client.tab.apps.manageapps.getController('apps.preview.controller').show();


        var postFn = function() {
            var template_mode = $fw.data.get('template_mode');
            if (template_mode) {
              // FIXME: breadcrumb when in template app should be 'Templates'
              // make sure correct button is active on list apps layout
              // $('#list_apps_buttons li').removeClass('ui-state-active');
              // $('#list_apps_button_templates').addClass('ui-state-active');
              // update state information
              $fw.state.set('apps_tab_options', 'selected', 'template');
              $fw.state.set('template', 'id', inst.guid);
              $fw.client.tab.apps.listapps.getController('apps.templates.controller').applyPreRestrictions();
            } else {
              // make sure correct button is active on list apps layout
              // $('#list_apps_buttons li').removeClass('ui-state-active');
              // $('#list_apps_button_my_apps').addClass('ui-state-active');
              // update state information
              $fw.state.set('apps_tab_options', 'selected', 'app');
              $fw.state.set('app', 'id', inst.guid);
              $fw.client.tab.apps.listapps.getController('apps.templates.controller').removePreRestrictions();
            }

            // reclick the currenlty active controller item, if it's visible,
            // otherwise click the first visible item
            var itemToClick = $('.manageapps_nav_list li.active:visible a');
            if (itemToClick.length === 0) {
              itemToClick = $('.manageapps_nav_list li:visible a:eq(0)');
            }
            itemToClick.trigger('click');

            // Check if the current app is a scm based app, and if crud operations are allowed
            var is_scm = self.isScmApp();
            var scmCrudEnabled = $fw.getClientProp('scmCrudEnabled') == "true";
            console.log('scmCrudEnabled = ' + scmCrudEnabled);
            if (is_scm) {
              console.log('scm based app, applying restrictions');
              self.enableScmApp(scmCrudEnabled);
            } else {
              console.log('non-scm based app, removing restrictions');
              self.disableScmApp();
            }

            // Check if the current app is a Node.js one
            if (self.isNodeJsApp()) {
              console.log('Node.js based app, applying changes');
              self.enableNodejsAppMode();

              // Show Node cloud logo
              $('#cloud_logo').removeClass().addClass('node').unbind().bind('click', function() {
                window.open('http://nodejs.org/', '_blank');
              });
            } else {
              console.log('Rhino based app, applying changes');
              self.enableRhinoAppMode();

              // Show Rhino cloud logo
              $('#cloud_logo').removeClass().addClass('rhino').unbind().bind('click', function() {
                window.open('http://www.mozilla.org/rhino/', '_blank');
              });
            }

            if (template_mode) {
              $fw.client.tab.apps.listapps.getController('apps.templates.controller').applyPostRestrictions();
            } else {
              $fw.client.tab.apps.listapps.getController('apps.templates.controller').removePostRestrictions();
            }

            if ($.isFunction(success)) {
              success();
            }
          };
        if ($.isFunction(intermediate)) {
          intermediate(postFn);
        } else {
          postFn();
        }
      } else {
        // TODO: call a failure callback, if specified
        console.log('error reading app > ' + result.message, 'ERROR');
        if ($.isFunction(fail)) {
          fail.call();
        }
      }
    }, function() {
      console.log('app.doManage:ERROR');
      if ($.isFunction(fail)) {
        fail.call();
      }
    }, is_app_name);
  },

  setSelectedApp: function(app, inst) {
    console.log('changing selected app');

    $fw.data.set('app', app);
    $fw.data.set('inst', inst);

    if (this.controllers != null) {
      for (var key in this.controllers) {
        this.controllers[key].reset();
      }
    }
  },

  isScmApp: function() {
    var isScm = false,
      app = $fw.data.get('app'),
      inst = $fw.data.get('inst'),
      appConfig = 'undefined' !== typeof app.config ? app.config : {};

    if (('undefined' !== typeof appConfig.scm) && ('EXTERNAL' === app.config.scm.type)) {
      isScm = true;
    } else {
      // TODO: If required, can lookup an app that isn't open in the studio.
    }

    return isScm;
  },

  enableScmApp: function(scmCrudEnabled) {
    $fw.data.set('scm_mode', true);

    if (!scmCrudEnabled) {
      var files_div = $('#accordion_item_editor').next();
      var temp = $('<p>').addClass('editor_disabled_p').text($fw.client.lang.getLangString('scm_editor_disabled'));
      files_div.children().hide().end().append(temp);
    }

    $('#new_app_scmurl').closest('.control-group').show();
    $('#new_app_scmbranch').closest('.control-group').show();
    $('#postreceiveurl').closest('.control-group').show();
    // always hid git private key as it's deprecated
    $('#new_app_scmkey').closest('.control-group').hide();

    $('#scm_trigger_button').show();
    $('#scm_trigger_button_editor').show();
  },

  disableScmApp: function() {
    $fw.data.set('scm_mode', false);

    $('.editor_disabled_p').remove();
    $('#accordion_item_editor').next().children().show();
    $('#new_app_scmkey').closest('.control-group').hide();
    $('#new_app_scmurl').closest('.control-group').hide();
    $('#new_app_scmbranch').closest('.control-group').hide();
    $('#postreceiveurl').closest('.control-group').hide();
    $('#scm_trigger_button').hide();
    $('#scm_trigger_button_editor').hide();
  },

  isNodeJsApp: function() {
    var isNodeJs = false;

    var inst = $fw.data.get('inst');
    if (null != inst) {
      isNodeJs = inst.nodejs === 'true';
    }

    return isNodeJs;
  },

  enableRhinoAppMode: function() {
    $('.nodejs_mode').hide(); // hide nodejs only stuff
    $('.rhino_mode').show(); // show rhino only stuff

    // Change some "next" steps in wizards
    $('input[name=app_publish_ipad_provisioning_radio]:first').attr('next', 'app_publish_ipad_versions');
    $('input[name=app_publish_iphone_provisioning_radio]:first').attr('next', 'app_publish_iphone_versions');
  },

  enableNodejsAppMode: function() {
    $('.rhino_mode').hide(); // hide rhino only stuff
    $('.nodejs_mode').show(); // show nodejs only stuff

    // Change some "next" steps in wizards
    $('input[name=app_publish_ipad_provisioning_radio]:first').attr('next', 'app_publish_ipad_deploying_env');
    $('input[name=app_publish_iphone_provisioning_radio]:first').attr('next', 'app_publish_iphone_deploying_env');
  },

  /*
   * Gets the scm trigger url for the current app
   * e.g. /box/srv/1.1/pub/app/xzEWsLxpEp60ED-PxM8Zlc0B/refresh
   */
  getTriggerUrl: function() {
    var app = $fw.data.get('app'),
      url;

    url = Constants.TRIGGER_SCM_URL.replace('<GUID>', app.guid);

    return url;
  },

  /*
   * Trigger an update or pull from the scm for the currently open app
   */
  triggerScm: function(success, fail, always) {
    var url;

    url = this.getTriggerUrl();
    $fw.client.dialog.info.flash($fw.client.lang.getLangString('scm_update_started'), 2500);
    $fw.server.post(url, {}, function(result) {
      if (result.cacheKey) {
        var clone_task = new ASyncServerTask({
          cacheKey: result.cacheKey
        }, {
          updateInterval: Properties.cache_lookup_interval,
          maxTime: Properties.cache_lookup_timeout,
          // 5 minutes
          maxRetries: Properties.cache_lookup_retries,
          timeout: function(res) {
            console.log('timeout error > ' + JSON.stringify(res));
            $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error'));
            // TODO: internationalise during refactor
            // ALERT THE USER OF TIMEOUT proto.Wizard.jumpToStep(clone_app_wizard, 1, 'Clone timed out');
            if ($.isFunction(fail)) {
              fail();
            }
          },
          update: function(res) {
            for (var i = 0; i < res.log.length; i++) {
              console.log(res.log[i]);
            }
          },
          complete: function(res) {
            console.log('SCM refresh successful > ' + JSON.stringify(res));
            $fw.client.dialog.info.flash($fw.client.lang.getLangString('scm_updated'), 2000);

            if ($.isFunction(success)) {
              success();
            }
          },
          error: function(res) {
            console.log('clone error > ' + JSON.stringify(res));
            $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error') + "<br /> Error Message:" + res.error);
            if ($.isFunction(fail)) {
              fail();
            }
          },
          retriesLimit: function() {
            console.log('retriesLimit exceeded: ' + Properties.cache_lookup_retries);
            $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error'));
            if ($.isFunction(fail)) {
              fail();
            }
          },
          end: function() {
            if ($.isFunction(always)) {
              always();
            }
          }
        });
        clone_task.run();
      } else {
        console.log('No CacheKey in response > ' + JSON.stringify(result));
        $fw.client.dialog.error($fw.client.lang.getLangString('scm_trigger_error'));
        if ($.isFunction(fail)) {
          fail();
        }
      }
    });
  }
});