var App = App || {};
App.View = App.View || {};

App.View.CMSImportExportCopy = App.View.CMS.extend({
  templates : {
    'cms_importModal' : '#cms_importModal',
    'cms_exportModal' : '#cms_exportModal',
    'cms_copyModal' : '#cms_copyModal',
    'cms_progress' : '#cms_progress'
  },
  mockImportMessages : [
    "Resolving CMS entries",
    "Validating data structure",
    "Exporting sections",
    "Reticulating Splines",
    "CMS data exported successfully"
  ],
  mockExportMessages : [
    "Collecting assets",
    "Validating data structure",
    "Importing sections",
    "Reticulating Splines",
    "CMS data imported successfully"
  ],
  mockCopyMessages : [
    "Collecting assets",
    "Validating data structure",
    "Copying sections",
    "Reticulating Splines",
    "CMS data copied successfully"
  ],
  initialize: function(options){
    this.view = options.view;
    this.mode = options.mode;
    this.compileTemplates();
  },
  render : function(){
    var self = this,
    container = $('<div></div>'),
    text, op, progress, copyArgs;
    switch(this.view){
      case "import":
        text = $(this.templates.$cms_importModal());
        op = 'Import';

      case "export":
        text = $(this.templates.$cms_exportModal());
        op = 'Export';
        break;
      case "copy":
        copyArgs = (this.mode==='live') ? { left : 'dev', right : 'live' } : { left : 'live', right : 'dev' };
        text = $(this.templates.$cms_copyModal(copyArgs));
        op = 'Copy';
        break;
    }
    progress = $(this.templates.$cms_progress({ operation : op }));
    progress.hide();
    container.append(text, progress);


    this.modal = new App.View.Modal({
      title: op + ' CMS Data',
      autoHide : false,
      body: container,
      okText: op,
      ok: function (e) {
        if (self.done===true){
          $.proxy(self.modal.close(), self.modal);
        }
        text.hide();
        progress.show();
        self.doOperation();
      }
    });
    self.$el.append(this.modal.render().$el);
    return this;
  },
  doOperation : function(){
    var buttonText, mockMessages, auditMessage;

    switch(this.view){
      case "import":
        mockMessages = this.mockImportMessages;
        auditMessage = 'imported';
        buttonText = "Done!";
        break;
      case "export":
        mockMessages = this.mockExportMessages;
        auditMessage = 'exported';
        buttonText = "Download &raquo;";
        break;
      case "copy":
        mockMessages = this.mockCopyMessages;
        auditMessage = 'copied to ' + this.mode;
        buttonText = "Done!";
        break;
    }

    this.$el.find('#modal-cancel').remove();
    this.$el.find('#modal-ok').html(buttonText).attr('disabled', true);
    this.$el.find('.progress').addClass('progress-striped');
    var self = this,
    i = 0,
    interval = setInterval(function(){
      var msg = mockMessages[i],
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
        App.dispatch.trigger("cms.audit", "CMS data " + auditMessage);
      }
    }, 1000);
  }
});