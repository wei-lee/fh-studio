model.Environment = model.Model.extend({

  // Model config
  config: {},
  // Field config
  field_config: [
    {
      field_name: "name",
      column_title: "Environment Variable",
      "width": "20%"
    },
    {
      field_name: "devValue",
      column_title: "Dev",
      "width": "30%"
    },
    {
      field_name: "liveValue",
      column_title: "Live",
      "width": "30%"
    },
    {
      field_name: "sysCreated",
      visible: false,
      column_title: "Created"
    },
    {
      field_name: "sysVersion",
      visible: false,
      column_title: "version"
    },
    {
      field_name: "sysModified",
      visible: false,
      column_title: "Modified"
    },
    {
      field_name: "guid",
      visible: false,
      column_title: "Env ID"
    }
    ],

  init: function() {
    _.bindAll(this);

    // wrap post process list to add null to default value
    this.postProcessList = _.wrap(this.postProcessList, function (func,res, data_model, fieldConfig,defValue){
      return func(res, data_model, fieldConfig, defValue === undefined  ? null : defValue);
    });
  },

  /**
   * create a new env var
   * @param app the application id
   * @param name the name of the variable
   * @param devValue the value of the variable
   * @param liveValue the value of the variable
   * @param success callback
   * @param fail callback
   * @return {*}
   */
  create: function(app, name, devValue,  liveValue,  success, fail) {
    var url = Constants.ENVIRONMENT_TARGET_CREATE_URL;
    var params = {"appId": app,"name": name};
    if(devValue != null) {
      params.devValue = devValue;
    }
    if(liveValue != null) {
      params.liveValue = liveValue;
    }
    return this.serverPost(url, params, success, fail, true);
  },

  /**
   * update an existing env var
   * @param app the application id
   * @param id the env var guid
   * @param name the name of the variable
   * @param devValue the value of the variable in the dev environment. if null then don't push this value.
   * @param liveValue the value of the variable in the live environment. if null then don't push this value.
   * @param success callback
   * @param fail callback
   * @return {*}
   */
  update: function(app, id, name, devValue,liveValue,  success, fail) {
    var url = Constants.ENVIRONMENT_TARGET_UPDATE_URL;
    var params = {"appId": app,"envVarId": id,"name": name};
    if(devValue != null) {
      params.devValue = devValue;
    }
    if(liveValue != null) {
      params.liveValue = liveValue;
    }
    return this.serverPost(url, params, success, fail, true);
  },

  /**
   * remove an env var
   * @param app the application id
   * @param id env var id
   * @param success callback
   * @param fail callback
   * @return {*}
   */
  remove: function(app, envVarIds, success, fail) {
    var url = Constants.ENVIRONMENT_TARGET_DELETE_URL;
    var params = {"appId": app,"envVarIds": envVarIds};
    return this.serverPost(url, params, success, fail, true);
  },

  /**
   * read the value of an env var
   * @param app the application id
   * @param id the env id
   * @param name the env name
   * @param success callback
   * @param fail callback
   * @return {*}
   */
  read: function(app, id, name,success, fail) {
    var url = Constants.ENVIRONMENT_TARGET_READ_URL;
    var params = {"appId": app,"envVarId": id};
    return this.serverPost(url, params, success, function (status, statusText) {
      if ('function' === typeof fail) {
        return fail('' + status + ':' + statusText);
      }
    }, true);
  },

  /**
   * read all the env vars
   * @param app the application id
   * @param success callback
   * @param fail callback
   * @param post_process function to process the results
   * @return {*}
   */
  list: function(app, success, fail, post_process) {
    var params = {"appId": app};
    var url = Constants.ENVIRONMENT_TARGET_LISTFORAPP_URL;
    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },

  /**
   * read all the deployed env vars
   * @param app the application id
   * @param env the environment
   * @param success callback
   * @param fail callback
   * @param post_process function to process the results
   * @return {*}
   */
  listDeployed: function(app, env,success, fail, post_process) {
    var params = {"appId": app, env:env};
    var url = Constants.ENVIRONMENT_TARGET_LIST_DEPLOYED_URL;
    if (post_process) {
      return this.serverPost(url, params, success, fail, true);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },

  /**
   * push the env vars to the environment
   * @param app the application id
   * @param env the environment
   * @param success callback
   * @param fail callback
   * @return {*}
   */
  push: function(app, env, success, fail) {
    var params = {"appId": app,env:env};
    var url = Constants.ENVIRONMENT_TARGET_PUSH_URL;
    return this.serverPost(url, params, success, fail, true);
  },

  unset: function(app, env, envVarIds, success, fail){
    var params = {"appId": app, "envVarIds": envVarIds};
    if(env == "live"){
      params.liveValue = true;
    } else {
      params.devValue = true;
    }
    var url = Constants.ENVIRONMENT_TARGET_UNSET_URL;
    return this.serverPost(url, params, success, fail, true);
  }



});
