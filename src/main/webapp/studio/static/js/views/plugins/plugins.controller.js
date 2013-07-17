App.View.PluginsController = Backbone.View.extend({
  events: {
    'click .plugin .addButton': 'configurePlugin',
    'click #plugins-configure #plugins-cancel' : 'back',
    'click #plugins-configure #plugins-save' : 'setup',
    'click #plugins-done': 'done'
  },
  subviews : {
    dashboard : App.View.PluginsDashboard,
    configure : App.View.PluginsConfigure,
    setup : App.View.PluginsSetup
  },
  initialize : function(){

  },
  render: function() {
    var self = this;
    this.$el.html($('#pluginsContainerTemplate').html());

    this.dashboard = new this.subviews.dashboard();
    this.dashboard.setElement(this.$('#plugins_dashboard_container')).render();

    return this;
  },
  /*
   Add button gets pressed - show the configure screen with the form fields
   */
  configurePlugin : function(e){
    var addButton = $(e.target),
    id = $(addButton).attr('data-id') || $(addButton.parent()).attr('data-id');
    this.configure = new this.subviews.configure({
      plugin : this.dashboard.collection.get(id)
    });
    this.configure.setElement(this.$('#plugins_configure_container')).render();
    this.dashboard.$el.hide();

  },
  back : function(){
    this.configure.remove();
    this.dashboard.$el.show();
  },
  setup : function(){
    this.setup = new App.View.PluginsSetup({plugin : this.configure.plugin, config : this.configure.getConfigFormValues() });
    this.setup.setElement(this.$('#plugins_setup_container')).render();
    this.configure.$el.hide()
  },
  done : function(){
    this.setup.$el.remove();
    this.configure.$el.remove();
    this.dashboard.$el.show();
  }
});