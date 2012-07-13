model.ArmAuthPolicy = model.Model.extend({
  // Model config
  config:{},

  baseUrl:Constants.ARM_URL_PREFIX + "policy",

  // Field config
  field_config:[
    {
      field_name:"policyId",
      editable:false,
      showable:true,
      column_title:"Policy Id"
    },
    {
      field_name:"policyType",
      editable:true,
      showable:true,
      column_title:"Type"
    }
  ],

  init:function () {

  },

  create:function (policyId, policyType, configurations, users, success, fail) {
    var params = {};
    params.policyId = policyId;
    params.policyType = policyType;
    params.configurations = configurations;
    params.users = users;
    var url = this.baseUrl + "/create";
    return this.serverPost(url, params, success, fail);
  },


  update:function (policyId, policyType, configurations, users, success, fail) {
    var params = {};
    params.policyId = policyId;
    params.policyType = policyType;
    params.configurations = configurations;
    params.users = users;
    var url = this.baseUrl + "/update";
    return this.serverPost(url, params, success, fail);
  },

  list:function (success, fail) {
    var url = this.baseUrl + "/list";
    return this.serverPost(url, {}, success, fail, false, this.postProcessList, this);
  },

  read:function (policyId, success, fail) {
    var params = {policyId:policyId};
    var url = this.baseUrl + "/read";
    return this.serverPost(url, params, success, fail);
  },

  getConfig:function (success, fail) {
    var url = Constants.ARM_URL_PREFIX + "getAuthCallbackUrl";
    return this.serverPost(url, {}, success, fail);
  }
});