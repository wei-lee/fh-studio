App = App || {};
App.View = App.View || {};

App.View.CMSExport = App.View.CMSModalProgress.extend({
  op : 'Import', //TODO here
  auditMessage : 'exported',
  buttonText : "Download &raquo;",
  mockMessages : [
    "Collecting assets",
    "Validating data structure",
    "Importing sections",
    "Reticulating Splines",
    "CMS data exported successfully"
  ],
  initialize: function(options){
    this.templates = _.extend(this.constructor.__super__.templates, {
      'cms_exportModal' : '#cms_exportModal'
    });
    this.compileTemplates();
    this.constructor.__super__.initialize.apply(this, arguments);
    this.text = $(this.templates.$cms_exportModal());
  },
  render : function(){
    this.constructor.__super__.render.apply(this, arguments);
    return this;
  }
});
