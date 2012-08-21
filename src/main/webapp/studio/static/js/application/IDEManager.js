var IDEManager = Class.extend({
  
  init: function () {
    this.lang = new LangManager();
    this.dialog = new application.DialogManager();
    this.model = new model.ModelManager();
    this.tab = {
      admin: new Admin.Tab.Manager(),
      apps: new Apps.Tab.Manager(),
      dashboard: new Dashboard.Tab.Manager(),
      account: new Account.Tab.Manager(),
      reporting: new Reporting.Tab.Manager()
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
   * Initialise components that are essential to the IDE, , called by fw
   *
   * different from what init() constructor above is for
   */
  doInit: function () {
    
    //Initialise Analytics Binding
    this.analytics.doIntegration();
    
    // Retrieving and populating appropriate fields for Profile
    //$fw.client.profile.doLoad();
    
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
  }
});