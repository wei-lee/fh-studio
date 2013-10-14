var App = App || {};
App.View = App.View || {};

App.View.CMSModalProgress = App.View.CMS.extend({
  templates : {
    'cms_progress' : '#cms_progress'
  },
  initialize: function(options){
    options = options || {};
    this.mode = options.mode || 'dev';
    this.compileTemplates();
  },
  render : function(){
    var self = this,
    container = $('<div></div>');

    this.progress = $(this.templates.$cms_progress({ operation : this.op }));
    this.progress.hide();
    container.append(this.text, this.progress);

    this.modal = new App.View.Modal({
      title: this.op + ' CMS Data',
      autoHide : false,
      body: container,
      okText: this.op,
      ok: $.proxy(this.ok, this)
    });
    self.$el.append(this.modal.render().$el);
    return this;
  },
  doOperation : function(){
    this.$el.find('#modal-cancel').remove();
    this.$el.find('#modal-ok').html(this.buttonText).attr('disabled', true);
    this.$el.find('.progress').addClass('progress-striped');
    var self = this,
    i = 0,
    interval = setInterval(function(){
      var msg = self.mockMessages[i],
      percentComplete = ((i+1) * 2) * 10;
      self.$el.find('textarea').append(msg + '\n');
      self.$el.find('.progress .bar').width(percentComplete + '%');
      i++;
      if (i===5){
        //Done!
        self.done = true;
        clearInterval(interval);
        self.$el.find('#modal-ok').attr('disabled', false);
        self.$el.find('.progress').removeClass('progress-striped').addClass('progress-success');
        App.dispatch.trigger("cms.audit", "CMS data " + self.auditMessage);
      }
    }, 1000);
  },
  ok : function (e) {
    if (this.done===true){
      $.proxy(this.modal.close(), this.modal);
    }
    this.text.hide();
    this.progress.show();
    this.doOperation();
  }
});