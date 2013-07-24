App.View.PluginsDashboard = App.View.PluginsView.extend({
  templates : {
    // These get replaced with a handlebars template function with a $ prefix on the key once compileTemplates is run
    pluginPaneImage: '#pluginPaneImage',
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

    // Add an isMouseOver plugin to the jQuery object for re-use by our carousel
    jQuery.fn.mouseIsOver = function () {
      return $(this).parent().find($(this).selector + ":hover").length > 0;
    };
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
    this.shown = true;
  },
  hide : function(){
    this.$el.hide();
    this.shown = false;
  },
  /*
   This should be a backbone event, but it's far less
   reliable at catching 'e.target' ( $(this) below )
   It also needs to get re-bound.. lots..
   */
  bindCarouselEvents : function(){
    var self = this;
    this.$el.find('.plugins .plugin').on('mouseenter', function(){
      self.$el.find('.plugins .plugin .carousel').carousel(0);
      var el = this;

      // If we're already moving the element (600ms below), bail
      if ($(el).data('animating')===true){
        return;
      }

      // Give the user some time contemplating the logo before we hover
      setTimeout(function(){
        if (!$(el).mouseIsOver()){
          return;
        }

        $(el).find('.carousel').carousel(1);
        $(el).data('animating', true);

        // Delay the length of the 2 animations
        // before we allow the item to be animated again.
        setTimeout(function(){
          $(el).data('animating', false);
        }, 600);

        // One animation is done, check if we're still hovering over this element!
        setTimeout(function(){
          if ($(el).mouseIsOver() === false ){
            $(el).find('.carousel').carousel(0);
          }
        }, 1000);

      }, 300);

    });
    this.$el.find('.plugins .plugin').on('mouseleave', function(){
      $(this).find('.carousel').carousel(0);
    });
  }
});