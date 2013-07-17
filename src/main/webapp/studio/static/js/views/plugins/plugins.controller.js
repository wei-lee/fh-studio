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
  render: function(options) {
    var self = this;
    this.$el.html($('#pluginsContainerTemplate').html());

    this.dashboard = new this.subviews.dashboard();
    this.dashboard.render(options);
    this.$('#plugins_dashboard_container').html(this.dashboard.el);
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
    this.configure.render();
    this.$('#plugins_configure_container').html(this.configure.el);
    this.dashboard.$el.hide();

  },
  back : function(){
    this.configure.remove();
    this.dashboard.$el.show();
  },
  setup : function(){
    this.setup = new App.View.PluginsSetup({plugin : this.configure.plugin, config : this.configure.getConfigFormValues() });
    this.setup.render();
    this.$('#plugins_setup_container').html(this.setup.el);
    this.configure.$el.hide()
  },
  done : function(){
    this.setup.$el.remove();
    this.configure.$el.remove();
    this.dashboard.$el.show();
  }
});