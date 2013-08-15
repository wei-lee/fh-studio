App.View.DataBrowserAdvancedEditor = App.View.DataBrowserView.extend({
  templates : {
    databrowserNavbar : '#databrowserNavbar',
    dataviewAdvancedEditorBarItems: '#dataviewAdvancedEditorBarItems'
  },
  initialize : function(){
    this.compileTemplates();
  },
  render: function() {
    var barItems = this.templates.$dataviewAdvancedEditorBarItems(),
    nav = this.templates.$databrowserNavbar({ brand : 'Advanced Editor', class : 'advancededitorBar', baritems : barItems });
    this.$el.empty();
    this.$el.append(nav);
    return this;
  }
});