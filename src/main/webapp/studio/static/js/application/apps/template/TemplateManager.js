application.TemplateManager = Class.extend({
  
  init: function () {
    this.initTemplateCloneButton();
  },
  
  doView: function (guid) {
    console.log('template.doView');
    $fw_manager.data.set('template_mode', true);
    $fw_manager.client.app.doShowManage(guid);
  },
  
  doClone: function (guid) {
    console.log('template.doClone');
    $fw_manager.client.app.doClone(guid);
  },
  
  
  /*
   * Hide any component or button that isn't relevant to templates,
   * and unbind/block anything that can't be hidden and isn't relevant to templates 
   */
  applyPreRestrictions: function () {
    console.log('applying template restrictions');
    $('.template-restriction').hide();
  },
  
  applyPostRestrictions: function () {
    // show the template app message
    $('#template_message').show();
  },
  
  /*
   * Exact opposite of applyPreRestrictions
   */
  removePreRestrictions: function () {
    console.log('removing template restrictions');
    $('.template-restriction').show();
  },
  
  removePostRestrictions: function () {
    // hide the template app message
    $('#template_message').hide();

  },
  
  initTemplateCloneButton: function () {
    $('#template_clone_button').unbind().bind('click', function () {
      $fw.client.app.doClone($fw.data.get('inst').guid);
    });
  }
});