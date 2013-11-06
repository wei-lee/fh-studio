App = App || {};
App.View = App.View || {};

App.View.CMSCopy = App.View.CMSModalProgress.extend({
  op : 'Copy',
  buttonText : "Done!",
  mockMessages : [
    "Collecting assets",
    "Validating data structure",
    "Copying sections",
    "Reticulating Splines",
    "CMS data copied successfully"
  ],
  initialize: function(options){
    this.templates = _.extend(this.constructor.__super__.templates, {
      'cms_copyModal' : '#cms_copyModal'
    });
    this.auditMessage = 'copied to ' + this.options.mode;
    this.compileTemplates();
    this.constructor.__super__.initialize.apply(this, arguments);
    var copyArgs = (this.options.mode==='dev') ? { left : 'dev', right : 'live' } : { left : 'live', right : 'dev' };
    this.text = $(this.templates.$cms_copyModal(copyArgs));
  },
  render : function(){
    this.constructor.__super__.render.apply(this, arguments);
    return this;
  }
});
