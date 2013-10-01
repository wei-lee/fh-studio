var App = App || {};
App.View = App.View || {};

App.View.CMSImport = App.View.CMS.extend({
  templates : {
    'cms_importModal' : '#cms_importModal'
  },
  initialize: function(options){
    this.compileTemplates();
  },
  render : function(){
    var self = this;

    this.modal = new App.View.Modal({
      title: 'Import CMS Data',
      body: this.templates.$cms_importModal(),
      okText: 'Import',
      ok: function (e) {
        //TODO: Show progress
      }
    });
    self.$el.append(this.modal.render().$el);
    return this;
  }
});