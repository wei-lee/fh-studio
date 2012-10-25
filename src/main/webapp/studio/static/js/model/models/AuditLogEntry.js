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
    column_title: "StoreItem Title"
  },{
    field_name: "userId",
    column_title: "User Email"
  },{
    field_name: "deviceId",
    column_title: "Device"
  },{
    field_name: "storeItemBinaryGuidType",
    column_title: "StoreItem Type"
  },{
    field_name: "storeItemBinaryVersion",
    column_title: "StoreItem Version"
  },{
    field_name: "sysCreated",
    column_title: "Created"
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
  },{
    field_name: "sysGroupFlags",
    visible: false,
    column_title: "Group Flags"
  },{
    field_name: "sysGroupList",
    visible: false,
    column_title: "Group List"
  },{
    field_name: "sysModified",
    visible: false,
    column_title: "Last Modified At"
  },{
    field_name: "sysShardPoint",
    visible: false,
    column_title: "Shard"
  },{
    field_name: "sysVersion",
    visible: false,
    column_title: "Sys Version"
  },{
    field_name: "userGuid",
    visible: false,
    column_title: "User Id"
  }],

  init: function() {
    if (window.location.search.match(/mock=audit_log/)) {
      var ppl = this.postProcessList;
      var self = this;
      // mocks
      var dummyList = { "list":[
        {
//      "fields":{
          "deviceId":"C322323DFDA24907A630033E792B1D11",
          "domain":"testing",
          "storeItemBinaryGuid":"NSCzA4t3Gl7xETCyJ3Jr0XaM",
          "storeItemBinaryGuidType":"android",
          "storeItemBinaryVersion":"storeItemBinaryVersion1",
          "storeItemGuid":"",
          "storeItemTitle":"Store Item Title1",
          "sysCreated":"2012-10-20 18:01:34:835",
          "sysGroupFlags":65695,
          "sysGroupList":"",
          "sysModified":"2012-10-20 18:01:34:835",
          "sysShardPoint":3423094815,
          "sysVersion":0,
          "userGuid":"",
          "userId":"feedhenry1.cadm@example.com",
//      },
          "guid":"n-W76vKGQ8uXGN37iHAWNJga",
          "type":"mam_AuditLog"
        },
        {
//      "fields":{
          "deviceId":"C322323DFDA24907A630033E792B1D22",
          "domain":"testing",
          "storeItemBinaryGuid":"NSCzA4t3Gl7xETCyJ3Jr0XaM",
          "storeItemBinaryGuidType":"iphone",
          "storeItemBinaryVersion":"storeItemBinaryVersion2",
          "storeItemGuid":"",
          "storeItemTitle":"Store Item Title2",
          "sysCreated":"2012-10-20 18:03:10:435",
          "sysGroupFlags":65695,
          "sysGroupList":"",
          "sysModified":"2012-10-20 18:03:10:436",
          "sysShardPoint":2400826183,
          "sysVersion":0,
          "userGuid":"",
          "userId":"feedhenry2.cadm@example.com",
//      },
          "guid":"YlanGw_DNW7zK5OAZ4ZsPVN1",
          "type":"mam_AuditLog"
        }
      ],
        "status":"ok"
      };

      this.postProcessList = function (res, data_model) {
        return ppl.call(self, dummyList, data_model, self.field_config);
      };

    }

  },

  list: function(success, fail, post_process) {
    var url = Constants.ADMIN_AUDIT_LOG_LIST_URL.replace('<domain>', $fw.getClientProp('domain'));
    var params = {};

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }

  }

});
