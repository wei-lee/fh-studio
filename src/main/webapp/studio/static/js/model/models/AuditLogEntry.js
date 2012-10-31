model.AuditLogEntry = model.Model.extend({

  // Model config
  config: {},
  // TODO : check how to limit filter by to : store item , type , user and device

  // Field config
  field_config: [{
    field_name: "guid",
    visible: false,
    column_title: "AuditLogEntry ID"
  },{
    field_name: "storeItemTitle",
    column_title: "Title"
  },{
    field_name: "userId",
    column_title: "User",
    width:"350px"
  },{
    field_name: "deviceId",
    column_title: "Device",
    visible:false
  },{
    field_name: "storeItemBinaryType",
    column_title: "Type"
  },{
    field_name: "storeItemBinaryVersion",
    column_title: "Version",
    width:"110px"
  },{
    field_name: "sysCreated",
    column_title: "Date"
  },{
    field_name: "domain",
    visible: false,
    column_title: "Domain"
  },{
    field_name: "storeItemBinaryGuid",
    visible: false,
    column_title: "StoreItem Binary ID"
  },{
    field_name: "storeItemGuid",
    visible: false,
    column_title: "StoreItem ID"
  },
  {
    field_name: "userGuid",
    visible: false,
    column_title: "User Guid"
  }],

  init: function() {},

  list: function(success, fail) {
    var self = this;

    var params = {};
    return this.listLogs(success, fail, function(res, data_model) {
       //console.log(data_model);
      return self.postProcessList(res, data_model, self.field_config);
    }, params);
  },

  listLogs: function(success, fail, post_process,params) {
    var url = Constants.ADMIN_AUDIT_LOG_LIST_URL.replace('<domain>', $fw.getClientProp('domain'));
    params = params || {};
    var self = this;
    var s = success;
    success = function(res){
      self.processDate(res,"Date");
      return s(res);
    };
    if (post_process != null) {
      return this.serverPost(url, params, success, fail, true, ($.isFunction(post_process) ? post_process : this.postProcessList), this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }

  },
  processDate: function(res,title) {
    var e = $.grep(res.aoColumns,function(item, i){return item.sTitle === title;});
    var i = $(res.aoColumns).index(e[0]);
    if(i >= 0)
      $(res.aaData).each(function(index,item){item[i] = item[i].replace(/:\d+:\d+$/, "");});
  }
});