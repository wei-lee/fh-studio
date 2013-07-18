App.View.PluginsSetup = App.View.PluginsView.extend({
  templates : {
    // These get replaced with a handlebars template function with a $ prefix on the key once compileTemplates is run
    pluginSetup : '#pluginSetup'
  },
  plugin : undefined,
  initialize : function(options){
    if (!options.plugin){
      throw new Error("Plugin setup view inited with no plugin specified!");
    }
    this.plugin = options.plugin;

    this.compileTemplates();
  },
  render: function() {
    this.$el.html(this.setup(this.options));
    this.breadcrumb(['Cloud Plugins', 'Setup', this.options.plugin.get('name')]);
    return this;
  },
  setup: function(options){
    //TODO: make env variables section prettier
    var plugin = options.plugin.toJSON(),
    envVariablesString = [],
    config = this.plugin.get('config'),
    code;

    plugin.npmName = plugin.npmName || plugin.name.toLowerCase();
    code = $('#snippet-' + plugin.npmName).html();

    envVariablesString.push("<table class='table table-striped'><thead><tr><th>Environment Variable</th><th>Value</th></tr></thead><tbody>");
    _.each(config, function(element){
      envVariablesString.push("<tr>");
      envVariablesString.push("<td>" + element.varName + "</td>");
      envVariablesString.push("<td>" + element.desc + "</td>");
      envVariablesString.push("</tr>");
    });
    envVariablesString.push("</tbody></table>");

    return this.templates.$pluginSetup({
      plugin : plugin,
      code : code,
      envVariablesString : envVariablesString.join("")
    });
  }
});