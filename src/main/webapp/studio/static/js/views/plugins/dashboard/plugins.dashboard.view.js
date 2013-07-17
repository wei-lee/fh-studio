App.View.PluginsDashboard = Backbone.View.extend({
  events: {
  },
  templates : {
    // These get replaced with a handlebars template function with a $ prefix on the key once compileTemplates is run
    pluginPaneImage: '#pluginPaneImage',
    pluginPaneItemTpl: '#pluginPaneItemTpl',
    pluginsDashboardSearch : '#pluginsDashboardSearch',
    pluginsFullscreenBody : '#pluginsFullscreenBody'
  },
  initialize : function(){
    this.collection = Plugins.Collections.Plugins;
    this.collection.bind('reset', this.render, this);
    this.compileTemplates();
  },
  render: function(options) {
    this.$el.empty();
    this.renderPluginsPane(options);
    return this;
  },
  /*
   Renders a grid of plugins on the front plugins screen from this.plugins
   First builds the categories from every tab seen, then creates tab pane bodies
   */
  renderPluginsPane: function(options){
    var self = this,
    categories = [],
    filters = new App.View.DashboardFilters(), // TODO
    pluginItems = [],
    tabContainers = [],
    body;

    this.collection.each(function(pluginItem){
      var p = pluginItem.toJSON();
      p.id = pluginItem.id || pluginItem.cid; // apply the model's ID so we can use it in templating

      // Setup the version so it's blank if git backed, or else "v 1.0" style
      p.versionLabel = (!p.version || p.version === "" || p.version.indexOf("git")>-1) ? "Custom version" : "v" + p.version;
      p.title = (p.image) ? self.templates.$pluginPaneImage(p) : '<h2>' + p.name +'</h2>';
      pluginItems.push(self.templates.$pluginPaneItemTpl(p));
    });
    body = $(self.templates.$pluginsFullscreenBody()); // TODO Events won't bind this way, do properly

    body.find('.plugins').append(pluginItems.join('\n'));
    body.find('.filters').append(filters.render().el);

    //TODO Move these to proper events
    // Setup the slider events on the carousel
    body.find('.carousel.plugin-carousel').carousel({
      interval: false, pause : false
    });

    body.find('.plugins .plugin').on('hover', function(){
      $(this).find('.carousel').carousel(1);
    });
    body.find('.plugins .plugin').on('mouseleave', function(){
      $(this).find('.carousel').carousel(0);
    });

    this.renderSearch();

    this.$el.append(body);

    return this.$el;
  },
  renderSearch : function(){
    // TODO: This should really be it's own view
    var search = $(this.templates.$pluginsDashboardSearch()),
    self = this;

    search.find('input').keyup(function(){
      self.filter.apply(self, [this]);
    });
    this.$el.append(search);
  },
  filter : function(el){
    var value = el.value && el.value.toLowerCase();
    this.$el.find('.plugin').show();
    if (typeof value !== "string" || value === ""){
      return;
    }

    this.$el.find('.plugin').each(function(i, p){
      if ($(p).data('category').toLowerCase().indexOf(value)===-1 && $(p).data('name').toLowerCase().indexOf(value)===-1){
        $(p).hide();
      }
    });
  },
  compileTemplates: function() {
    var templates = {};
    for (var key in this.templates){
      if (this.templates.hasOwnProperty(key)){
        var tpl = this.templates[key],
        html = $(tpl, this.$container).html();
        if (!html){
          throw new Error("No html found for " + key);
        }
        templates['$' + key] = Handlebars.compile(html);
      }
    }
    this.templates = templates;
  }
});