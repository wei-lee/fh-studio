var App = App || {};
App.View = App.View || {};

App.View.CMSImport = App.View.CMSModalProgress.extend({
  op : 'Import', //TODO here
  auditMessage : 'imported',
  buttonText : "Done!",
  mockMessages : [
    "Resolving CMS entries",
    "Validating data structure",
    "Exporting sections",
    "Reticulating Splines",
    "CMS data imported successfully"
  ],
  initialize: function(options){
    this.templates = _.extend(this.constructor.__super__.templates, {
      'cms_importModal' : '#cms_importModal'
    });
    this.compileTemplates();
    this.constructor.__super__.initialize.apply(this, arguments);
    this.text = $(this.templates.$cms_importModal());
  },
  render : function(){
    this.constructor.__super__.render.apply(this, arguments);
    return this;
  }
});