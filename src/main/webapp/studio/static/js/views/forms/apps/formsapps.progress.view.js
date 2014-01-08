App = App || {};
App.View = App.View || {};

App.View.FormModalProgress = App.View.Forms.extend({
  templates : {
    'forms_progress' : '#forms_progress'
  },
  initialize: function(options){
    debugger;
    options = options || {};
    this.mode = options.mode || 'dev';
    this.compileTemplates();
  },
  render : function(){
    var self = this,
    container = $('<div></div>');

    this.progress = $(this.templates.$forms_progress({ operation : "Create App Progress" }));
    this.progress.hide();
    container.append(this.text, this.progress);

    this.modal = new App.View.Modal({
      title: 'Create App Progress',
      autoHide : false,
      body: container,
      okText: "OK",
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
console.log('formsmodalprgress: doOperation() -- i: ', i);
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
        //App.dispatch.trigger("appforms.audit", "Create App " + self.auditMessage);
      }
    }, 1000);
  },
  ok : function (e) {
    if (this.done===true){
      return $.proxy(this.modal.close(), this.modal);
    }
    this.text.hide();
    this.progress.show();
    this.doOperation();
  }
});
