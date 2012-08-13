model.Resource = model.Model.extend({
  
  init: function () {
    
  },
  
  generateCert: function (params, success, fail) {
    var url = Constants.GENERATE_CERT_URL;
    $fw.server.post(url, params, function (response) {
      if (response.result && 'ok' === response.result) {
        if ($.isFunction(success)) {
          success(response);
        }
      }
      else {
        if ($.isFunction(fail)) {
          fail(response);
        }
      }
    }, null, true);
  }
});