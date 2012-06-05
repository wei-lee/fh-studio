/*
 * 
 */
/*global UIManager, UILoader, document, ui_model, $
 */

UIManager = Class.extend({
  loader: null,
  factory: null,
  
  event_manager: null,
  state_manager: null,
  
  mode: null,
  tooltip_prerender: false,
  
  components: {},
  
  init: function () {
    this.factory = new UIComponentFactory(this);
    this.loader = new UILoader(this, this.factory);
  },
  
  loadModel: function (fn, container) {
    this.state_manager.initState(ui_model);
    this.loader.loadComponent(ui_model[fn], container);
  },
  
  setMode: function (mode) {
    this.mode = mode;
  },
  
  getMode: function () {
    return this.mode;
  },
  
  getLang: function (lang_key) {
    return lang[lang_key] || lang_key;
  },
  
  doTooltipPrerender: function () {
    return this.tooltip_prerender;
  },
  
  setTooltipPrerender: function (value) {
    this.tooltip_prerender = value;
  },
  
  setClient: function (client) {
    this.client = client;
  },
  
  getClient: function () {
    return this.client;
  },
  
  getFactory: function () {
    return this.factory;
  },
  
  getLoader: function () {
    return this.loader;
  },
  
  getStateManager: function () {
    return this.state_manager;
  },
  
  setStateManager: function (p_state_manager) {
    this.state_manager = p_state_manager;
  },
  
  getEventManager: function () {
    return this.event_manager;
  },
  
  setEventManager: function (p_event_manager) {
    this.event_manager = p_event_manager;
  },
  
  getComponent: function (initialiser, id) {
    // TODO: use the loader & factory to create components, instead of calling an init function
    if (!this.components[id]) {
      var init_fn_name = "init" + js_util.camelCase(id.split('_'));
      var init_fn = initialiser[init_fn_name];
      if ($.isFunction(init_fn)) {
        this.components[id] =  init_fn();
      }
      else {
        Log.append(init_fn_name + ' not implemented', 'WARNING');
        return null;
      }
    }
    return this.components[id];
  }
});