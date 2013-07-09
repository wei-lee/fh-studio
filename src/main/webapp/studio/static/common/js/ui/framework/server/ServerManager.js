// TODO: move to IDE js, not generic
ServerManager = function (ajax_caller, opts) {
  var self = {
    init: function () {
      self.opts = opts || {};
      
      self.ajax_caller = ajax_caller || new AjaxCaller();
    },
    
    setOpts: function (new_opts) {
      self.opts = new_opts;
    },

    get: function (url, params, success, fail, no_payload, timeout) {
      self.ajax('GET', url, params, success, fail, no_payload, timeout);
    },

    post: function (url, params, success, fail, no_payload, timeout) {
      //add in csrf token
      params["csrftoken"] = $('input[name="csrftoken"]').val();
      self.ajax('POST', url, params, success, fail, no_payload, timeout);
    },

    ajax: function (method, url, params, success, fail, no_payload, timeout) {
      var data = no_payload ? params : self.initRequestData(params);

        if (self.getConnected()) {
          self.ajax_caller.doAjaxRequest(method, url, data, self.success(success), self.fail(fail), timeout);
        } else {
          if ($.isFunction(self.opts.connectivity_error)) {
            self.opts.connectivity_error();
          }
        }
    },

    initRequestData: function (payload) {
      var data = {};
      data.payload = payload;
      //TODO: set the correct context
      data.context = {};
      return data;
    },

    setAjaxCaller: function (caller) {
      self.ajax_caller = caller;
    },

    success: function (orig_success) {
      return function (response) {
        if ('function' === typeof orig_success) {
          orig_success(response);
        }
      };
    },

    fail: function (orig_fail) {
      return function (status, statusText) {
        if (status >= 400 && status < 500) {
          // there was an error calling the api. we need to assertain whether it is a cookie issue.
          //would prefer to have used a 401 status code here.
          //call cookie validation if that fails reload else continue
          self.validateCookie(function (val){
           if(! val){
              if($.isFunction(self.opts.cookie_error)){
                      self.opts.cookie_error();
              }
           }
           else{
            if ($.isFunction(self.opts.client_error)) {
              self.opts.client_error(status, statusText);
            }
          }
          });

        } else if (status >= 500 && status < 600) {
          if ($.isFunction(self.opts.server_error)) {
            self.opts.server_error(status, statusText);
          }
        } else {
          if ($.isFunction(self.opts.generic_error)) {
            self.opts.generic_error(status, statusText);
          }
        }
        
        if ('function' === typeof orig_fail) {
          orig_fail(status, statusText);
        }
      };
    },

    validateCookie : function (cb){
      self.post(Constants.VALIDATE_COOKIE,{}, function (data){
        cb(data.valid);
      },function failure(err){
        console.log("failed to call the validate endpoint ");
        cb();
      });
    },

    getConnected: function () {
// TODO: re-enable this check
      //      if (navigator && 'boolean' === typeof navigator.onLine) {
//        return navigator.onLine;
//      }
      // always return true if we don't know our online status (safest)
      return true;
    },

    getCookie: function () {
      if (self.opts.cookie_name) {
        return $.cookie(self.opts.cookie_name);
      }
      // always return true if no cookie name is specified as cookies musn't matter
      return true;
    }
  };

  self.init();

  return {
    get: self.get,
    post: self.post,
    initReqestData: self.initRequestData,
    setAjaxCaller: self.setAjaxCaller,
    setOpts: self.setOpts
  };
};