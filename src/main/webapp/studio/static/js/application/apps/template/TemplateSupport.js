application.TemplateSupport = Class.extend({
  init: function () {
    
  },
  
  initTemplateCloneButton: function () {
    $('#template_clone_button').bind('click', function () {
      $fw_manager.client.app.doClone($fw_manager.data.get('inst').guid);
    });
  }
  
});