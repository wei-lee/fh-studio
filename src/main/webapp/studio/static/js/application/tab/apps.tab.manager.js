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

  enableRhinoDomain: function() {
    // disable nodejs stuff and enable rhino stuff at 'domain' level i.e. some apps be still be nodejs enabled inside a rhino domain

    // remove generate app from create app wizard
    $('#create_app_generator_container').hide().remove();
  },

  enableNodejsDomain: function() {
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

  updateCrumbs: function(self) {
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

    var addCrumbWithDivider = function(text) {
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

    var preview_buttons = $('#' + self.breadcrumbId).find('.preview_buttons').detach(); // detach is important here
    // get prefix from select list item in listapps view e.g. 'My Apps'
    var crumb = $('#' + self.breadcrumbId).empty();
    var prefixHeaderCrumb = $('.listapps_nav_list li.active').prevAll('.nav-header').first();
    if (prefixHeaderCrumb.length > 0) {
      addCrumbWithDivider(prefixHeaderCrumb.text().trim());
    }

    var prefixCrumb = $('.listapps_nav_list li.active a');
    // assemble start of breadcrumb
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

  updateAppTitleInCrumbs: function() {
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

  toggleMigrationView: function(hide) {
    var nav_items = $("#manage_apps_layout .manageapps_nav_list li a:not([data-controller='apps.migrate.controller'])").parents('li');
    var sections = $("#manage_apps_layout .manageapps_nav_list .nav-header").not(":contains('Overview')");
    if (hide) {
      // Hide sidenav items, except the migration one
      nav_items.addClass('display_none');
      sections.addClass('display_none');
    } else {
      nav_items.removeClass('display_none');
      sections.removeClass('display_none');
    }

    // If preview visible, hide
    var preview = $('#app_preview');
    if (preview.is(':visible')) {
      preview.remove();
      $('#app_content').removeClass('span7').addClass('span10');
    }
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
      if (result.app && result.inst) {
        var inst = result.inst;

        // set current app details
        self.setSelectedApp(result.app, inst);

        // update breadcrumb with app title, and finally show it
        self.updateAppTitleInCrumbs();

        var fh3_migrated = result.app.migrated;

        // If FH3 Migrated App, hide
        if (fh3_migrated) {
          self.toggleMigrationView(true);
        } else {
          self.toggleMigrationView(false);
        }

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
            // TODO CHECK I can remove this call and method
            self.enableNodejsAppMode();

            // Show Node cloud logo
            $('#cloud_logo').removeClass().addClass('node').unbind().bind('click', function() {
              window.open('http://nodejs.org/', '_blank');
            });
          } else {
            console.log('Rhino based app, applying changes');
            // TODO CHECK I can remove this call and method
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
  },

  enableNodejsAppMode: function() {
    $('.rhino_mode').hide(); // hide rhino only stuff
    $('.nodejs_mode').show(); // show nodejs only stuff
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
  triggerScm: function(success, fail, always, progress_ui) {
    var url;

    url = this.getTriggerUrl();
    //$fw.client.dialog.info.flash($fw.client.lang.getLangString('scm_update_started'), 2500);
    var gitPullProgressContainer = progress_ui || $('.git_pull_progress').clone();
    if (!progress_ui) {
      $(gitPullProgressContainer).modal({
        backdrop: "static",
        keyboard: false
      });
    }
    var progress = 0;
    var self = this;
    self.resetProgress(gitPullProgressContainer);

    $fw.server.post(url, {}, function(result) {
      if (result.cacheKey) {
        progress = 20;
        self.updateProgress(progress, gitPullProgressContainer);
        self.updateProgressLog("Git pull started...", gitPullProgressContainer);
        var clone_task = new ASyncServerTask({
          cacheKey: result.cacheKey
        }, {
          updateInterval: Properties.cache_lookup_interval,
          maxTime: Properties.cache_lookup_timeout,
          // 5 minutes
          maxRetries: Properties.cache_lookup_retries,
          timeout: function(res) {
            console.log('timeout error > ' + JSON.stringify(res));
            self.updateProgressLog("request timed out.", gitPullProgressContainer);
            if ($.isFunction(fail)) {
              fail();
            }
            self.updateProgress(100, gitPullProgressContainer);
            self.triggerScmFailed(gitPullProgressContainer);
          },
          update: function(res) {
            console.log('scm update > ' + JSON.stringify(res));
            for (var i = 0; i < res.log.length; i++) {
              console.log(res.log[i]);
            }
            if (res.progress) {
              progress = res.progress;
            } else {
              if (res.log && res.log.length > 0) {
                progress += 2;
              }
            }

            self.updateProgressLog(res.log, gitPullProgressContainer);
            self.updateProgress(progress, gitPullProgressContainer);
          },
          complete: function(res) {
            console.log('scm update successful > ' + JSON.stringify(res));
            if ($.isFunction(success)) {
              success();
            }
            self.updateProgress(100, gitPullProgressContainer);
            self.triggerScmFinished(gitPullProgressContainer);
          },
          error: function(res) {
            console.log('scm error > ' + JSON.stringify(res));
            self.updateProgressLog(res.error, gitPullProgressContainer);
            if ($.isFunction(fail)) {
              fail();
            }
            self.updateProgress(100, gitPullProgressContainer);
            self.triggerScmFailed(gitPullProgressContainer);
          },
          retriesLimit: function() {
            console.log('retriesLimit exceeded: ' + Properties.cache_lookup_retries);
            if ($.isFunction(fail)) {
              fail();
            }
            self.updateProgress(100, gitPullProgressContainer);
            self.triggerScmFailed(gitPullProgressContainer);
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
        self.updateProgressLog($fw.client.lang.getLangString('scm_trigger_error'), gitPullProgressContainer);
        self.updateProgress(100, gitPullProgressContainer);
        self.triggerScmFailed(gitPullProgressContainer);
        if ($.isFunction(fail)) {
          fail();
        }
      }
    });
  },

  resetProgress: function(sub_container) {
    if ($(sub_container).is(".progress-step")) {
      proto.ProgressDialog.resetBarAndLog(sub_container);
    } else {
      $('.progress', sub_container).removeClass('progress-danger progress-success').addClass('progress-striped');
    }

  },

  updateProgress: function(value, sub_container) {
    if ($(sub_container).is(".progress-step")) {
      proto.ProgressDialog.setProgress(sub_container, value);
    } else {
      var progress_el = $('.progress', sub_container);
      var bar = $('.bar', progress_el);
      bar.css('width', value + '%');
    }
  },

  updateProgressLog: function(log, sub_container) {
    // allow for string or array of strings
    log = 'string' === typeof log ? [log] : log;
    if ($(sub_container).is(".progress-step")) {
      for (var i = 0; i < log.length; i++) {
        proto.ProgressDialog.append(sub_container, log[i]);
      }
    } else {
      var progress_log_el = $('textarea', sub_container);

      if (log.length > 0) {
        var current_log = progress_log_el.val(),
          log_value;
        if (current_log === '') {
          log_value = current_log + log.join('\n');
        } else {
          log_value = current_log + '\n' + log.join('\n');
        }
        progress_log_el.val(log_value);
        progress_log_el.scrollTop('10000000');
      }
    }

  },

  triggerScmFinished: function(sub_container) {
    if ($(sub_container).is(".progress-step")) {
      //do nothing
    } else {
      $('.progress', sub_container).removeClass('progress-striped').addClass('progress-success');
      this.showScmCloseBtn(sub_container);
      setTimeout(function() {
        $('.close', sub_container).trigger("click");
      }, 1000);
    }
  },

  triggerScmFailed: function(sub_container) {
    if ($(sub_container).is(".progress-step")) {
      //do nothing
    } else {
      $('.progress', sub_container).removeClass('progress-striped').addClass('progress-danger');
      this.showScmCloseBtn(sub_container);
    }
  },

  showScmCloseBtn: function(sub_container) {
    if ($(sub_container).is(".progress-step")) {
      //do nothing
    } else {
      $('.close', sub_container).removeClass("hidden").bind("click", function(e) {
        e.preventDefault();
        //$(sub_container).on("hidden", $(sub_container).remove());
        $(sub_container).modal('hide');
        $(sub_container).on("hidden", function() {
          setTimeout(function() {
            $(sub_container).remove();
          }, 1000);
        });
      });
    }
  }

});