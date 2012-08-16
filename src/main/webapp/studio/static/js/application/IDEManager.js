var IDEManager = Class.extend({
  
  init: function () {
    this.accordion = new application.AccordionManager();
    this.preview = new application.PreviewManager();
    this.report = new application.ReportManager();
    this.profile = new application.ProfileManager();
    this.keys = new application.controller.Keys();
    this.resource = {
      apple: new application.AppleResourceManager(),
      android: new application.AndroidResourceManager(),
      blackberry: new application.BlackberryResourceManager()
    };
    this.lang = new LangManager();
    this.dialog = new application.DialogManager();
    this.model = new model.ModelManager();
    this.tab = {
      home: new application.HomeTabManager(),
      account: new application.AccountTabManager(),
      reporting: new application.ReportingTabManager(),

      // new 'non-ui-layout' tabs go here
      admin: new Admin.Tab.Manager(),
      apps: new Apps.Tab.Manager()
    };
    this.analytics = new analytics.AnalyticsIntegration();
    this.chart = new application.ChartManager();
        
    // setup callbacks for server calls
    $fw.server.setOpts({
      connectivity_ok: function () {
        $fw.client.dialog.connectivity.hide();
      },
      connectivity_error: function () {
        $fw.client.dialog.connectivity.show($fw.client.lang.getLangString('connectivity_error'));
      },
      cookie_error: function () {
        location.reload();
      },
      server_error: function (status, statusText) {
        $fw.client.dialog.connectivity.show($fw.client.lang.getLangString('server_error') + status + ' - ' + statusText);
      },
      client_error: function (status, statusText) {
        $fw.client.dialog.connectivity.show($fw.client.lang.getLangString('client_error') + status + ' - ' + statusText);
      },
      generic_error: function (status, statusText) {
        $fw.client.dialog.connectivity.show($fw.client.lang.getLangString('generic_error') + status + ' - ' + statusText);
      },
      cookie_name: 'feedhenry'
    });
  },
  
  /*
   * Returns true if the componentName passed in needs to be setup. Additionally, 
   * it sets the appropriate flag so that next time the component will be deemed as already being setup 
   */
  needsSetup: function (componentName) {
    var setup = $fw.data.get('setup'),
        needsSetup = true;
    
    if ('undefined' !== typeof setup) {
      if (setup[componentName]) {
        needsSetup = false;
      }
    }
    else {
      setup = {};
    }
    
    if (needsSetup) {
      setup[componentName] = true;
      $fw.data.set('setup', setup);
    }

    console.log('needsSetup:' + componentName + '::' + needsSetup);
    
    return needsSetup;
  },
  
  /*
   * Initialise components that are essential to the IDE, , called by fw
   *
   * different from what init() constructor above is for
   */
  doInit: function () {
    
    //Initialise Analytics Binding
    this.analytics.doIntegration();
    
    //Setup docs links
    this.setupDocsLinks();
    
    // Retrieving and populating appropriate fields for Profile
    $fw.client.profile.doLoad();
    
    // call updatebreadcrumb for home tab to set account type text
    $fw.client.tab.home.doUpdateBreadcrumb();
    
    var disabled_tabs;
    try {
      disabled_tabs = $fw.getClientProp('disabled-tabs');
      $.each(disabled_tabs, function (key, val) {
        var tab = $('.' + val),
            panel = $(tab.find('a').attr('href'));
        
        panel.remove();
        tab.remove();
      });
    }
    catch(e) {
      console.log('error parsing disabled-tabs prop:' + e, 'ERROR');
    }
    var overrides = {
      // add a show callback for each tab
      show: function (event, ui) {
        var tab = $(ui.tab).attr('id');
        var tab_name = tab.replace('_tab', '');
        console.log('show ' + tab_name + ' tab');
        // construct the 'show' function name
        var tab_manager = $fw.client.tab[tab_name];
        if ('undefined' !== typeof tab_manager) {
          // update state information
          $fw.state.set('main_tabs', 'selected', ui.index);
          
          // call the show function
          tab_manager.show(event, ui);
        }
        else {
          // if tabmanager doesn't exist, log a warning
          console.log('TabManager for ' + tab_name + ' not initialised in IDEManager', 'WARNING');
        }
      }
    };
    // Check if we need to force a state
    var selected = $fw.state.get('main_tabs', 'selected');
    if ('number' === typeof selected) {
      overrides.selected = selected;
    }
    proto.Tabs.load($('#main_layout_center'), overrides);
  },
  
  // Adds the relevant links to the dashboard page based on the 'dashboard-docs' property
  setupDocsLinks: function () {
    var docs,
        nodeEnabled = $fw.getClientProp('nodejsEnabled');
    
    if ('true' === nodeEnabled) {
      docs = $fw.getClientProp('dashboard-docs-v2'); // nodejs
    } else {
      docs = $fw.getClientProp('dashboard-docs-default');
    }
    
    //log('dashboard-docs:' + docs);
    
    try {
      var docs_array = docs;
      console.log('got ' + docs_array.length + ' docs');
      
      var docs_container = $('.doc_list');
      for (var di=0, dl=docs_array.length; di<dl; di++) {
        var temp_doc = docs_array[di],
            temp_doc_text = $fw.client.lang.getLangString('docs_' + temp_doc.id);
        if (temp_doc_text === null) {
          temp_doc_text = temp_doc.id.replace('_', ' ');
        }
        var temp_doc_link = $('<a>').attr('href', temp_doc.url).attr('target', '_blank').text(temp_doc_text),
            temp_doc_item = $('<li>').addClass('doc_links').append(temp_doc_link);
        
        docs_container.append(temp_doc_item);
      }
    }
    catch (e) {
      console.log('Error getting docs links from property', 'ERROR');
    }
  }
  
});