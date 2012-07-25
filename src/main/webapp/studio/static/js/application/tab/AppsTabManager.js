application.AppsTabManager = application.TabManager.extend({
  name: 'apps',
  mode_buttons: null,
  accordion: null,

  init: function(opts) {
    this._super(opts);
  },

  doReset: $.noop,

  // overwrite the breadcrumb function as it works a little differently for the apps tab
  constructBreadcrumbsArray: function() {
    var outer_layout = this.tab_content.find('#list_apps_layout');
    var b1 = outer_layout.find('#list_apps_buttons li.ui-state-active a');
    var crumbs = [{
      text: b1.text(),
      callback: function() {
        $fw_manager.client.tab.apps.showListApps();
        b1.trigger('click');
      }
    }];
    if (!outer_layout.is(':visible')) {
      var b2 = $fw_manager.data.get('inst').title;
      var accordion = this.tab_content.find('.ui-layout-west .ui-accordion');
      var b3 = accordion.find('h3.ui-state-active');
      var b4 = accordion.find('.ui-accordion-content-active .ui-state-active');
      crumbs.push({
        text: b2,
        callback: function() {
          var first_item = $(accordion.find('.ui-accordion-header')[0]);
          if (!first_item.is('.ui-state-active')) {
            first_item.trigger('click');
          } else {
            accordion.find('.ui-accordion-content-active .ui-menu li:first-child a').trigger('click');
          }
        }
      });
      crumbs.push({
        text: b3.text(),
        callback: function() {
          accordion.find('.ui-accordion-content-active .ui-menu li:first-child a').trigger('click');
        }
      });
      crumbs.push({
        text: b4.text()
      });
    }
    return crumbs;
  },

  doPreShow: function() {},

  doPreInit: function() {
    var apps_search;

    $('#list_apps_layout').hide();
    $('#manage_apps_layout').hide();

    list_apps_buttons = $('#list_apps_buttons');
    var search_fn = function() {
        var query = apps_search.val();
        // Only do the search if a query was entered
        if (query.length > 0) {
          // and if the query doesn't match the placeholder
          if (query !== apps_search.attr('placeholder')) {
            $fw_manager.client.app.doSearch(query);
          }
        }
        // otherwise just show all apps
        else {
          list_apps_buttons.find('#list_apps_button_my_apps').trigger('click');
        }
        };
    apps_search = $('#apps_search').bind('keyup', function(e) {
      // only execute if 'enter' key was pressed
      if (e.keyCode == 13) {
        e.preventDefault();
        search_fn();
        return false;
      }
    });
    $('#apps_search_form span').bind('click', search_fn);
    // apply placeholder plugin
    apps_search.placeholder({
      className: 'placeholder'
    });

    function changeButtonState(button) {
      $fw_manager.state.set('apps_tab_options', 'selected', button.attr('id'));

      // highlight active button
      $('#list_apps_buttons li').removeClass('ui-state-active');
      button.addClass('ui-state-active');
    }

    list_apps_buttons.find('#list_apps_button_my_apps').addClass('ui-state-active').bind('click', $.throttle(Properties.click_throttle_timeout, function() {
      changeButtonState($(this));
      $fw_manager.app.showAndLoadGrid('my_apps');
    }));
    list_apps_buttons.find('#list_apps_button_templates').bind('click', $.throttle(Properties.click_throttle_timeout, function() {
      changeButtonState($(this));

      // Remove text from search box
      $('#apps_search').val('').trigger('blur');

      $fw_manager.app.showAndLoadGrid('templates');
    }));
    list_apps_buttons.find('#list_apps_button_create').bind('click', $fw_manager.client.app.doCreate);
    list_apps_buttons.find('#list_apps_button_import').bind('click', $fw_manager.client.app.doImport);
    list_apps_buttons.find('#list_apps_button_generate_app').bind('click', function() {
      changeButtonState($(this));
      $fw_manager.client.app.generate_app_controller.show();
    });
    apps_layout = proto.Layout.load($('#apps_layout'), {
      east__initClosed: true,
      west__initClosed: true
    });
  },

  doPostInit: function() {},

  disableItems: function() {
    var app_generation_enabled = $fw_manager.getClientProp('app-generation-enabled') == "true";
    var nodejs_domain = $fw_manager.getClientProp('nodejsEnabled') == "true";
    if (!app_generation_enabled || !nodejs_domain) {
      $('#list_apps_button_generate_app').hide().remove();
      $('#create_app_generator_container').hide().remove();
    }
  },

  doPostShow: function() {
    this.disableItems();

    var that = this;
    if (null === list_apps_layout && null === manage_apps_layout) {
      // Check if we need to force a state
      // TODO: allow for UI structural changes
      var defval = 'list_apps_button_my_apps';
      var selected = $fw_manager.state.get('apps_tab_options', 'selected', defval);
      var id;
      if (selected === 'app') {
        // An app was open last, so what's the id?
        id = $fw_manager.state.get('app', 'id', null);
        if (null !== id) {
          // Have an app id, lets try open it for managing
          $fw_manager.client.app.doManage(id, $.noop, function() {
            // if it fails (permission issue or app doesn't exist), show apps list
            that.showListApps();
            $('li#' + defval).trigger('click');
          });
        } else {
          // setup the list_apps_layout 
          this.showListApps();
          $('li#' + defval).trigger('click');
        }
      } else if (selected === 'template') {
        id = $fw_manager.state.get('template', 'id', null);
        if (null !== id) {
          // Have an app id, lets try open it for managing
          $fw_manager.client.template.doView(id);
          // TODO: need a failure callback if template cant be shown
        } else {
          // setup the list_apps_layout 
          this.showListApps();
          $('li#' + defval).trigger('click');
        }
      } else {
        // setup the list_apps_layout 
        this.showListApps();
        $('li#' + selected).trigger('click');
      }
    }
    apps_layout.resizeAll();
    if (null !== list_apps_layout) {
      list_apps_layout.resizeAll();
    }
    if (null !== manage_apps_layout) {
      log('resizing manage_apps layout as part of tab postShow');
      manage_apps_layout.resizeAll();
    }
  },

  /*
   * Initialise any components needed to show the manage screen for the specified app guid
   */
  showManageApps: function(callback) {
    if (null === this.mode_buttons) {
      this.mode_buttons = $('#mode_buttons').buttonset().find('#radio1').click(function() {
        log('basic clicked');
      }).end().find('#radio2').click(function() {
        log('advanced clicked');
      });
    }
    $fw_manager.app.showAndHide('#manage_apps_layout', '#list_apps_layout');
    if (manage_apps_layout === null) {
      manage_apps_layout = proto.Layout.load($('#manage_apps_layout'), {
        fxName: 'none',
        west__resizable: true,
        west__closable: true,
        west__slidable: false,
        west__spacing_open: 16,
        west__spacing_closed: 16,
        west__minSize: 150,
        center__resizable: true,
        center__minWidth: 250,
        center__onresize: function(pane, $Pane, pane_state) {
          proto.Accordion.resizeVisible();
          $fw.client.editor.resize();
        },
        east__resizable: true,
        east__closable: true,
        east__slidable: false,
        east__spacing_open: 16,
        east__spacing_closed: 16,
        east__minSize: 100,
        north__initClosed: true,
        south__initClosed: true,
        togglerLength_open: 16,
        togglerLength_closed: 16
      });
    }
    apps_layout.resizeAll();
    manage_apps_layout.resizeAll();

    var accordion_name = this.name + '_accordion',
        manager_name = js_util.capitalise(this.name) + 'AccordionManager';
    if (this.accordion === null) {
      if ('undefined' !== typeof application[manager_name]) {
        this.accordion = new application[manager_name](accordion_name);
      } else {
        this.accordion = new application.AccordionManager(accordion_name);
      }
      this.accordion.show();
    } else {
      this.accordion.reset();
    }
    // Reload preview
    $fw_manager.client.preview.show();

    if ($.isFunction(callback)) {
      callback();
    }
  },

  // TODO: all show list_app_layout functionality should be build out separately from tab initialisation code
  showListApps: function() {
    $fw_manager.app.showAndHide('#list_apps_layout', '#manage_apps_layout');
    if (null === list_apps_layout) {
      list_apps_layout = proto.Layout.load($('#list_apps_layout'), {
        center__onresize: function(pane, $Pane, pane_state) {
          proto.Grid.resizeVisible();
        },
        east__initClosed: true,
        north__initClosed: true,
        south__initClosed: true
      });
    }
  }
});