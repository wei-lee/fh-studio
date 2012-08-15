model.Template = model.Model.extend({

  // Field config
  field_config: [{
    field_name: "icon",
    editable: false,
    showable: true,
    column_title: ""
  }, {
    field_name: "title",
    editable: false,
    showable: true,
    column_title: "Name"
  }, {
    field_name: "description",
    editable: false,
    showable: true,
    column_title: "Description"
  }, {
    field_name: "email",
    editable: false,
    showable: false,
    column_title: "Email"
  }, {
    field_name: "version",
    editable: false,
    showable: true,
    column_title: "Version"
  }, {
    field_name: "modified",
    editable: false,
    showable: true,
    column_title: "Last Modified"
  }, {
    field_name: "id",
    editable: false,
    showable: false,
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