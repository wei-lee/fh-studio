model.CloudPlugin = model.Model.extend({
  field_config: [
    {
      field_name: 'name',
      column_title: 'Name',
      width: '250px'
    },
    {
      field_name: 'desc',
      column_title:'Description'
    }
  ],

  list_rows_key: 'plugins',

  init: function(){
    this._super();
  },

  list: function(appGuid, success, fail){
    var url = Constants.LOGS_URL; // TODO Make a plugins endpoint..
    // Future proofing..
    var params = {guid: appGuid, action: "list"};

    if (post_process != null) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },
  /*
   * Will read the configuration of a cloud plugin
   */
  read: function(success, fail, appGuid, deployTarget, logName){
    var url = Constants.LOGS_URL;
    var params = {guid: appGuid, deploytarget: deployTarget, action: 'get'};
    if(logName){
      params.logname = logName;
    }
    return this.serverPost(url, params, success, fail, true);
  }
});