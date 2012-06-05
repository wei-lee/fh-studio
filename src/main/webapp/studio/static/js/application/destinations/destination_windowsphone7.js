application.DestinationWindowsphone7 = application.DestinationGeneral.extend({
  init: function(dest_id){
    this._super(dest_id);   
  },
  
  'export': function(){
      Log.append("Windowsphone7 :: Export");
      this.doAsyncExport();
  },
  
  'publish': function(){
    Log.append("Publish :: " + this.destination_id);
    var main_container = $('#manage_publish_container');
    main_container.find(".dashboard-content").hide();
    this.enableButton(main_container.find("#app_windowsphone7_build_debug"), "debug", "You can build debug version of the app.");
    this.enableButton(main_container.find("#app_windowsphone7_build_release"), "release", "You can build release version of the app. ");
    main_container.find('#app_publish_' + this.destination_id + '_build').show();
    main_container.find("#app_publish_" + this.destination_id).show();
  },
  
  getExportData: function(wizard, export_version_id){
	  var version = wizard.find( export_version_id + ' input:checked').val();
      var data = {generateSrc: true, config: 'debug', version: version};
      return data;
  },
  
  getPublishData: function(config, version_select, wizard) {
      var version = version_select.find("input:checked").val();
      var data = {config: config, generateSrc: false, version: version};
      return data;
  }
})