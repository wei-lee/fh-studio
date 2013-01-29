model.CloudNotifications = model.Model.extend({
  
  init: function () {
    this._super();
  },

  field_config: [
    {
      field_name: 'sysCreated',
      column_title: 'When',
      width: 120
    },
    {
      field_name:'eventType',
      column_title: 'Notification Type',
      width: 100
    },
    {
      field_name:'message',
      column_title: 'Details'
    },
    {
      field_name:'guid',
      visible: false
    }
  ],

  list: function(appId, success, fail){
    var url = Constants.CLOUD_NOTIFICATIONS_LIST_URL;
    var params = {appGuid: appId, eventGroup:'NOTIFICATION'};
    var self = this;
    this.serverPost(url, params, success, fail, true, function(res, model){
      for(var i=0;i<res.list.length;i++){
        res.list[i].fields.guid = res.list[i].guid;
      }
      return self.postProcessList(res, model);
    }, this);
  },

  remove: function(appId, notiId, success, fail){
    var url = Constants.CLOUD_NOTIFICATIONS_REMOVE_URL;
    var params = {appGuid: appId, eventGuids:[notiId]};
    this.serverPost(url, params, success, fail, true);
  }
});