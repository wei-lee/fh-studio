App.View.PluginsDashboard = App.View.PluginsView.extend({
  templates : {
    // These get replaced with a handlebars template function with a $ prefix on the key once compileTemplates is run
    pluginPaneBody: '#pluginPaneBody',
    pluginPaneItemTpl: '#pluginPaneItemTpl',
    pluginsFullscreenBody : '#pluginsFullscreenBody',
    pluginsHeader : '#pluginsHeader'
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
    header = $('<div class="row-fluid header"></div>'),
    search = new App.View.DashboardSearch(),
    body = $(this.templates.$pluginsFullscreenBody());

    body.find('.filters').append(filters.render(this).el);
    header.append(this.templates.$pluginsHeader({ title : 'Cloud Plugins' }));
    header.append(search.render(this).el);
    this.$el.append(header);
    this.$el.append(body);
    this.renderPluginsPane(this);

    return this;
  },
  /*
   Renders a grid of plugins on the front plugins screen from this.plugins
   First builds the categories from every tab seen, then creates tab pane bodies
   @param self - because trigger() doesn't support custom scope, only arguments
   */
  renderPluginsPane: function(self){
    var pluginItems = [];

    self.collection.each(function(pluginItem){
      var p = pluginItem.toJSON();
      if (p.hidden === true || p.disabled === true){
        return;
      }
      p.id = pluginItem.id || pluginItem.cid; // apply the model's ID so we can use it in templating

      // Setup the version so it's blank if git backed, or else "v 1.0" style
      p.versionLabel = (!p.version || p.version === "" || p.version.indexOf("git")>-1) ? "Custom version" : "v" + p.version;
      p.pluginBody = (p.image) ? self.templates.$pluginPaneBody(p) : '<h2 class="pluginName">' + p.name +'</h2>';
      p.show = p["new"] ? "" : "hidden";
      pluginItems.push(self.templates.$pluginPaneItemTpl(p));
    });

    self.$el.find('.plugins').html(pluginItems.join('\n'));
  },
  show : function(){
    this.breadcrumb(['Cloud Plugins']);
    this.renderPluginsPane(this);
    window.scrollTo(0, 0);
    this.$el.show();
    this.shown = true;
  },
  hide : function(){
    this.$el.hide();
    this.shown = false;
  }
});