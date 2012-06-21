model.Template = model.Model.extend({
  
  init: function () {
    
  },
  
  list: function (success, fail, grid) {
    var url = Constants.LIST_TEMPLATE_APPS_URL;
    var params = {
      grid: grid || false
    };
    $fw_manager.server.post(url, params, function (result) {
      var list = result.list;
      if ($.isFunction(success)) {
        success(list);
      }
    }, fail);
  },
  
  gridList: function (success, fail) {
    $fw_manager.client.model.Template.list(success, fail, true);
  }
});