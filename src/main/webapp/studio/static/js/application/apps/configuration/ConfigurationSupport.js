application.ConfigurationSupport = Class.extend({
  init: function () {
    Log.append('init ConfigurationSupport');
  },
  constructConfigDom: function (configs, dest, container, hiddenOptions, replaceOptions) {
    var self = this;
    container.empty();
    Log.append("Construct config form");
    $.each(configs, function (key, value) {
      Log.append("Construct config form - " + key + "=" + value);
      if (!(key in hiddenOptions)) {
        var input = "";
        if (!(key in replaceOptions)) {
          input = self.getConfigDom(key, value, dest, false);
        } else {
          input = self.getConfigDom(key, value, dest, true);
        }
        container.append(input);
      }
    });
    container.find('.' + $fw_manager.client.lang.INSERT_HELP_ICON).each($fw_manager.client.lang.insertHelpIcon);
  },
  getConfigDom: function (config_name, config_val, dest, doReplace) {
    if (config_name === "remote Debug") {
      if ($fw_manager.getClientProp("enabled-remote-debug") === "false") {
        return "";
      }
    }
    var self = this,
      div = $("<div>", {
        'class': 'fh-form-field ui-helper-reset ui-helper-clearfix'
      }),
      add_tip = true,
      label, input_el;
    label = $("<label>", {
      id: 'configuration_' + config_name.replace(/\s/g, '_'),
      text: js_util.capitalise(config_name),
      'class': 'insert-help-icon'
    });
    if (!doReplace) {
      if (config_name === "accessType") {
        label.text('Public');
        input_el = $("<input type='checkbox' class='config_option' name='" + config_name + "' " + (config_val === "p" ? "checked=checked" : "") + " >");
      } else {
        if (config_name === "orientation") {
          div.addClass('fh-form-select-field');
          var p_opt = $('<option>', {
            'text': 'Portrait',
            'value': 'portrait',
            'selected': config_val === "portrait" ? "selected" : undefined
          });
          var l_opt = $('<option>', {
            'text': 'Landscape',
            'value': 'landscape',
            'selected': config_val === "landscape" ? "selected" : undefined
          });
          input_el = $("<select>", {
            'class': 'config_option',
            'name': config_name
          }).append(p_opt).append(l_opt);
        } else if (config_name === "activity Spinner") {
          div.addClass('fh-form-select-field');
          var n_opt = $('<option>', {
            'text': 'Hidden',
            'value': 'None',
            'selected': config_val === "None" ? "selected" : undefined
          });
          var t_opt = $('<option>', {
            'text': 'Top',
            'value': 'Top',
            'selected': config_val === "Top" ? "selected" : undefined
          });
          var c_opt = $('<option>', {
            'text': 'Center',
            'value': 'Center',
            'selected': config_val === "Center" ? "selected" : undefined
          });
          input_el = $("<select>", {
            'class': 'config_option',
            'name': config_name
          }).append(n_opt).append(t_opt).append(c_opt);
        } else if (typeof config_val === 'boolean' || config_val === "true" || config_val === "false") {
          div.addClass('fh-form-checkbox-field');
          config_val = (typeof config_val === 'boolean') ? config_val : config_val === 'true';
          input_el = $("<input type='checkbox' class='config_option' name='" + config_name + "' " + (config_val ? "checked=checked" : "") + " >");
        }
        // allow for 'select' objects 
        else if ('object' === typeof config_val) {
          div.addClass('fh-form-select-field');
          input_el = self.constructSelect(config_name, config_val);
        } else {
          div.addClass('fh-form-text-field');
          input_el = $("<input type='text' class='config_option' name='" + config_name + "' value='" + config_val + "'>");
        }
      }
    } else {
      div.addClass('fh-form-text-field');
      var lang_key = dest + "_" + config_name.replace(/\s/g, '_').toLowerCase() + "_notes";
      var lang_val = $fw_manager.client.lang.getLangString(lang_key);
      if (null == lang_val) {
        lang_val = $fw_manager.client.lang.getLangString(dest + "_configuration_replace_general_notes");
      }
      input_el = $("<div>" + lang_val + "</div>");
    }
    div.append(label).append(input_el);
    return div;
  },
  constructSelect: function (config_name, config_val) {
    var select = $('<select>', {
      name: config_name
    });
    HtmlUtil.constructOptions(select, config_val.options, config_val.values, config_val.selected);
    return select;
  }
});