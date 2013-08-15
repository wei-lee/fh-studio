App.View.DataBrowserDataView = App.View.DataBrowserView.extend({
  templates : {
    databrowserNavbar : '#databrowserNavbar',
    databrowserDataViewBarItems: '#databrowserDataViewBarItems',
    dataviewPagination : '#dataviewPagination'
  },
  events : {
    'click table.databrowser tr .btn-advanced-edit' : 'onRowAdvancedEdit'
  },
  initialize : function(){
    this.compileTemplates();
  },
  render: function() {
    var navItems = this.templates.$databrowserDataViewBarItems(),
    nav = this.templates.$databrowserNavbar({ brand : 'Collections', class : 'collectionsnavbar', baritems : navItems }),
    table = new App.View.DataBrowserTable().render();

    this.$el.append(nav);
    this.$el.append(table.el);
    this.$el.append(this.templates.$dataviewPagination());
    return this;
  },
  onRowAdvancedEdit : function(e){
    e.stopPropagation();
    // Clone the old view
    this.dataview = this.$el.clone();
    this.$el.empty();
    var browser = new App.View.DataBrowserAdvancedEditor();
    browser.render();
    this.$el.append(browser.el);
  },
  onRowAdvancedEditDone : function(e){
    this.$el = this.dataview;
  }
});