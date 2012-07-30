model.StoreItemConsumer = model.Model.extend({

  // Model config
  config: {},

  init: function() {},

  list: function(success, fail) {
    var dummy_data = {
      "status": "ok",
      "list": [
        {
          "guid": "123456789012345678901111",
          "name": "Dummy App 1",
          "description": "This is mock data for dummy app 1",
          "authToken": "<unique_token_used_by_client_to_autheticate>",
          "icon": ""
        },
        {
          "guid": "123456789012345678902222",
          "name": "Dummy App 2",
          "description": "This is mock data for dummy app 2",
          "authToken": "<unique_token_used_by_client_to_autheticate>",
          "icon": ""
        },
        {
          "guid": "123456789012345678903333",
          "name": "Dummy App 3",
          "description": "This is mock data for dummy app 3",
          "authToken": "<unique_token_used_by_client_to_autheticate>",
          "icon": ""
        },
        {
          "guid": "123456789012345678904444",
          "name": "Dummy App 4",
          "description": "This is mock data for dummy app 4",
          "authToken": "<unique_token_used_by_client_to_autheticate>",
          "icon": ""
        }
      ]
    };

    return success(dummy_data);
    //var url = Constants.MAM_STORE_ITEM_LIST_URL;
    //var params = {};
    //return this.serverPost(url, params, success, fail);
  }
});