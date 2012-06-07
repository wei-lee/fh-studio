application.AppsAccordionManager = application.AccordionManager.extend({

  init: function (accordion_name) {
    this._super('manage_apps_accordion');
    debugger;
  },
  
  preSelectManageExport: function () {
    $fw_manager.app.setupAppGeneration(true);
  },

  preSelectManagePublish: function () {
    $fw_manager.app.setupAppGeneration(false);
  },

  preSelectConfigurationStudio: function () {
    $fw_manager.client.config.studio.show();
  },
  
  preSelectConfigurationEmbed: function () {
    $fw_manager.client.config.embed.show();
  },
  
  preSelectConfigurationAndroid: function () {
    $fw_manager.client.config.android.show();
  },

  preSelectConfigurationIphone: function () {
    $fw_manager.client.config.iphone.show();
  },

  preSelectConfigurationIpad: function () {
    $fw_manager.client.config.ipad.show();
  },
  
  preSelectConfigurationIos: function () {
	 $fw_manager.client.config.ios.show();
  },

  preSelectConfigurationFacebook: function () {
    $fw_manager.client.config.facebook.show();
  },
  
  preSelectConfigurationBlackberry: function () {
    $fw_manager.client.config.blackberry.show();
  },
  
  preSelectConfigurationWindowsphone7: function () {
    $fw_manager.client.config.windowsphone7.show();
  },
  
  preSelectConfigurationNokiawrt: function () {
    $fw_manager.client.config.nokiawrt.show();
  },

  preSelectReportApp: function(id, container) {
  	$fw.client.report.show(id, container);
  },
  
  postSelectReportApp: function(id, container) {
   Log.append("postSelectReportApp id: " + id);
  },
  
  preSelectReportStartupsdate: function (id, container) {
  	$fw.client.report.show('appstartupsdest', 'line', id, container);
  },
 
  preSelectReportStartupsdest: function(id, container) {
  	$fw.client.report.show('appstartupsdest', 'pie', id, container);
  },
  
  preSelectReportStartupsloc: function(id, container) {
  	$fw.client.report.show('appstartupsgeo', 'geo', id, container);
  },
  
  preSelectReportInstallsdate: function (id, container) {
  	$fw.client.report.show('appinstallsdest', 'line', id, container);
  },
 
  preSelectReportInstallsdest: function(id, container) {
  	$fw.client.report.show('appinstallsdest', 'pie', id, container);
  },
  
  preSelectReportInstallsloc: function(id, container) {
  	$fw.client.report.show('appinstallsgeo', 'geo', id, container);
  },
  
  postSelectEditorFiles: function () {
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
    
    Log.append('setupEditorFileset');
    $fw_manager.client.editor.setup();
    var git_mode = $fw.data.get('git_mode');
    if (null === $fw_manager.app.treeviewManager && !git_mode) {
      $fw_manager.app.loadAppFiles($fw_manager.data.get('app').guid);
    }
  },
  
  postSelectManageDetails: function () {
    if ($fw.client.needsSetup('manage_details')) {
      var pleaseWaitText = $fw.client.lang.getLangString('please_wait_text');
      var scmTriggerButtonText = $fw.client.lang.getLangString('scm_trigger_button_text');

      // setup update details button
      var updateButtonText = $fw.client.lang.getLangString('manage_details_update_button_text'),
          updateButton = $('#manage_details_update_button');
      updateButton.text(updateButtonText).bind('click', function () {
        updateButton.attr('disabled', 'disabled').text(pleaseWaitText);
        $fw_manager.client.app.doUpdate(function () {
          updateButton.removeAttr('disabled').text(updateButtonText).removeClass('ui-state-hover');
        });
      });
      
      // also enable the scm trigger button
      var scmTriggerButton = $('#scm_trigger_button');      
      scmTriggerButton.text(scmTriggerButtonText).bind('click', function () {
        scmTriggerButton.attr('disabled', 'disabled').text(pleaseWaitText);
        $fw.client.app.triggerScm(function () {
          $fw.client.preview.show();
          $fw_manager.client.editor.reloadFiles();
        }, 
        $.noop,
        function () {
          scmTriggerButton.removeAttr('disabled').text(scmTriggerButtonText).removeClass('ui-state-hover');
        });
      });
    }
    Log.append('updateAppDetails');
    $fw_manager.client.app.updateDetails();
  },

  postSelectManageFrameworks: function(){
  	if($fw.client.needsSetup('manage_frameworks')){
  		$('#manage_frameworks_update_button').bind('click', function(){
  		  	$fw_manager.client.app.doUpdateFrameworks();
  		})
  	}
  	$fw_manager.client.app.showCurrentFrameworks();
  },

  postSelectManageIcons: function () {
    var container = $('#manage_icons_body');
    $fw_manager.client.icon.setContainer(container);
    $fw_manager.client.icon.showIcons($fw_manager.data.get('inst').guid);
  },

  postSelectDebugLogging: function () {
    $fw_manager.client.debug.show('log');
  },
  
  postSelectStaging: function () {
    $fw_manager.client.staging.show();
  },

  postSelectStatus: function () {
    $fw_manager.client.status.show();
  },

  preSelectPreviewConfiguration: function () {
    $fw_manager.client.config.preview.show();
  },
  
  postSelectPushUrbanairship: function() {
  	if(!$fw_manager.client.push_manager){
  		$fw_manager.client.push_manager = new application.PushNotificationManager();
  	};
  	$fw_manager.client.push_manager.loadSettings();
  },
  
  getSelectedItemKey: function () {
    return this.name + '_' + ($fw_manager.data.get('template_mode') ? 'template' : 'app');
  }
  
});