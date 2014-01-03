var $fw = $fw || {};
$fw.getUserProp = $fw.getUserProp || function(prop){
  if (prop === "roles"){
    return ["devadmin", "sub", "formsadmin", "formsviewer", "dev", "portaladmin", "formseditor", "analytics"];
  }
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


// This block for MOCK data
App.Collection.Form.prototype.url = 'json/forms.json';
App.Collection.FormThemes.prototype.url = 'json/themes.json';
App.Model.FormBase.prototype.fetch = function(options){
  return options.success(this.collection.at(0));
};
// End block for MOCK data


// This block for LIVE data
//$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
//  options.url = options.url.replace(/\b.*?api\/v2/, 'https://testing.feedhenry.me/api/v2')
//  options.headers = options.headers || {};
//  options.headers['x-fh-auth-user'] = '5e37dd4f6fa26b42c1d8f455d602542bb8853c7e' // User api key header. Will require a preflight request from the browser with a Access-Control-Request-Headers header set.
//});
// End block for LIVE data