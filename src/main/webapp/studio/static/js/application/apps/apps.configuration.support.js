var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};

Apps.Configuration.Support = Controller.extend({
  hiddenOptions: {},
  replaceOptions: {},
  featuredConfigOptions: {
    "remote Debug" : "enabled-remote-debug",
    "enable MonkeyTalk" : "enable-monkey-talk",
    "simulator Only": "enable-build-ios-simulator"
  },

  init: function () {
    _.extend(this.hiddenOptions, {'status':true});
  },
  
  show: function () {
    var self = this;
    console.log('show config for ' + self.destination);
    
    if (!self.showInitDone) {
      if ($.isFunction(self.showInit)) {
        self.showInit();
      }
    }
    else {
      if ($.isFunction(self.showReset)) {
        self.showReset();
      }
    }
    
    if ($.isFunction(self.showPost)) {
      self.showPost();
    }
  },
  
  /*
   * Once-off initialisation of any required components
   */
  showInit: function () {
    var self = this;
    
    self.showInitDone = true;
  },
  
  showPost: function () {
    var self = this;
    console.log("Get configration for : " + self.destination);

    $fw.data.set("config-dest", self.destination);
    var container = $('#configuration_' + self.destination + '_form');
    var template = $fw.data.get("inst").guid;

    console.log("container = " + '#configuration_' + self.destination + '_form');

    $fw.server.post(Constants.LIST_CONFIG_URL, {
      template: template,
      destination: self.destination
    }, function (res) {
      self.constructConfigDom(res, self.destination, container, self.hiddenOptions, self.replaceOptions);
    });

  },

  saveConfig: function () {
    var self = this,
        data, key, val,
        template = $fw.data.get("inst").guid,
        dest = $fw.data.get("config-dest"),
        form = $('#configuration_' + dest + '_form'),
        newConfig = {};
    
    if(typeof self.validateForm === "function"){
      if(!self.validateForm()){
        return;
      }
    }
    // Iterate over each config option and put it in newConfig
    form.find('.config_option').each(function (i, el) {
      key = $(el).attr('name');
      console.log("key:" + key);
      val = $(el).val();
      if ($(el).attr("type") === "checkbox") {
        if ($(el).prop("checked")) {
          if (key === "accessType") {
            val = "p";
          } else {
            val = "true";
          }
        } else {
          if (key === "accessType") {
            val = "s";
          } else {
            val = "false";
          }
        }
      }
      newConfig[key] = val;
    });
    
    // Construct update data object
    data = {
      template: template,
      destination: dest,
      config: newConfig
    };
    
    // Call update url, passing in data
    $fw.server.post(Constants.UPDATE_CONFIG_URL, data, function (res) {
      if (res.status === "ok") {
        $fw.client.dialog.info.flash($fw.client.lang.getLangString('config_saved'));
      } else {
        console.log('update config failed:' + res);
        self.show();
      }
    });
  },

  constructConfigDom: function (configs, dest, container, hiddenOptions, replaceOptions) {
    console.log('*** hiddenOptions', hiddenOptions);
    var self = this;
    container.empty();
    console.log("Construct config form");
    $.each(configs, function (key, value) {
      console.log("Construct config form - " + key + "=" + value);
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
    container.find('.' + $fw.client.lang.INSERT_HELP_ICON).each($fw.client.lang.insertHelpIcon);

    var template_mode = $fw.data.get('template_mode');
    if (!template_mode) {
      var form_actions = $('<div>', {
        'class': 'form-actions'
      });
      var save_button = $('<button>', {
        id: '#config_' + self.destination + '_save_btn',
        'class': 'btn pull-right'
      }).text('Save').bind('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.saveConfig();
      });
      form_actions.append(save_button);
      container.append(form_actions);
    }
  },

  getConfigDom: function (config_name, config_val, dest, doReplace) {
    if (this.featuredConfigOptions[config_name]) {
      if ($fw.getClientProp(this.featuredConfigOptions[config_name]) === "false") {
        return "";
      }
    }
    /*

      <div class="control-group">
        <label id="new_app_id_label" class="insert-lang insert-help-icon control-label" for="new_app_id"></label>
        <div class="controls">
          <input id="new_app_id" name="app_id" type="text" class="span12" disabled/>
        </div>
      </div>

    */
    var self = this,
      div = $("<div>", {
        'class': 'control-group'
      }),
      add_tip = true,
      label, input_el;
    label = $("<label>", {
      id: 'configuration_' + config_name.replace(/\s/g, '_'),
      text: js_util.capitalise(self.labelMap(config_name)),
      'class': 'insert-help-icon control-label'
    });
    if (!doReplace) {
      if (config_name === "accessType") {
        label.text('Public');
        input_el = $("<input type='checkbox' class='config_option span12' name='" + config_name + "' " + (config_val === "p" ? "checked=checked" : "") + " >");
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
            'class': 'config_option span12',
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
            'class': 'config_option span12',
            'name': config_name
          }).append(n_opt).append(t_opt).append(c_opt);
        } else if (typeof config_val === 'boolean' || config_val === "true" || config_val === "false") {
          div.addClass('fh-form-checkbox-field');
          config_val = (typeof config_val === 'boolean') ? config_val : config_val === 'true';
          input_el = $("<input type='checkbox' class='config_option span12' name='" + config_name + "' " + (config_val ? "checked=checked" : "") + " >");
        }
        // allow for 'select' objects
        else if ('object' === typeof config_val) {
          div.addClass('fh-form-select-field');
          input_el = self.constructSelect(config_name, config_val);
        } else {
          div.addClass('fh-form-text-field');
          var processed_val = self.postProcessVal(config_name, config_val);
          input_el = $("<input type='text' class='config_option span12' name='" + config_name + "' value='" + processed_val + "'>");
        }
      }
    } else {
      div.addClass('fh-form-text-field');
      var lang_key = dest + "_" + config_name.replace(/\s/g, '_').toLowerCase() + "_notes";
      var lang_val = $fw.client.lang.getLangString(lang_key);
      if (null == lang_val) {
        lang_val = $fw.client.lang.getLangString(dest + "_configuration_replace_general_notes");
      }
      input_el = $("<div>" + lang_val + "</div>");
    }
    div.append(label).append($('<div>', {
      'class': 'controls'
    }).append(input_el));
    return div;
  },

  labelMap: function(id) {
    // Custom Labels
    var map = {"app Id": "Bundle Identifier"};
    if (typeof map[id] !== 'undefined') {
      return map[id];
    } else {
      return id;
    }
  },

  postProcessVal: function(config_name, config_val) {
    if (config_name === 'app Id' && config_val === '') {
      var app_title = $fw.data.get('inst').title;
      app_title = "com.feedhenry." + app_title.replace(/[^a-zA-Z0-9\\.]/g,'.');
      return app_title;
    } else if(config_name === 'android Package Name' && config_val === ''){
      var defaultPackageName = this.getPackageName();
      return defaultPackageName;
    }else {
      return config_val;
    }
  },

  constructSelect: function (config_name, config_val) {
    var select = $('<select>', {
      name: config_name,
      'class': 'span12'
    });
    HtmlUtil.constructOptions(select, config_val.options, config_val.values, config_val.selected);
    return select;
  },

  getPackageName: function() {
    var guid = 'fh' + $fw.data.get('inst').guid;
    var packageName = "com.feedhenry." + guid.replace(/\W/g, '_');
    return packageName;
  }

});