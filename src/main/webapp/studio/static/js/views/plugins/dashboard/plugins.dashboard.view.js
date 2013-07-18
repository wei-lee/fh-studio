App.View.PluginsDashboard = Backbone.View.extend({
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
    var filters = new App.View.DashboardFilters(), // TODO
    body = $(this.templates.$pluginsFullscreenBody());

    body.find('.filters').append(filters.render(this.collection).el);

    //TODO Move these to proper events
    // Setup the slider events on the carousel


    this.renderSearch();

    this.$el.append(body);
    this.renderPluginsPane(options);

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
  renderPluginsPane: function(options){
    var self = this,
    pluginItems = [];


    this.collection.each(function(pluginItem){
      var p = pluginItem.toJSON();
      p.id = pluginItem.id || pluginItem.cid; // apply the model's ID so we can use it in templating

      // Setup the version so it's blank if git backed, or else "v 1.0" style
      p.versionLabel = (!p.version || p.version === "" || p.version.indexOf("git")>-1) ? "Custom version" : "v" + p.version;
      p.title = (p.image) ? self.templates.$pluginPaneImage(p) : '<h2>' + p.name +'</h2>';
      pluginItems.push(self.templates.$pluginPaneItemTpl(p));
    });

    this.$el.find('.plugins').html(pluginItems.join('\n'));
    this.$el.find('.plugins .carousel.plugin-carousel').carousel({
      interval: false, pause : false
    });
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

    this.collection.each(function(model){
      model.unset('hidden');
      if (typeof value !== "string" || value === ""){
        return;
      }
      if (model.get('category').toLowerCase().indexOf(value)===-1
      && model.get('name').toLowerCase().indexOf(value)===-1){
        model.set('hidden', true);
      }
    });
    this.render();
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