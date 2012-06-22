var AjaxCaller = function(init_params){
  var self = {
    default_params : {
      async: true,
      dataType: 'json',
      timeout: 20000,
      cache: false,
      contentType: 'text/plain'
    },
    
    init: function(){
      var ajax_params = $.extend({}, self.default_params, init_params||{});
      $.ajaxSetup(ajax_params);
    },
    
    doAjaxRequest: function(method, url, params, success, fail){
      $.ajax({
        type: method,
        url: url,
        data: JSON.stringify(params),
        success: function(res){
          if(success){
            success(res);
          }
        },
        error: function(xhr, status){
          // Handle all possible status codes
          if ('error' === status || 'timeout' === status) {
            if(fail){
              try {
                fail(xhr.status, xhr.statusText);
              }
              catch (e) {
                // Need to handle issues this way too for exceptions e.g. Invalid State
                if(fail){
                  Log.append(e);
                  fail(e.code, e.message);
                }
              }
            }
          }
          else {
            if(fail){
              fail(0, status);
            }
          }
        }
      });
    }
  };
  
  self.init();
  return {
    doAjaxRequest: self.doAjaxRequest
  };
};