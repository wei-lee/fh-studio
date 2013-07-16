App.View.PluginsDashboard = Backbone.View.extend({
  events: {
    'click .view_details': 'showDetails'
  },

  render: function() {
    var html = $("#plugins-dashboard-template").html();
    if (!html) return;
    var template = Handlebars.compile(html);
    this.$el.html(template());
  },
  /*
   Renders a grid of plugins on the front plugins screen from this.plugins
   First builds the categories from every tab seen, then creates tab pane bodies
   */
  renderPluginsPane: function(){
    var categories = [];
    for (var i=0; i<this.plugins.length; i++){
      var p = this.plugins[i];
      if (categories.indexOf(p.category)===-1){
        // Add the top tab, and the container for this categories tab body


        var tab = $(this.templates.$pluginPaneTabTpl(p)),
        tabBody = this.templates.$pluginPaneTabBody(p);
        $('#plugins-tabs').append(tab);
        $('#pluginTabContent').append(tabBody);

        categories.push(p.category);


      }
      // At this point, we deffo have a container to put the plugin in

      // Setup the version so it's blank if git backed, or else "v 1.0" style
      p.versionLabel = (!p.version || p.version === "" || p.version.indexOf("git")>-1) ? "Custom version" : "v" + p.version;
      p.title = (p.image) ? this.templates.$pluginPaneImage(p) : '<h2>' + p.name +'</h2>';
      var pluginItem = this.templates.$pluginPaneItemTpl(p);

      $('#tab-body-' + p.category + ' .row-fluid').append(pluginItem);
    }
    $('#plugins-tabs li:first').addClass('active');
    $('#pluginTabContent div.tab-pane:first').addClass('active');
  },
});