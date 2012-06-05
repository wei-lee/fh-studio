/*
 * Provides functionality for loading components into the DOM
 */
/*globals document, $, UILoader, EventManager, js_util, model_util, ui_component_factory, EventChain
 */
UILoader = Class.extend({
  manager: null,
  factory: null,

  init: function (p_manager, p_factory) {
    this.manager = p_manager;
    this.factory = p_factory;
  },
  
  /*
	 * Load the given component into the given container by 
	 * calling the load function based on the component 'type'
	 * 
	 * obj is an object with a subset of the following keys
	 * - type (defaults to 'tag')
	 * - other component attributes
	 * container can be either of:
	 * - jquery html element wrapper
	 * - html element id
	 */
  loadComponent: function (obj, container) {
    container = this.getContainer(container);
    var def = this.factory.createComponent(obj);
    if (null !== def) {
      def.load(container);
    }
  },
  
  getContainer: function (container) {
    if ("string" === typeof container) {
      return $('#' + container);
    }
    return container;
  }
});