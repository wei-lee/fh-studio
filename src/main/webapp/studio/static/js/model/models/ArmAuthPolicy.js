model.ArmAuthPolicy = model.Model.extend({
  // Model config
  config: {},

  baseUrl:Constants.ADMIN_URL_PREFIX + "authpolicy",

  // Field config
  field_config: [{
    field_name: "policyId",
    editable: false,
    showable: true,
    column_title: "Policy Id"
  }, {
    field_name: "policyType",
    editable: true,
    showable: true,
    column_title: "Type"
  }],

  init: function() {

  },

  create:function (policyId, policyType, configurations, checkUserExists, success, fail) {
    var params = {};
    params.policyId = policyId;
    params.policyType = policyType;
    params.configurations = configurations;
    params.checkUserExists = checkUserExists;
    var url = this.baseUrl + "/create";
    return this.serverPost(url, params, success, fail, true);
  },


  update:function (guid, policyId, policyType, configurations, checkUserExists, success, fail) {
    var params = {};
    params.guid = guid;
    params.policyId = policyId;
    params.policyType = policyType;
    params.configurations = configurations;
    params.checkUserExists = checkUserExists;
    var url = this.baseUrl + "/update";
    return this.serverPost(url, params, success, fail, true);
  },

  remove:function (guid, success, fail) {
    var params = {};
    params.guid = guid;
    var url = this.baseUrl + "/delete";
    return this.serverPost(url, params, success, fail, true);
  },
  
 
  list: function(success, fail, post_process) {
    if (post_process)
      post_process = this.postProcessList;
    var url = this.baseUrl + "/list";
    return this.serverPost(url, {}, success, fail, false, post_process, this);
  },

  read: function(policyId, success, fail) {
    var params = {
      policyId: policyId
    };
    var url = this.baseUrl + "/read";
    return this.serverPost(url, params, success, fail, true);
  },

 // TODO DB - fix this..
  getConfig:function (success, fail) {
    var url = Constants.ARM_URL_PREFIX + "getAuthCallbackUrl";
    return this.serverPost(url, {}, success, fail);
  }
});