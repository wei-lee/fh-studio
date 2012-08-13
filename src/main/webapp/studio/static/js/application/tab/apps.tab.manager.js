var Apps = Apps || {};
Apps.Tab = Apps.Tab || {};

Apps.Tab.Manager = Tab.Manager.extend({

  init: function() {
    this.initFn = _.once(this.showListapps);
  },

  show: function() {
    // purposely overwrite super's show and don't call it
    // this tab manager is made up of 2 tab managers
    // - list.apps.tab.manager
    // - manage.apps.tab.manager
    // TODO: state restoration
    this.initFn();
  },

  showListapps: function() {
    console.log('showListapps');
    $('#manage_apps_layout').hide();
    $('#list_apps_layout').show();
    if ('undefined' === typeof this.listapps) {
      this.listapps = new ListappsTabManager();
    }
    this.listapps.show();
  },

  showManageapps: function(guid, success, fail, is_name, intermediate) {
    $('#list_apps_layout').hide();
    $('#manage_apps_layout').show();
    if ('undefined' === typeof this.manageapps) {
      this.manageapps = new ManageappsTabManager();
    }
    this.manageapps.show(guid, success, fail, is_name, intermediate);
  }
});

ListappsTabManager = Tab.Manager.extend({
  id: 'list_apps_layout',
  breadcrumbId: 'apps_breadcrumb',

  init: function() {
    this._super();
  },

  show: function() {
    this._super();

    $('#manage_apps_layout').hide();
    $('#list_apps_layout').show();
  }

});

