App.View.DataBrowserMigrateView = App.View.DataBrowserView.extend({
  templates : {
    'dataviewEmptyContainer' : '#dataviewEmptyContainer',
    'dataMigrateContent' : '#dataMigrateContent',
    'databrowserNavbar' : '#databrowserNavbar'
  },
  events : {
    'click  .btn-migrate' : 'onMigrate'
  },
  initialize : function(options){
    this.compileTemplates();
    this.options = options;
  },
  render: function() {
    var nav = this.templates.$databrowserNavbar({ brand : 'Data Browser', class : 'migratenavbar', baritems : '' }),
    migrateContent = this.templates.$dataMigrateContent(),
    emptyContainer = this.templates.$dataviewEmptyContainer({ content: migrateContent });

    this.$el.empty();
    this.$el.append(nav);
    this.$el.append(emptyContainer);
    return this;
  },
  onMigrate : function(){
    // TODO: Migrate..
    // this.options.guid gets passed to a call to MC i guess..
  }
});