/*
 * All functions that interact with the server i.e. ajax, should go here 
 */
$.extend(Application, {
  
  loadAppFiles: function(guid){
    var request_data = {active: 'true', app: guid};
    $fw_manager.server.post(Constants.LIST_FILES_URL, request_data, function(res){
      $fw_manager.app.constructFileTreeView(res, guid);
    });
  },
  
  loadTextFile: function(data, success) {  	
    $fw_manager.server.post(Constants.LOAD_FILE_URL, data, success);  	
  },
  
  loadAppsGridData: function (grid_name, callback) {
    Log.append('loading grid data');    
    var url;  
    
    url = 'templates' === grid_name ? Constants.LIST_TEMPLATE_APPS_URL : Constants.LIST_APPS_URL;
    
    $fw_manager.server.post(url, {
      grid: true
    }, function (res) {
      callback(res.list);
    });
  },
  
  loadHomeGridData: function(url, data, callback){
    $fw_manager.server.post(url, data, function(data){
     callback(data);   
    })  
  }
});
