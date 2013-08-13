HtmlUtil = function() {
  var self = {
    cache: {},

    constructOptions: function(select, options, values, selected) {
      $.each(values, function(key, val) {
        var opt = $('<option>', {
          value: val,
          text: options[key]
        });
        if (val === selected) {
          opt.attr('selected', 'selected');
        }
        select.append(opt);
      });
    },

    optionsFromConfig: function(config, textCallback, resolverCallback) {
      var key = '',
          ret;

      key = JSON.stringify(config);
      ret = self.cache[key];

      if ('undefined' === typeof ret) {
        ret = {};

        ret.options = [];
        ret.values = [];
        $.each(config, function(sub_key, sub_val) {
          var resolvedVal = sub_val;
          if ($.isFunction(resolverCallback)) {
            resolvedVal = resolverCallback(sub_key);
          }
          if ('object' === typeof sub_val) {
            ret.options.push(textCallback(sub_key, resolvedVal));
            ret.values.push(sub_key);
          }
        });

        self.cache[key] = ret;
      }

      return ret;
    },

    isIE8: function(){
      //jQuery.browser will be removed in jQuery 1.9
      return jQuery.browser.msie && parseInt(jQuery.browser.version, 10) === 8;
    }
  };

  return {
    constructOptions: self.constructOptions,
    optionsFromConfig: self.optionsFromConfig,
    isIE8: self.isIE8
  };
}();