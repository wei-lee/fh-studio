App.View.DataBrowserDataView = App.View.DataBrowserView.extend({
  templates : {

  },
  events : {
    'click table.databrowser tr .btn-advanced-edit' : 'onRowAdvancedEdit'
  },
  initialize : function(){
    this.compileTemplates();
  },
  render: function() {

    this.table = new App.View.DataBrowserTable();
    this.table.render();
    this.$el.append(this.table.el);

    this.browser = new App.View.DataBrowserAdvancedEditor( {parent : this, guid : '1a', json : { a : 1, b : '2', c : [1,2,3] }});
    this.browser.render();
    this.browser.$el.hide();
    this.$el.append(this.browser.el);
    return this;
  },
  onRowAdvancedEdit : function(e){
    e.stopPropagation();
    // Clone the old view
    var el = e.target,
    tr = $(el).parents('tr'),
    guid = tr.attr('id'),
    model = DataBrowser.Collections.CollectionData.get(guid);

    this.browser.update(model);

    this.table.$el.hide();
    this.browser.$el.show();
  },
  onRowAdvancedEditDone : function(e){
    this.table.render();
    this.browser.$el.hide();
    this.table.$el.show();
  },
  onRowAdvancedEditCancel : function(e){
    this.browser.$el.hide();
    this.table.$el.show();
  }
});