/*
  Common functions used by all backbone views in FH - override Backbone.View here
 */

Backbone.View = Backbone.View.extend({
  /*
    To use, add a property to the view called templates - key is template name, value is the ID of the script tag containing it e.g.
   templates : {
     pluginSetup : '#pluginSetup',
   }

   to use the pluginSetup template in a view, the compiled version becomes $(templateName), e.g.
   this.view.$pluginSetup();
   */
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