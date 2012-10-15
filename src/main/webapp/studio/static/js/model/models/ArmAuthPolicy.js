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

  create:function (policyId, policyType, configurations, checkUserExists, checkUserApproved, users, success, fail) {
    var params = {};
    params.policyId = policyId;
    params.policyType = policyType;
    params.configurations = configurations;
    params.checkUserExists = checkUserExists;
    params.checkUserApproved = checkUserApproved;
    params.users = users;
    var url = this.baseUrl + "/create";
    return this.serverPost(url, params, success, fail, true);
  },


  update:function (guid, policyId, policyType, configurations, checkUserExists, checkUserApproved, users, success, fail) {
    var params = {};
    params.guid = guid;
    params.policyId = policyId;
    params.policyType = policyType;
    params.configurations = configurations;
    params.checkUserExists = checkUserExists;
    params.checkUserApproved = checkUserApproved;
    params.users = users;
    var url = this.baseUrl + "/update";
    return this.serverPost(url, params, success, fail, true);
  },

  remove:function (policyId, success, fail) {
    var self = this;
    // need to look up the guid of the policy being delete.. bit clunky this.. 
    this.read(policyId, function(policy){
      var params = {};
      params.guid = policy.guid;
      var url = self.baseUrl + "/delete";
      return self.serverPost(url, params, success, fail, true);      
    }, fail);
  },
  
 
  list: function(success, fail, post_process) {
    if (post_process){          
      post_process = this.postProcessList;
    }
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

  getConfig:function (success, fail) {
    var url = Constants.ARM_URL_PREFIX + "getAuthCallbackUrl";
    return this.serverPost(url, {}, success, fail);
  }
});