model.Template = model.Model.extend({

  // Field config
  field_config: [{
    field_name: "icon",
    column_title: ""
  }, {
    field_name: "title",
    column_title: "Name"
  }, {
    field_name: "description",
    column_title: "Description"
  }, {
    field_name: "email",
    visible: false,
    column_title: "Email"
  }, {
    field_name: "id",
    visible: false,
    column_title: "App ID"
  }],
  
  init: function () {
    
  },
  
  list: function (success, fail, post_process) {
    var url = Constants.LIST_TEMPLATE_APPS_URL;
    var params = {};

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  }
});