application.TemplateManager = Class.extend({
  support: null,
  
  init: function () {
    this.support = new application.TemplateSupport();
  },
  
  doView: function (guid) {
    Log.append('template.doView');
    $fw_manager.data.set('template_mode', true);
    $fw_manager.client.app.doShowManage(guid);
  },
  
  doClone: function (guid) {
    Log.append('template.doClone');
    $fw_manager.client.app.doClone(guid);
  },
  
  
  /*
   * Hide any component or button that isn't relevant to templates,
   * and unbind/block anything that can't be hidden and isn't relevant to templates 
   */
  applyPreRestrictions: function () {
    Log.append('applying template restrictions');
    $('.template-restriction').hide();
  },
  
  applyPostRestrictions: function () {
    // show the template app message
    $fw_manager.ui.getComponent($fw_manager.client.template, 'template_clone_button');
    manage_apps_layout.open('north');
  },
  
  /*
   * Exact opposite of applyPreRestrictions
   */
  removePreRestrictions: function () {
    Log.append('removing template restrictions');
    $('.template-restriction').show();
  },
  
  removePostRestrictions: function () {
    // hide the template app message
    manage_apps_layout.close('north');
  },
  
  /*
   * Support functions
   */
  
  initTemplateCloneButton: function () {
    return $fw_manager.client.template.support.initTemplateCloneButton();
  }
});