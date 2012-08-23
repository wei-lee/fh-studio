
analytics.AnalyticsIntegration = Class.extend({

  config_general : {
    'dashboardDocs' : true    
  },
  
  config_button : {
    'manage_details_update_button' : 'Manage App - Update Details',
    'user_info_logout' : 'Top Nav Bar - Logout',
    'user_info_help' : 'Top Nav Bar - Help'
  },

  config_div : {
    'home_create_new_app_btn' : 'Dashboard - Create App'
  },
  
  config_tabs: {
    'main_tabs_buttons' : 'Main Tabs'
  },
  
  config_accordion : {
    'manage_apps_accordion' : 'Manage Apps Accordion',
    'account_accordion': 'Account Accordion'
  },
  
  config_wizard : {
    'create_app_wizard': 'Wiz:Create App',
    'import_app_wizard': 'Wiz:Import App',
    'apple_getstarted_wizard': 'Wiz:Apple Get Started',
    'apple_key_wizard': 'Wiz:Apple Key',
    'apple_cert_wizard': 'Wiz:Apple Cert',
    'iphone_export_wizard': 'Wiz:iPhone Export',
    'iphone_publish_wizard': 'Wiz:iPhone Publish',
    'ipad_export_wizard': 'Wiz:iPad Export',
    'ipad_publish_wizard': 'Wiz:iPad Publish',
    'android_getstarted_wizard': 'Wiz:Android Get Started',
    'android_key_wizard': 'Wiz:Android Key',
    'android_export_wizard': 'Wiz:Android Export',
    'android_publish_wizard': 'Wiz:Android Publish',
    'android_cert_wizard': 'Wiz:Android Cert',
    'windowsphone7_export_wizard': 'Wiz:Windows Phone Export'
  },

  doIntegration: function() {
    this.doDashboardDocs();
    this.doButtons();
    this.doDivs();    
  },

  doDashboardDocs: function() {
    if( this.config_general.dashboardDocs ) {
      $('.doc_links').bind('click', function(evt) {
        var docName = this.innerText;
        $fw.analytics.trackEvent({id:'Dashboard - View Documentation', props:{'Document Name':docName}});
      });
    }
  },
  
  doButtons: function() {
    var that = this;
    $('button').bind('click', function(evt) {
      var elementId = this.id;
      if( that.config_button[elementId] ) {
        var eventId = that.config_button[elementId];	
        var eventProps = $fw.data.getDataStore();
        $fw.analytics.trackEvent({id:eventId, props:eventProps});
      }
    });
  },
  
  doDivs: function() {
    var that = this;
    $('div').bind('click', function(evt) {
      var elementId = this.id;
      if( that.config_div[elementId] ) {
        var eventId = that.config_div[elementId]; 
        var eventProps = $fw.data.getDataStore();
        $fw.analytics.trackEvent({id:eventId, props:eventProps});
      }
    });
  },
  
  doTabs: function (tabs_parent) {
    var that = this;
    
    var tabs = tabs_parent.find('.ui-tabs-nav');
    var elementId = tabs.attr('id');
    if( that.config_tabs[elementId] ) {
      
      tabs.find('li a').bind('click', function(evt) {
        var tabItem = $(this);
        var temp_tabs = tabItem.parents('.ui-tabs-nav');
        var tabId = temp_tabs.attr('id');

        var tabItemText = tabItem.text();

        var eventId = that.config_tabs[tabId]; 
        //var eventProps = $fw.data.getDataStore();
        var eventProps = {};
        eventProps["Tab Item"] = tabItemText;

        $fw.analytics.trackEvent({id:eventId, props:eventProps});
      });      
    }
  },
  
  doAccordion: function(accordion) {
    var that = this;
    var elementId = accordion.attr('id');
    if( that.config_accordion[elementId] ) {
      accordion.find('li').bind('click', function(evt) {
        var accordionItem = $(this);
        var accordion = accordionItem.parents('.ui-accordion');
        var accordionId = accordion.attr('id');

        var accordionItemText = accordionItem.find('a').text();
        var accordionItemParentText = accordionItem.parent().parent().prev().find('a').text();
        var eventPropText = (accordionItemParentText ? accordionItemParentText + ' - ' : '') + accordionItemText;

        var eventId = that.config_accordion[accordionId]; 
        //var eventProps = $fw.data.getDataStore();
        var eventProps = {};
        eventProps["Accordion Item"] = eventPropText;

        $fw.analytics.trackEvent({id:eventId, props:eventProps});
      });      
    }
  },
  
  doWizard: function (wizard_id, jq_overrides) {
    var that = this;
    
    if( that.config_wizard[wizard_id] ) {
      // kick off an event straight away for the wizard being started
      var eventPropText = "start";
      var eventId = that.config_wizard[wizard_id] + ' - ' + eventPropText; 
      var eventProps = {};

      $fw.analytics.trackEvent({id:eventId, props:eventProps});
      
      // bind callbacks for cancel, finish and next
      var orig_cancel = jq_overrides.cancel;
      jq_overrides.cancel = function () {
        var eventPropText = "cancelled";
        var eventId = that.config_wizard[wizard_id] + ' - ' + eventPropText; 
        var eventProps = {};
        eventProps.data = proto.Wizard.getAllData($(this));
        $fw.analytics.trackEvent({id:eventId, props:eventProps});
        
        if ($.isFunction(orig_cancel)) {
          orig_cancel.call(this);
        }
      };
      var orig_finish = jq_overrides.finish;
      jq_overrides.finish = function () {
        var eventPropText = "finished";
        var eventId = that.config_wizard[wizard_id] + ' - ' + eventPropText; 
        var eventProps = {};
        eventProps.data = proto.Wizard.getAllData($(this));
        $fw.analytics.trackEvent({id:eventId, props:eventProps});
        
        if ($.isFunction(orig_finish)) {
          orig_finish.call(this);
        }
      };
      
      jq_overrides.next = function (event, args) {
        var next_step = args[0];
        if (next_step.attr('track') !== 'no') {
          var eventPropText = next_step.attr('id'); //next_step.attr('jwtitle');
          var eventId = that.config_wizard[wizard_id] + ' - ' + eventPropText; 
          var eventProps = {};
          eventProps.data = proto.Wizard.getAllData($(this));
          $fw.analytics.trackEvent({id:eventId, props:eventProps});
        }
      };
    }
  }
});