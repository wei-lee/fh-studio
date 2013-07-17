App.View.PluginsDashboard = Backbone.View.extend({
  events: {
  },
  templates : {
    // These get replaced with a handlebars template function with a $ prefix on the key once compileTemplates is run
    pluginsTabs : '#pluginsTabs',
    pluginsTabsBody : '#pluginsTabsBody',
    pluginPaneTabTpl: '#pluginPaneTabTpl',
    pluginPaneTabBody: '#pluginPaneTabBody',
    pluginPaneImage: '#pluginPaneImage',
    pluginPaneItemTpl: '#pluginPaneItemTpl'
  },
  initialize : function(){
    this.collection = new Plugins.Collection.Plugin();
    this.collection.bind('reset', this.render, this);
    this.collection.fetch({ reset: true });
    this.compileTemplates();
  },
  render: function() {
    this.$el.html(this.renderPluginsPane());
    return this;
  },
  /*
   Renders a grid of plugins on the front plugins screen from this.plugins
   First builds the categories from every tab seen, then creates tab pane bodies
   */
  renderPluginsPane: function(){
    var self = this,
    categories = [],
    tabs = $(self.templates.$pluginsTabs()),
    body = $(self.templates.$pluginsTabsBody()),
    element;
    this.collection.each(function(pluginItem){
      var p = pluginItem.toJSON();
      p.id = pluginItem.id || pluginItem.cid; // apply the model's ID so we can use it in templating

      // If we haven't seen this category before, add the top tab, and the tab container
      if (categories.indexOf(p.category)===-1){
        var tab = $(self.templates.$pluginPaneTabTpl(p)),
        tabBody = self.templates.$pluginPaneTabBody(p);
        tabs.append(tab);
        body.find('#pluginTabContent').append(tabBody);
        categories.push(p.category);
      }
      // At this point, we deffo have a container to put the plugin in

      // Setup the version so it's blank if git backed, or else "v 1.0" style
      p.versionLabel = (!p.version || p.version === "" || p.version.indexOf("git")>-1) ? "Custom version" : "v" + p.version;
      p.title = (p.image) ? self.templates.$pluginPaneImage(p) : '<h2>' + p.name +'</h2>';

      var pluginItem = self.templates.$pluginPaneItemTpl(p);

      body.find('#tab-body-' + p.category + ' .row-fluid').append(pluginItem);
    });

    // Make the first tab the active one
    tabs.find('#plugins-tabs li:first').addClass('active');
    body.find('#pluginTabContent div.tab-pane:first').addClass('active');

    element = $("<div></div>").append(tabs).append(body);

    // Setup the slider events on the carousel
    element.find('.carousel.plugin-carousel').carousel({
      interval: false, pause : false
    });

    element.find('#pluginTabContent .plugin').on('hover', function(){
      $(this).find('.carousel').carousel(1);
    });
    element.find('#pluginTabContent .plugin').on('mouseleave', function(){
      $(this).find('.carousel').carousel(0);
    });

    return element;
  },
  /*
    Add button gets pressed
   */
  configurePlugin : function(e){
    var addButton = $(e.target),
    id = $(addButton).attr('data-id') || $(addButton.parent()).attr('data-id');
    var view = new App.View.PluginsConfigure({
      plugin : this.collection.get(id)
    });

    // TODO: Need a tidier way to instantiate a subview..
    $('#plugins_configure_container').append(view.render().el);
    this.$el.hide();

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