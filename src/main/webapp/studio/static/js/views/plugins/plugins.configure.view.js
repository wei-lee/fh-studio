App.View.PluginsConfigure = Backbone.View.extend({
  events: {
    'click .plugin .addButton': 'configurePlugin',
    'click #plugins-configure #plugins-cancel' : 'back',
    'click #plugins-configure #plugins-save' : 'setup'
  },
  templates : {
    // These get replaced with a handlebars template function with a $ prefix on the key once compileTemplates is run
    pluginConfigure: '#pluginConfigure',
    pluginInput : '#pluginInput'
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
    this.$el.html(this.renderConfigure());
    return this;
  },
  /*
   Renders the plugin configure page, with a form allowing the user to fill in their details
   */
  renderConfigure: function(){
    var base = $(this.templates.$pluginConfigure(this.plugin.toJSON())),
    fields = this.plugin.get('config');
    for (var i=0; i<fields.length; i++){
      var f = fields[i];
      base.find('fieldset').append(this.templates.$pluginInput(f));
    }
    return base;
  },
  getConfigFormValues : function(){
    var fields = this.$el.find('#plugins-configure form fieldset').serializeArray(),
    obj = {};
    for (var i=0; i<fields.length; i++){
      var f = fields[i];
      obj[f.name] = f.value;
    }
    return obj;
  },
  back : function(){
    this.$el.html('');
    //TODO: Go back elegantly?
  },
  setup : function(){
    var view = new App.View.PluginsSetup({plugin : this.plugin, config : this.getConfigFormValues() });
    $('#plugins_setup_container').append(view.render().el);
    this.$el.html('');

    console.log(this.getConfigFormValues());
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