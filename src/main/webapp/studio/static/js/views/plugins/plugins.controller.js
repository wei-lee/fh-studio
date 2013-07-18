App.View.PluginsController = Backbone.View.extend({
  events: {
    'click .plugin .addButton': 'setup',
    'click #plugins-done': 'done'
  },
  subviews : {
    dashboard : App.View.PluginsDashboard,
    setup : App.View.PluginsSetup
  },
  initialize : function(){},
  render: function(options) {
    var self = this;
    this.$el.html($('#pluginsContainerTemplate').html());

    this.dashboard = new this.subviews.dashboard();
    this.dashboard.render(options);
    this.$('#plugins_dashboard_container').html(this.dashboard.el);
    return this;
  },
  /*
   Add button gets pressed - setup screen with code snippets & instructions
   */
  setup : function(e){
    var addButton = $(e.target),
    id = $(addButton).attr('data-id') || $(addButton.parent()).attr('data-id');

    this.setup = new App.View.PluginsSetup({plugin : this.dashboard.collection.get(id) });
    this.setup.render();

    this.$('#plugins_setup_container').html(this.setup.el);
    this.dashboard.hide();

  },
  done : function(){
    this.setup.$el.remove();
    this.dashboard.show();
  }
});