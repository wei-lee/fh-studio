App.Collection.Form.prototype.url = 'json/forms.json';
App.Collection.FormThemes.prototype.url = 'json/themes.json';
App.Model.FormBase.prototype.fetch = function(options){
  return options.success(this.collection.at(0));
};
Backbone.View.prototype.compileTemplates = function() {
  if (!this.templates){
    throw new Error('Error: compileTemplates called on view with no templates defined');
  }
  for (var key in this.templates){
    if (this.templates.hasOwnProperty(key)){
      var tpl = this.templates[key],
      html;
      // Only do HTML lookups on string selectors, not already compiled templates
      if (typeof tpl === 'string' && tpl[0] === '#'){
        html = $(tpl, this.$container).html();
        if (!html){
          throw new Error("No html found for " + key);
        }
        this.templates['$' + key] = Handlebars.compile(html);
      }
    }
  }
  //this.templates = templates;
};