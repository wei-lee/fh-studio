model.Group = model.Model.extend({

  // Model config
  config: {},

  // Field config
  field_config: [{
    field_name: "guid",
    editable: false,
    showable: false,
    column_title: "Group ID"
  },{
    field_name: "name",
    editable: true,
    showable: true,
    column_title: "Group Name"
  }],

  init: function() {},

  create: function(name, success, fail) {
    var url = Constants.ADMIN_GROUP_CREATE_URL.replace('<domain>', $fw_manager.getClientProp('domain'));
    var params = {
	  "name": name
	};
    return this.serverPost(url, params, success, fail, true);
  },

  list: function(success, fail, post_process) {
    var url = Constants.ADMIN_GROUP_LIST_URL.replace('<domain>', $fw_manager.getClientProp('domain'));
    var params = {};

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },
  
  update: function(params, success, fail, post_process) {
    var url = Constants.ADMIN_GROUP_UPDATE_URL.replace('<domain>', $fw_manager.getClientProp('domain'));

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList, this);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },
  
  postProcessList: function(res, data_model) {
    var filtered_fields = data_model.getColumnMap();

    var rows = res.list;
    var data = {
      aaData: [],
      aoColumns: []
    };

    // Buid Data
    $.each(rows, function(i, item) {
      var row = item;
      data.aaData.push([]);

      $.each(filtered_fields, function(k, v) {
        data.aaData[i].push(row[k]);
      });
    });

    // Build Columns
    $.each(filtered_fields, function(k, v) {
      data.aoColumns.push({
        sTitle: v
      });
    });

    return data;
  }

});