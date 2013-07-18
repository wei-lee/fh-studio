App.View.PluginsSetup = Backbone.View.extend({
  events: {
  },
  templates : {
    // These get replaced with a handlebars template function with a $ prefix on the key once compileTemplates is run
    pluginSetup : '#pluginSetup'
  },
  plugin : undefined,
  initialize : function(options){
    if (!options.plugin){
      throw new Error("Plugin Configure view inited with no plugin specified!");
    }
    this.plugin = options.plugin;
    this.compileTemplates();
  },
  render: function() {
    this.$el.html(this.setup(this.options));
    return this;
  },
  /*
   Renders the plugin configure page, with a form allowing the user to fill in their details
   */
  setup: function(options){
    //TODO: make env variables section prettier
    var plugin = options.plugin.toJSON(),
    envVariablesString = [],
    code;
    plugin.npmName = plugin.npmName || plugin.name.toLowerCase();
    code = $('#snippet-' + plugin.npmName).html();

    envVariablesString.push("<table class='table table-striped'><thead><tr><th>Environment Variable</th><th>Dev Value</th><th>Live Value</th></tr></thead><tbody>");
    for (var key in options.config){
      if (options.config.hasOwnProperty(key)){
        var val = options.config[key];
        envVariablesString.push("<tr>");
        envVariablesString.push("<td>" + key + "</td>");
        envVariablesString.push("<td>" + val + "</td>");
        envVariablesString.push("<td>" + val + "</td>");
        envVariablesString.push("</tr>");
      }
    }
    envVariablesString.push("</tbody></table>");

    return this.templates.$pluginSetup({
      plugin : plugin,
      code : code,
      envVariablesString : envVariablesString.join("")
    });
  },
  compileTemplates: function() { //TODO: DRY
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