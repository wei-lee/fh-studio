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
    header = $('<div class="row-fluid header"></div>'),
    search = new App.View.DashboardSearch(),
    body = $(this.templates.$pluginsFullscreenBody());

    body.find('.filters').append(filters.render(this).el);
    header.append('<i class="icon-random icon-3x pull-left"></i><h2>Cloud Plugins</h2>');
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
      p.title = (p.image) ? self.templates.$pluginPaneImage(p) : '<h2>' + p.name +'</h2>';
      pluginItems.push(self.templates.$pluginPaneItemTpl(p));
    });

    self.$el.find('.plugins').html(pluginItems.join('\n'));
    self.$el.find('.plugins .carousel.plugin-carousel').carousel({
      interval: false, pause : false
    });
    self.bindCarouselEvents();
  },
  show : function(){
    this.breadcrumb(['Cloud Plugins']);
    this.renderPluginsPane(this);
    window.scrollTo(0, 0);
    this.$el.show();

  },
  hide : function(){
    this.$el.hide();
  },
  /*
   This should be a backbone event, but it's far less
   reliable at catching 'e.target' ( $(this) below )
   It also needs to get re-bound.. lots..
   */
  bindCarouselEvents : function(){
    this.$el.find('.plugins .plugin').on('mouseenter', function(){
      var el = this;
      if ($(el).data('animating')===true){
        return;
      }

      $(el).find('.carousel').carousel(1);
      $(el).data('animating', true);
      setTimeout(function(){
        $(el).data('animating', false);
      }, 600);
    });
    this.$el.find('.plugins .plugin').on('mouseleave', function(){
      $(this).find('.carousel').carousel(0);
    });
  }
});