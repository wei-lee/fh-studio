/*
  Common functions used by all backbone views in FH - override Backbone.View here
 */
var App = App || {};
App.View = App.View || {};
App.View.TemplateMixins = {
  /*
    To use, add a property to the view called templates - key is template name, value is the ID of the script tag containing it e.g.
   templates : {
     pluginSetup : '#pluginSetup',
   }

   to use the pluginSetup template in a view, the compiled version becomes $(templateName), e.g.
   this.view.$pluginSetup();
   */
  compileTemplates: function() {
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
  }
};


App.View.UtilMixins = {
  "displayMessage": function(mess){
    App.View.Forms.prototype.message(mess);
  },
  updateProgressBar: function(value) {
    var progress_bar = this.progressModal.find('.progress .bar');
    progress_bar.css('width', value + '%');
    this.current_progress = value;
  },
  appendProgressLog: function(message) {
    var log_area = this.progressModal.find('textarea');
    var current = log_area.val();
    log_area.val(current + message + "\n");
    log_area.scrollTop(99999);
    log_area.scrollTop(log_area.scrollTop() * 12);
  },
  destroyProgressModal: function() {
    var self = this;

    self.progressModal.modal('hide');
    setTimeout(function() {
      self.progressModal.remove();
      self.progressModal = null;
    }, 2000);
  }
};


App.View.FormsMixins = {
  "aggregateFields" : function (){
    this.fields = [{
      "name":"select a field",
      "type" :""
    }];
    var rules = Constants.APP_FORMS.FIELD_RULES;
    if(! this.pages){
      throw new Error("no pages found aggregate fields");
    }
    for(var i=0; i < this.pages.length; i++){
      var page = this.pages.models[i];
      var pageFields = page.get("fields");
      for(var p=0; p < pageFields.length; p++){
        var fieldType = pageFields[p].type.trim();

        var repeating = pageFields[p].repeating;

        if(rules[fieldType] && Constants.APP_FORMS.EXCLUDED_FIELD_TYPES.indexOf(fieldType) == -1 && ! repeating){
          pageFields[p].rules = rules[fieldType];
          this.fields.push(pageFields[p]);
        }
      }
    }
  },
  "aggregateRepeating" : function (){
    this.repeatingFields = [{
      "name":"select a field",
      "type" :""
    }];
    for(var i=0; i < this.pages.length; i++){
      var page = this.pages.models[i];
      var pageFields = page.get("fields");
      for(var p=0; p < pageFields.length; p++){
        var fieldType = pageFields[p].type.trim();

        var repeating = pageFields[p].repeating;

        if(repeating && Constants.APP_FORMS.EXCLUDED_FIELD_TYPES.indexOf(fieldType) == -1){
          this.repeatingFields.push(pageFields[p]);
        }
      }
    }
  }
};

_.extend(App.View.Forms.prototype, App.View.TemplateMixins);
_.extend(App.View.CMS.prototype, App.View.TemplateMixins);
_.extend(App.View.CMSController.prototype, App.View.TemplateMixins);
_.extend(App.View.PluginsView.prototype, App.View.TemplateMixins);
_.extend(App.View.DataBrowserView.prototype, App.View.TemplateMixins);
_.extend(App.View.FullPageMessageView.prototype, App.View.TemplateMixins);

//forms
_.extend(App.View.SubmissionList.prototype, App.View.FormsMixins);
_.extend(App.View.Rules.prototype, App.View.FormsMixins);
_.extend(App.View.SubmissionList.prototype, App.View.UtilMixins);
_.extend(App.View.FormAppsCreateEdit.prototype, App.View.UtilMixins);
