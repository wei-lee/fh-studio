var App = App || {};
App.View = App.View || {};

App.View.CMSPublish = App.View.CMSModalProgress.extend({
  op : 'Publish',
  buttonText : "Done",
  mockMessages : [
    "Collecting drafts",
    "Validating draft structure",
    "Publishing drafts",
    "Reticulating Splines",
    "CMS data published successfully"
  ],
  initialize: function(options){
    this.templates = _.extend(this.constructor.__super__.templates, {
      'cms_publishModal' : '#cms_publishModal'
    });
    this.auditMessage = 'published to ' + this.options.mode;
    this.compileTemplates();
    this.constructor.__super__.initialize.apply(this, arguments);
    this.text = $(this.templates.$cms_publishModal());
  },
  render : function(){
    this.constructor.__super__.render.apply(this, arguments);
    return this;
  }
});