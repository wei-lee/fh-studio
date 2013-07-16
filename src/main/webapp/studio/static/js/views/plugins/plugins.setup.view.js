App.View.PluginsSetup = Backbone.View.extend({
  events: {
    'click #plugins-done': 'done'
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
    //TODO: Pull the code, package json string & make env variables section prettier
    return this.templates.$pluginSetup({
      plugin : options.plugin.toJSON(),
      code : '',
      packageJsonString : '',
      envVariablesString : ''
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
  },
  done : function(){
    this.$el.html('');

  }
});