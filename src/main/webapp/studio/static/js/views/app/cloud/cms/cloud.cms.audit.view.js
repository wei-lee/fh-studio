var App = App || {};
App.View = App.View || {};

App.View.CMSAudit = App.View.CMS.extend({
  events: {

  },
  templates : {

  },
  audit : [],
  initialize: function(options){
    App.dispatch.on("cms.audit", $.proxy(this.log, this));
  },
  render : function(){
    var self = this;

    this.modal = new App.View.Modal({
      title: 'Audit Log',
      body: "<pre>" + this.audit.join('\n') + "</pre>",
      okText: 'Done',
      cancelText : false,
      ok: function (e) {

      }
    });
    self.$el.append(this.modal.render().$el);
    return this;
  },
  log : function(auditLog){
    this.audit.push(new Date().toString() + ": " + auditLog);
  }
});