ManageappsTabManager = Tab.Manager.extend({
  id: 'manage_apps_layout',

  init: function() {
    this._super();
  },

  show: function(guid, success, fail, is_name, intermediate) {
    this._super();

    $('#list_apps_layout').hide();
    $('#manage_apps_layout').show();

    this.doManage(guid, success, fail, is_name, intermediate);
  },

  // see http://twitter.github.com/bootstrap/components.html#breadcrumbs
  updateCrumbs: function(self) {
    console.log('custom apps breadcrumbs');
    var prefixCrumb = $('.listapps_nav_list li.active a');

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

    var crumb = $('#apps_breadcrumb').empty().append($('<li>').append($('<a>', {
      "href": "#",
      "text": prefixCrumb.text().trim()
    }).on('click', function(e) {
      e.preventDefault();
      $fw.client.tab.apps.showListapps();
    })).append($('<span>', {
      "class": "divider",
      "text": "/"
    })));

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
  },
  
  /*
   *
   */
  doManage: function (guid, success, fail, is_name, intermediate) {
    $fw.data.set('template_mode', false);
    this.doShowManage(guid, success, fail, is_name, intermediate);
  },
  
  doShowManage: function (guid, success, fail, is_name, intermediate) {
    var self = this;

    console.log('app.doManage');
    if (!$('#apps_tab').parent().hasClass('ui-state-active')) {
      //this function is called from home page, need to set state information to show the manage apps view
      this.setStateForAppView(guid);
      
      // click apps tab to trigger state restoration
      $('#apps_tab').click();
    }
    $fw.app.resetApp();
    var is_app_name = false;
    if (typeof is_name !== "undefined" && is_name) {
      is_app_name = true;
    }
    $fw.client.model.App.read(guid, function (result) {
      console.log('app read result > ' + JSON.stringify(result));
      if (result.app && result.inst) {
        var inst = result.inst;
        
        self.updateAppData(result.app, inst);
        self.updateDetails();

        // Reload preview
        $fw_manager.client.preview.show();
        
        var postFn = function() {
          var template_mode = $fw.data.get('template_mode');
          if (template_mode) {
            // make sure correct button is active on list apps layout
            $('#list_apps_buttons li').removeClass('ui-state-active');
            $('#list_apps_button_templates').addClass('ui-state-active');
            // update state information
            $fw.state.set('apps_tab_options', 'selected', 'template');
            $fw.state.set('template', 'id', inst.guid);
            $fw.client.template.applyPreRestrictions();
          }
          else {
            // make sure correct button is active on list apps layout
            $('#list_apps_buttons li').removeClass('ui-state-active');
            $('#list_apps_button_my_apps').addClass('ui-state-active');
            // update state information
            $fw.state.set('apps_tab_options', 'selected', 'app');
            $fw.state.set('app', 'id', inst.guid);
            $fw.client.template.removePreRestrictions();
          }
          
          // Check if the current app is a scm based app, and if crud operations are allowed
          var is_scm = self.isScmApp();
          var scmCrudEnabled = $fw.getClientProp('scmCrudEnabled') == "true";
          console.log('scmCrudEnabled = ' + scmCrudEnabled);
          if (is_scm) {
            console.log('scm based app, applying restrictions');
            self.enableScmApp(scmCrudEnabled);
          }
          else {
            console.log('non-scm based app, removing restrictions');
            self.disableScmApp();
          }

          // Check if the current app is a Node.js one
          if (self.isNodeJsApp()) {
            console.log('Node.js based app, applying changes');
            
            // Show Node cloud logo
            $('#cloud_logo').removeClass().addClass('node').unbind().bind('click', function(){
              window.open('http://nodejs.org/', '_blank');
            });
          } else {
            console.log('Rhino based app, applying changes');
            self.disableNodeJsApp();

            // Show Rhino cloud logo
            $('#cloud_logo').removeClass().addClass('rhino').unbind().bind('click', function(){
              window.open('http://www.mozilla.org/rhino/', '_blank');
            });
          }
          
          // TODO: what was this doing before?? now it's an infinite loop
          //$fw.client.tab.apps.showManageapps(guid, success);
          if (template_mode) {
            $fw.client.template.applyPostRestrictions();
          }
          else {
            $fw.client.template.removePostRestrictions();
          }
        };
        if($.isFunction(intermediate)) {
          intermediate(postFn);
        } else {
          postFn();
        }
      }
      else {
        // TODO: call a failure callback, if specified
        console.log('error reading app > ' + result.message, 'ERROR');
        if ($.isFunction(fail)) {
          fail.call();
        }
      }
    }, function () {
      console.log('app.doManage:ERROR');
      if ($.isFunction(fail)) {
        fail.call();
      }
    }, is_app_name);
  },
  
  updateAppData: function (app, inst) {
    $fw.data.set('app', app);
    $fw.data.set('inst', inst);
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
  
  isScmApp: function () {
    var isScm = false,
        app = $fw.data.get('app'),
        inst = $fw.data.get('inst'),
        appConfig = 'undefined' !== typeof app.config ? app.config : {};
    
    if (('undefined' !== typeof appConfig.scm) && ('EXTERNAL' === app.config.scm.type)) {
      isScm = true;
    }
    else {
      // TODO: If required, can lookup an app that isn't open in the studio.
    }
    
    return isScm;
  },
  
  enableScmApp: function (scmCrudEnabled) {
    $fw.data.set('scm_mode', true);
    
    if( ! scmCrudEnabled ) {
      var files_div = $('#accordion_item_editor').next();
      var temp = $('<p>').addClass('editor_disabled_p').text($fw.client.lang.getLangString('scm_editor_disabled'));
      files_div.children().hide().end().append(temp);
    }
    
    $('#new_app_scmurl').parent().show();
    $('#new_app_scmkey').parent().show();
    $('#new_app_scmbranch').parent().show();
    $('#postreceiveurl').parent().show();
    $('#scm_trigger_button').show();
    $('#scm_trigger_button_editor').show();
  },
  
  disableScmApp: function () {
    $fw.data.set('scm_mode', false);
    
    $('.editor_disabled_p').remove();
    $('#accordion_item_editor').next().children().show();
    $('#new_app_scmkey').parent().hide();
    $('#new_app_scmurl').parent().hide();
    $('#new_app_scmbranch').parent().hide();
    $('#postreceiveurl').parent().hide();
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

  disableNodeJsApp: function() {
    // FIXME: Fix these ID's
    $('#deploying').hide();
    $('#status').hide();

    // Change some "next" steps in wizards
    $('input[name=app_publish_ipad_provisioning_radio]:first').attr('next', 'app_publish_ipad_versions');
    $('input[name=app_publish_iphone_provisioning_radio]:first').attr('next', 'app_publish_iphone_versions');
  },
  
  /*
   * Gets the post receive url for the current app.
   * e.g. https://apps.feedhenry.com/box/srv/1.1/pub/app/xzEWsLxpEp60ED-PxM8Zlc0B/refresh
   */
  getPostReceiveUrl: function () {
    var postReceiveUrl,
        host;
    
    host = document.location.protocol + '//' + document.location.host;
    postReceiveUrl = host + this.getTriggerUrl();
    
    return postReceiveUrl;
  },
  
  /*
   * Gets the scm trigger url for the current app
   * e.g. /box/srv/1.1/pub/app/xzEWsLxpEp60ED-PxM8Zlc0B/refresh
   */
  getTriggerUrl: function () {
    var app = $fw.data.get('app'),
        url;
    
    url = Constants.TRIGGER_SCM_URL.replace('<GUID>', app.guid);
    
    return url;
  }

});