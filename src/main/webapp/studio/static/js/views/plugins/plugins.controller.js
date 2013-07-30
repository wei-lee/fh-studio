App.View.PluginsController = Backbone.View.extend({
  events: {
    'click .plugin .addButton': 'setup',
    'click .plugin *': 'setup',
    'click .pluginBackLink': 'done'
  },
  subviews : {
    dashboard : App.View.PluginsDashboard,
    setup : App.View.PluginsSetup
  },
  initialize : function(){
    var self =  this;
    $('#plugins_tab').click(function(e){
      if (self.dashboard !== 'undefined' && self.dashboard.shown === false){
        self.done.apply(self, [e]);
      }
    });
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
   Add button gets pressed - setup screen with code snippets & instructions
   */
  setup : function(e){
    e.preventDefault();
    e.stopPropagation();
    var self = this,
    el = $(e.target),
    el = ($(el).hasClass('plugin')) ? el : el.parents('.plugin');
    id = $(el).attr('data-id') || $(el.parent()).attr('data-id');


    this.setup = new App.View.PluginsSetup({plugin : this.dashboard.collection.get(id) });
    this.setup.render();

    this.$('#plugins_setup_container').html(this.setup.el);

    $('#crumb-cloudplugins').unbind().click(function(e){
      self.done.apply(self, [e]);
    });

    this.dashboard.hide();

  },
  done : function(e){
    e.preventDefault();
    this.setup.$el.remove();
    this.dashboard.show();
  }
});