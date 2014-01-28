App.View.PluginsSetup = App.View.PluginsView.extend({
  templates : {
    // These get replaced with a handlebars template function with a $ prefix on the key once compileTemplates is run
    pluginSetup : '#pluginSetup',
    pluginSetupEnvVariables : '#pluginSetupEnvVariables',
    pluginSetupCode : '#pluginSetupCode',
    pluginSetupImage : '#pluginSetupImage',
    pluginsHeader : '#pluginsHeader',
    pluginStep2Subtext : '#pluginStep2Subtext'
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
    this.show();
    return this;
  },
  setup: function(options){
    var plugin = options.plugin.toJSON(),
    config = this.plugin.get('config'),
    envVariablesString, code, image,
    header = this.templates.$pluginsHeader({ title : 'Using ' + plugin.name });

    plugin.npmName = plugin.npmName || plugin.name.toLowerCase();
    plugin.snippetName = plugin.snippetName || plugin.npmName;
    code = $('#snippet-' + plugin.snippetName.replace(".","")).html();
    if (code && code!==""){
      codeSubtext = plugin.step2Subtext || this.templates.$pluginStep2Subtext();
      code = this.templates.$pluginSetupCode({ code : code, subtext : codeSubtext });
    }

    if (config && !_.isEmpty(config)){
      var envVariables = [],
      envVariablesTemplate = $;
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

    image = this.templates.$pluginSetupImage(plugin);

    return this.templates.$pluginSetup({
      header : header,
      plugin : plugin,
      docs: plugin.docs,
      codeString : code || '',
      envVariablesString : envVariablesString || '',
      image : image || null
    });
  },
  show : function(){
    this.breadcrumb(['Cloud Plugins', 'Setup', this.options.plugin.get('name')]);
    window.scrollTo(0, 0);
  }
});