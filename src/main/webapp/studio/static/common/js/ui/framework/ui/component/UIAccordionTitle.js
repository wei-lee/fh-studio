/*global $ ui_component_factory UITag
 */
 // TODO: rename Title to something more appropriate
var UIAccordionTitle = UITag.extend({
  init: function (opts) {
    this._super(opts);
    this.content = this.manager.getFactory().createComponent(opts.content);
  },
  
  load: function (container) {
    this.dom_object = $('<h3>', {
    }).append($('<a>', {
      id: 'accordionTitle_' + this.id,
      href: '#',
      text: this.text
    })).appendTo(container);
  }
  
});