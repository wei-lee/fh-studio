application.DestinationWindowsphone = application.DestinationWindowsphone7.extend({
  init: function(dest_id){
    this._super(dest_id);   
  },

  getExportData: function(wizard, export_version_id){
    var version = "8.0";
    var data = {generateSrc: true, config: 'debug', version: version};
    return data;
  },
  
  getPublishData: function(config, version_select, wizard) {
     var version = "8.0";
     var data = {config: config, generateSrc: false, version: version};
     return data;
  }
});