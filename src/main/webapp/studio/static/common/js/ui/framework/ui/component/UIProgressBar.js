/*global $ ui_component_factory UIComponent
 */
var UIProgressBar = UIComponent.extend({
  init: function (opts) {
    this._super(opts);
  },
  
  load: function (container) {
    var div = $('<div>', {
      id: this.id
    });
    container.append(div);
    this.dom_object = div.progressbar(this.params);
  }
  
});