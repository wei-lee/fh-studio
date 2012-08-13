model.Model = Class.extend({
  init: function() {},

  getColumnMap: function() {
    var column_map = {};

    $.each(this.field_config, function(i, item) {
      column_map[item.field_name] = item.column_title;
    });

    return column_map;
  },

  configForField: function(field) {
    var config = null;
    $.each(this.field_config, function(i, item) {
      if (item.field_name === field) {
        config = item;
        index = i;
      }
    });

    return {
      config: config,
      index: index
    };
  },

  configForIndex: function(i) {
    var config = null;
    return this.field_config[i];
  },

  postProcessList: function(res, data_model) {
    var filtered_fields;
    try {
      filtered_fields = data_model.getColumnMap();
    } catch (e) {
      console.error("Couldn't get a column map for this model, so I can't post-process it.");
      return res;
    }

    var rows = res.list;
    var data = {
      aaData: [],
      aoColumns: []
    };

    // Buid Data
    $.each(rows, function(i, item) {
      var row = item.fields || item;
      data.aaData.push([]);

      $.each(filtered_fields, function(k, v) {
        var value = row[k];
        data.aaData[i].push(value);
      });
    });

    // Build Columns
    $.each(filtered_fields, function(k, v) {
      data.aoColumns.push({
        sTitle: v
      });
    });

    return data;
  },

  serverPost: function(url, params, success, fail, no_payload, post_process, model) {
    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        if ($.isFunction(success)) {
          if ($.isFunction(post_process)) {
            res = (post_process(res, model));
          }
          success(res);
        }
      } else {
        if ($.isFunction(fail)) {
          fail(res.message);
        }
      }
    }, fail, no_payload);
  }
});