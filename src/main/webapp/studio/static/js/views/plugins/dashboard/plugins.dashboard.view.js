App.View.PluginsDashboard = App.View.PluginsView.extend({
  templates : {
    // These get replaced with a handlebars template function with a $ prefix on the key once compileTemplates is run
    pluginPaneImage: '#pluginPaneImage',
    pluginPaneItemTpl: '#pluginPaneItemTpl',
    pluginsFullscreenBody : '#pluginsFullscreenBody'
  },
  initialize : function(){
    this.collection = Plugins.Collections.Plugins;
    this.collection.bind('reset', this.render, this);
    this.collection.bind('redraw', this.renderPluginsPane);
    this.compileTemplates();
    this.breadcrumb(['Cloud Plugins']);
  },
  render: function() {
    this.$el.empty();
    var filters = new App.View.DashboardFilters(),
    search = new App.View.DashboardSearch(),
    body = $(this.templates.$pluginsFullscreenBody());

    body.find('.filters').append(filters.render(this).el);

    //TODO Move these to proper events
    // Setup the slider events on the carousel

    this.$el.append(search.render(this).el);
    this.$el.append(body);
    this.renderPluginsPane(this);

    // This should be a backbone event, but it's far less
    // reliable at catching 'e.target' ( $(this) below )
    body.find('.plugins .plugin').on('hover', function(){
      $(this).find('.carousel').carousel(1);
    });
    body.find('.plugins .plugin').on('mouseleave', function(){
      $(this).find('.carousel').carousel(0);
    });
    return this;
  },
  /*
   Renders a grid of plugins on the front plugins screen from this.plugins
   First builds the categories from every tab seen, then creates tab pane bodies
   */
  renderPluginsPane: function(self){
    var pluginItems = [];

    self.collection.each(function(pluginItem){
      var p = pluginItem.toJSON();
      if (p.hidden===true){
        return;
      }
      p.id = pluginItem.id || pluginItem.cid; // apply the model's ID so we can use it in templating

      // Setup the version so it's blank if git backed, or else "v 1.0" style
      p.versionLabel = (!p.version || p.version === "" || p.version.indexOf("git")>-1) ? "Custom version" : "v" + p.version;
      p.title = (p.image) ? self.templates.$pluginPaneImage(p) : '<h2>' + p.name +'</h2>';
      pluginItems.push(self.templates.$pluginPaneItemTpl(p));
    });

    self.$el.find('.plugins').html(pluginItems.join('\n'));
    self.$el.find('.plugins .carousel.plugin-carousel').carousel({
      interval: false, pause : false
    });
  },
  show : function(){
    this.breadcrumb(['Cloud Plugins']);
    this.$el.show();
  },
  hide : function(){
    this.$el.hide();
  }
});