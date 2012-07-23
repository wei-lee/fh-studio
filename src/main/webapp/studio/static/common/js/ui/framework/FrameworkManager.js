/*
 * Contains all other managers ui, state, data, event etc...
 * Accessible from FrameworkManager.manager_name:
 *   e.g. FrameworkManager.ui, FrameworkManager.data
 */
FrameworkManager = Class.extend({

  /*
   * Initialise any required fields
   */
  init: function (opts) {
    // set defaults
    opts = opts || {};
    
    this.data = new DataManager();
    this.state = new StateManager();
    // use default ajax caller by passing in null for first param
    this.server = new ServerManager(null, opts.server);
    this.analytics = new AnalyticsManager();
  },
  
  
  setClientProps: function (pClientProps) {
    this.clientProps = pClientProps;
  },

  getClientProp: function (pClientPropName) {
    return this.clientProps[pClientPropName];
  },

  getClientProps: function () {
    return this.clientProps;
  },
  
  setUserProps: function (pUserProps) {
    this.userProps = pUserProps;
  },

  getUserProp: function (pUserPropName) {
    return this.userProps[pUserPropName];
  },

  getUserProps: function () {
    return this.userProps;
  },
  
  initFramework: function () {
    this.analytics.initAnalytics(this.clientProps);
    this.state.initState(this.clientProps);
  },
  
  setClient: function (pClient) {
    this.client = pClient;
    // TODO: remove this below
    this.app = Application;
  },

  
  initClient: function () {
    try {
      this.client.doInit(this.clientProps);
    }
    catch (e) {
      // TODO: internationalise
      alert('Application failed to initialise.');
      Log.append(e);
      throw e;
    }
  }
});

$fw = $fw_manager = new FrameworkManager();