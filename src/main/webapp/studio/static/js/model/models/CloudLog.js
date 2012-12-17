model.CloudLog = model.Model.extend({
  field_config: [
    {
      field_name: 'name',
      column_title: 'Name',
      width: '250px'
    },
    {
      field_name: 'modified',
      column_title:'Last Modified',
      dataType: 'date'
    },
    {
      field_name: 'size',
      column_title: 'Size',
      width: '50px'
    }
  ],

  list_rows_key: 'logs',

  init: function(){
    this._super();
  },

  list: function(success, fail, post_process, appGuid, deployTarget ){
    var url = Constants.LOGS_URL;
    var params = {guid: appGuid, deploytarget: deployTarget, action: "list"};

    if (post_process != null) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },

  read: function(success, fail, appGuid, deployTarget, logName){
    var url = Constants.LOGS_URL;
    var params = {guid: appGuid, deploytarget: deployTarget, action: 'get'};
    if(logName){
      params.logname = logName;
    }
    return this.serverPost(url, params, success, fail, true);
  },

  "delete": function(success, fail, appGuid, deployTarget, logName){
    var url = Constants.LOGS_URL;
    var params = {guid: appGuid, deploytarget:deployTarget, action: 'delete', logname: logName};
    return this.serverPost(url, params, success, fail, true);
  }
});