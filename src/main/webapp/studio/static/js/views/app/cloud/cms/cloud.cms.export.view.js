var App = App || {};
App.View = App.View || {};

App.View.CMSExport = App.View.CMS.extend({
  templates : {
    'cms_exportModal' : '#cms_exportModal',
  },
  initialize: function(options){
    this.compileTemplates();
  },
  render : function(){
    var self = this;

    this.modal = new App.View.Modal({
      title: 'Export CMS Data',
      body: this.templates.$cms_exportModal(),
      okText: 'Export',
      ok: function (e) {
        //TODO: Show progress
      }
    });
    self.$el.append(this.modal.render().$el);
    return this;
  }
});