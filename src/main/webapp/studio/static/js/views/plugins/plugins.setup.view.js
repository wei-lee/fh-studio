App.View.PluginsSetup = App.View.PluginsView.extend({
  templates : {
    // These get replaced with a handlebars template function with a $ prefix on the key once compileTemplates is run
    pluginSetup : '#pluginSetup',
    pluginSetupEnvVariables : '#pluginSetupEnvVariables',
    pluginSetupCode : '#pluginSetupCode',
    pluginSetupImage : '#pluginSetupImage'
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
    var plugin = options.plugin.toJSON(),
    config = this.plugin.get('config'),
    envVariablesString, code, image;

    plugin.npmName = plugin.npmName || plugin.name.toLowerCase();
    code = $('#snippet-' + plugin.npmName).html();
    if (code && code!==""){
      code = this.templates.$pluginSetupCode({ code : code });
    }

    if (config && !_.isEmpty(config)){
      var envVariables = [],
      envVariablesTemplate = $
      _.each(config, function(element){
        envVariables.push("<tr>");
        envVariables.push("<td>" + element.varName + "</td>");
        envVariables.push("<td>" + element.desc + "</td>");
        envVariables.push("</tr>");
      });
      envVariablesString = this.templates.$pluginSetupEnvVariables({
        variableRows : envVariables.join("")
      });
    }

    if (plugin.image && plugin.image !== ""){
      image = this.templates.$pluginSetupImage(plugin);
    }



    return this.templates.$pluginSetup({
      plugin : plugin,
      codeString : code || '',
      envVariablesString : envVariablesString || '',
      image : image || ''
    });
  }
});