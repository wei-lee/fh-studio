model.Model = Class.extend({
  init: function() {},

  getColumnMap: function(fieldConfig) {
    var column_map = {};

    if (fieldConfig == null) {
      fieldConfig = this.field_config;
    }

    $.each(fieldConfig, function(i, item) {
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

  postProcessList: function(res, data_model, fieldConfig) {
    var self = this;
    var filtered_fields;
    try {
      filtered_fields = data_model.getColumnMap(fieldConfig);
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
      var config = data_model.configForField(k).config;

      if (typeof config.width !== 'undefined') {
        data.aoColumns.push({
          sTitle: v,
          sWidth: config.width,
          bVisible: config.visible
        });
      } else {
        data.aoColumns.push({
          sTitle: v,
          bVisible: config.visible
        });
      }
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
  },

  startUpload : function (file_input_id, url, data, success, do_copy, fail, timeout) {
    // Create a new form and copy the file input into it. 
    // We want this to be the only POST parameter initialy, and combine it with the given data
    //
    var selector = 'string' === typeof file_input_id ? $('#' + file_input_id) : file_input_id;
    var temp_form = selector.closest('form');
    var ph_div = $("<div>");
    if(do_copy){
      selector.before(ph_div);
      temp_form = $("<form>");
      temp_form.append(selector);
      $('body').append(temp_form);
    }

    var options = {
      url: url,
      data: data,
      dataType: 'json',
      success: function(res){
          success(res);
          if(do_copy){
            ph_div.after(selector);
            temp_form.remove();
            ph_div.remove();
          }
      }
    };
    if(typeof fail == "function"){
        options.error = fail;
    }
    if(typeof timeout == "number"){
        options.timeout = timeout;
    }
    temp_form.ajaxSubmit(options);
    // TODO: clean up/remove temp_form after form submission
  }
});