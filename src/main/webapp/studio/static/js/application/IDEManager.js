var IDEManager = Class.extend({
  
  init: function () {
    this.accordion = new application.AccordionManager();
    this.app = new application.AppManager();
    this.template = new application.TemplateManager();
    this.preview = new application.PreviewManager();
    this.file = new application.FileManager();
    this.editor = new application.EditorManager();
    this.config = {
      studio: new application.StudioConfigManager(),
      embed: new application.EmbedConfigManager(),
      iphone: new application.IPhoneConfigManager(),
      android: new application.AndroidConfigManager(),
      ipad: new application.IPadConfigManager(),
      ios: new application.IosConfigManager(),
      blackberry: new application.BlackberryConfigManager(),
      windowsphone7: new application.Windowsphone7ConfigManager(),
      nokiawrt: new application.NokiawrtConfigManager()
    };
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
    this.icon = new application.IconManager();
    this.model = new model.ModelManager();
    this.tab = {
      home: new application.HomeTabManager(),
      apps: new application.AppsTabManager(),
      account: new application.AccountTabManager(),
      reporting: new application.ReportingTabManager(),
      useradmin: new application.UseradminTabManager(),
      admin: new Admin.Tab.Manager()
    };
    this.analytics = new analytics.AnalyticsIntegration();
    this.debug = new application.DebugManager();
    this.staging = new application.StagingManager();
    this.status = new application.StatusManager();
    this.chart = new application.ChartManager();
    this.arm = {
      apps: new application.ArmAppManager(),
      users: new application.ArmUserManager(),
      groups: new application.ArmGroupManager(),
      devices: new application.ArmDeviceManager(),
      authPolicies: new application.ArmAuthPolicyManager()
    };
    this.useradmin = new UserAdmin.Controller();
        
    // setup callbacks for server calls
    $fw_manager.server.setOpts({ 
      connectivity_ok: function () {
        $fw_manager.client.dialog.connectivity.hide();
      },
      connectivity_error: function () {
        $fw_manager.client.dialog.connectivity.show($fw_manager.client.lang.getLangString('connectivity_error'));
      },
      cookie_error: function () {
        location.reload();
      },
      server_error: function (status, statusText) {
        $fw_manager.client.dialog.connectivity.show($fw_manager.client.lang.getLangString('server_error') + status + ' - ' + statusText);
      },
      client_error: function (status, statusText) {
        $fw_manager.client.dialog.connectivity.show($fw_manager.client.lang.getLangString('client_error') + status + ' - ' + statusText);
      },
      generic_error: function (status, statusText) {
        $fw_manager.client.dialog.connectivity.show($fw_manager.client.lang.getLangString('generic_error') + status + ' - ' + statusText);
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

    Log.append('needsSetup:' + componentName + '::' + needsSetup);
    
    return needsSetup;
  },
  
  /*
   * Initialise components that are essential to the IDE, , called by fw_manager
   * 
   * different from what init() constructor above is for
   */
  doInit: function () {
    
    //Initialise Analytics Binding
    this.analytics.doIntegration();
    
    //Setup docs links
    this.setupDocsLinks();
    
    // Retrieving and populating appropriate fields for Profile
    $fw_manager.client.profile.doLoad();
    
    // call updatebreadcrumb for home tab to set account type text
    $fw.client.tab.home.doUpdateBreadcrumb();
    
    var disabled_tabs;
    try {
      disabled_tabs = $fw_manager.getClientProp('disabled-tabs');
      $.each(disabled_tabs, function (key, val) {
        var tab = $('.' + val),
            panel = $(tab.find('a').attr('href'));
        
        panel.remove();
        tab.remove();
      });
    }
    catch(e) {
      Log.append('error parsing disabled-tabs prop:' + e, 'ERROR');
    }
    var overrides = {
      // add a show callback for each tab
      show: function (event, ui) {
        var tab = $(ui.tab).attr('id');
        var tab_name = tab.replace('_tab', '');
        Log.append('show ' + tab_name + ' tab');
        // construct the 'show' function name
        var tab_manager = $fw_manager.client.tab[tab_name];
        if ('undefined' !== typeof tab_manager) {
          // update state information
          $fw_manager.state.set('main_tabs', 'selected', ui.index);
          
          // call the show function
          tab_manager.show(event, ui);
        }
        else {
          // if tabmanager doesn't exist, log a warning
          Log.append('TabManager for ' + tab_name + ' not initialised in IDEManager', 'WARNING');
        }
      }
    };
    // Check if we need to force a state
    var selected = $fw_manager.state.get('main_tabs', 'selected');
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
    
    //Log.append('dashboard-docs:' + docs);
    
    try {
      var docs_array = docs;
      Log.append('got ' + docs_array.length + ' docs');
      
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
      Log.append('Error getting docs links from property', 'ERROR');
    }
  }
  
});