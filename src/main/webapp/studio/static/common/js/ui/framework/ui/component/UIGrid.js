/*global ui_component_factory Class
 */
var UIGrid = UIComponent.extend({
  init: function (opts) {
    this._super(opts);
  },
  
  load: function (container) {
    var table = $('<table>', {id: this.id});
    var pager = null;
    if(this.params.pager){
    	pager = $('<div>', {id: this.params.pager});
    }
    container.append(table);
    if(null != pager){
        container.append(pager);
    }
    if(this.caption){
    	this.params.caption = this.manager.getLang(this.caption);
    }
    if(this.emptyrecords){
    	this.params.emptyrecords = this.manager.getLang(this.emptyrecords);
    }
    if(this.colNames){
    	var col_names = [];
    	for(var i = 0; i < this.colNames.length; i++){
    		col_names.push(this.manager.getLang(this.colNames[i]));
    	}
    	this.params.colNames = col_names;
    }
    this.dom_object = table.jqGrid(this.params);
    
    // TODO: revisit - is there a more generic/better way to do this
    if (this.onload) {
      this.onload(this.loadData);
    }
  },
  
  loadData: function (params) {
    this.dom_object.jqGrid('addRowData', params.id, params.data);
    this.dom_object.trigger('reloadGrid');
  }/*,
  
  onResize: function () {
    console.log('setting grid size to ' + this.dom_object.parent().parent().width() + ',' + this.dom_object.parent().parent().height())
    this.dom_object.setGridWidth(this.dom_object.parent().parent().width());
    this.dom_object.setGridHeight(this.dom_object.parent().parent().height());
  }*/
});