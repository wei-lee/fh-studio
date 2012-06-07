model.Group = model.Model.extend({

  init: function() {},

  list: function(success, fail, post_process) {
    var url = Constants.ADMIN_GROUP_LIST_URL.replace('<domain>', $fw_manager.getClientProp('domain'));
    var params = {};

    if (post_process) {
      return this.serverPost(url, params, success, fail, true, this.postProcessList);
    } else {
      return this.serverPost(url, params, success, fail, true);
    }
  },

  postProcessList: function(res) {
    var filtered_fields = {
      "name": "Name",
      "perms": "Permissions"
    };

    var rows = res.list;
    var data = {
      aaData: [],
      aoColumns: []
    };

    // Buid Data
    $.each(rows, function(i, item) {
      var row = item.fields;
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