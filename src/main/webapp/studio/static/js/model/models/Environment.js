model.Environment = model.Model.extend({

  // Model config
  config: {},
  // Field config
  field_config: [
    {
      field_name: "name",
      column_title: "Name"
      },
    {
      field_name: "value",
      column_title: "Value"
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
    }],

  init: function() {
    _.bindAll(this);
  },

  /**
   * create a new env var
   * @param app the application id
   * @param env one of dev or live
   * @param name the name of the variable
   * @param value the value of the variable
   * @param success callback
   * @param fail callback
   * @return {*}
   */
  create: function(app, env , name, value,  success, fail) {
    var url = Constants.ENVIRONMENT_TARGET_CREATE_URL;
    var params = {"appId": app,"env": env,"name": name, "value":value};
    return this.serverPost(url, params, success, fail, true);
  },

  /**
   * update an existing env var
   * @param app the application id
   * @param id the env var guid
   * @param name the name of the variable
   * @param value the value of the variable
   * @param success callback
   * @param fail callback
   * @return {*}
   */
  update: function(app, id, name, value,  success, fail) {
    var url = Constants.ENVIRONMENT_TARGET_UPDATE_URL;
    var params = {"appId": app,"envVarId": id,"name": name, "value":value};
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
  remove: function(app, id, success, fail) {
    var url = Constants.ENVIRONMENT_TARGET_DELETE_URL;
    var params = {"appId": app,"envVarId": id};
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
   * @param env one of dev or live
   * @param success callback
   * @param fail callback
   * @param post_process function to process the results
   * @return {*}
   */
  list: function(app, env, success, fail, post_process) {
    var params = {"appId": app,"env": env};
    var url = Constants.ENVIRONMENT_TARGET_LISTFORAPP_URL;
    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  }



});
