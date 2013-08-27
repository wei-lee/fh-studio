App.View.DataBrowserDataView = App.View.DataBrowserView.extend({
  templates : {

  },
  events : {
    'click table.edittable tr .btn-advanced-edit' : 'onRowAdvancedEdit'
  },
  initialize : function(options){
    this.options = options;
    this.compileTemplates();
  },
  render: function() {

    this.table = new App.View.DataBrowserTable(this.options);
    this.table.render();
    this.$el.append(this.table.el);

    this.browser = new App.View.DataBrowserAdvancedEditor( {parent : this});
    this.browser.render();
    this.browser.$el.hide();
    this.$el.append(this.browser.el);
    return this;
  },
  onRowAdvancedEdit : function(e){
    e.stopPropagation();
    // Clone the old view
    var el = $(e.target),
    guid = el.parents('td').data('id'),
    tr = this.table.$el.find('#' + guid),
    model = this.table.collection.get(guid);

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