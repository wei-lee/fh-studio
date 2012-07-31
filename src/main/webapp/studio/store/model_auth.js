
model.Auth = model.Model.extend({
  // Model config
  config: {},

  init: function () {},

  auth: function (policyId, clientToken, params, success, fail) {
    var MAM_AUTH_URL = '/box/srv/1.1/admin/authpolicy/auth';
    deviceID = "123456789012345678901234";
    var authParams = {
      policyId: policyId,
      clientToken: clientToken,
      device: deviceID,
      params: params
    };

    return this.serverPost(MAM_AUTH_URL, authParams, success, fail, true);
  }
});
