var App = App || {};
App.View = App.View || {};

App.View.CMSImportExport = App.View.CMS.extend({
  templates : {
    'cms_importModal' : '#cms_importModal',
    'cms_exportModal' : '#cms_exportModal',
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
  initialize: function(options){
    this.mode = options.mode;
    this.compileTemplates();
  },
  render : function(){
    var self = this,
    container = $('<div></div>'),
    text = (this.mode ==='import') ? $(this.templates.$cms_importModal()) : $(this.templates.$cms_exportModal()),
    op = (this.mode==='import') ? 'Import' : 'Export';
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
    var buttonText = (this.mode === 'import') ? "Done!" : "Download &raquo;";
    this.$el.find('#modal-cancel').remove();
    this.$el.find('#modal-ok').html(buttonText).attr('disabled', true);
    this.$el.find('.progress').addClass('progress-striped');
    var self = this,
    mockMessages = (this.mode === 'import') ? this.mockImportMessages : this.mockExportMessages,
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
      }
    }, 1000);
  }
});