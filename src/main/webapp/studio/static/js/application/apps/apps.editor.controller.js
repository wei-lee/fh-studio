var Apps = Apps || {};

Apps.Editor = Apps.Editor || {};

Apps.Editor.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    editor_files_container: "#editor_files_container"
  },

  container: null,
  showPreview: true,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    var pleaseWaitText = $fw.client.lang.getLangString('please_wait_text');
    var scmTriggerButtonText = $fw.client.lang.getLangString('scm_trigger_button_text');

    // Set up scm trigger button in editor
    var scmTriggerButtonEditor = $('#scm_trigger_button_editor');
    scmTriggerButtonEditor.text(scmTriggerButtonText).bind('click', function () {
      scmTriggerButtonEditor.attr('disabled', 'disabled').text(pleaseWaitText);
      $fw.client.app.triggerScm(function () {
        $fw_manager.app.loadAppFiles($fw_manager.data.get('app').guid);
        $fw.client.preview.show();
        $fw_manager.client.editor.reloadFiles();
      },
      $.noop,
      function () {
        scmTriggerButtonEditor.removeAttr('disabled').text(scmTriggerButtonText).removeClass('ui-state-hover');
      });
    });
    
    console.log('setupEditorFileset');
    $fw_manager.client.editor.setup();
    var git_mode = $fw.data.get('git_mode');
    if (null === $fw_manager.app.treeviewManager && !git_mode) {
      $fw_manager.app.loadAppFiles($fw_manager.data.get('app').guid);
    }
  },

  show: function(){
    this._super();
    
    this.initFn();
    
    this.hide();
    this.container = this.views.editor_files_container;
    $(this.container).show();
  }

});