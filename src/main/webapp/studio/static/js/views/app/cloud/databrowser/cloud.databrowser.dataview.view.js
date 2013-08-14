App.View.DataBrowserDataView = App.View.DataBrowserView.extend({
  templates : {
    databrowserNavbar : '#databrowserNavbar',
    databrowserDataViewBarItems: '#databrowserDataViewBarItems',
    dataviewPagination : '#dataviewPagination'
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

});