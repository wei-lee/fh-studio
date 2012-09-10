LangManager = Class.extend({
  INSERT_LANG: "insert-lang",
  INSERT_LANG_BLOCK: "insert-lang-block",
  INSERT_HELP: "insert-help",
  INSERT_HELP_ICON: "insert-help-icon",
  SELECTOR_STRING: "",

  containers: {},

  /*
   * Call the super constructor and initialise any fields
   */
  init: function() {
    this.SELECTOR_STRING = '.' + this.INSERT_LANG + ',.' + this.INSERT_LANG_BLOCK + ',.' + this.INSERT_HELP + ',.' + this.INSERT_HELP_ICON;
  },

  /*
   * Look for any elements inside the given container that need to
   * have language inserted into them
   */
  insertLangForContainer: function(container, container_id, always) {
    always = 'boolean' === typeof container_id ? container_id : always;
    var id = 'string' === typeof container_id ? container_id : container.attr('id');
    // if container with this id doesn't have lang inserted yet
    if (always || ('undefined' === typeof this.containers[id])) {
      console.log('inserting lang for:' + id);
      container.find('.' + $fw.client.lang.INSERT_LANG).each($fw.client.lang.insertLang);
      container.find('.' + $fw.client.lang.INSERT_LANG_BLOCK).each($fw.client.lang.insertLangBlock);
      container.find('.' + $fw.client.lang.INSERT_HELP).each($fw.client.lang.insertHelp);
      container.find('.' + $fw.client.lang.INSERT_HELP_ICON).each($fw.client.lang.insertHelpIcon);
      // record lang being inserted so it isn't done repeatedly
      this.containers[id] = true;
    }
  },

  /*
   * Apply language filters to each of the passed in elements,
   * The passed in id will be used for saving the fact the filter was done
   */
  insertLangForElements: function(elements, id) {
    if ('undefined' === typeof this.containers[id]) {
      console.log('inserting lang for:' + id);
      elements.filter('.' + $fw.client.lang.INSERT_LANG).each($fw.client.lang.insertLang);
      elements.filter('.' + $fw.client.lang.INSERT_LANG_BLOCK).each($fw.client.lang.insertLangBlock);
      elements.filter('.' + $fw.client.lang.INSERT_HELP).each($fw.client.lang.insertHelp);
      elements.filter('.' + $fw.client.lang.INSERT_HELP_ICON).each($fw.client.lang.insertHelpIcon);
      // record lang being inserted so it isn't done repeatedly
      this.containers[id] = true;
    }
  },

  insertLangFromData: function (container) {
    container.find('[data-lang]').each(function () {
      var el = $(this);
      el.text($fw.client.lang.getLangString(el.data('lang')));
    });
  },

  /*
   * Insert text, if it is available for the element (this)
   */
  insertLang: function(index) {
    var el = $(this);
    el.removeClass($fw.client.lang.INSERT_LANG);
    var el_id = el.attr('id');
    var lang = $fw.client.lang.getLangString(el_id);

    if (null !== lang && lang.length > 0) {
      if ($('i', el).length > 0) {
        el.append('&nbsp;' + lang);
      } else {
        el.append(lang);
      }
    }
  },

  /*
   * Insert text as a paragraph, or block of paragraphs, if it is available for the element (this)
   */
  insertLangBlock: function(index) {
    var el = $(this);
    el.removeClass($fw.client.lang.INSERT_LANG_BLOCK);
    var el_id = el.attr('id');
    var lang = $fw.client.lang.getLangArrayAsBlock(el_id);

    if (lang.length > 0) {
      for (var li = 0; li < lang.length; li++) {
        var temp_lang = lang[li];
        el.append(temp_lang);
      }
    }
  },

  /*
   * Apply a tooltip/popover to the element (this) if text is available for it
   */
  insertHelp: function(index) {
    var el = $(this);
    el.removeClass($fw.client.lang.INSERT_HELP);
    var el_id = el.attr('id');
    var lang = $fw.client.lang.getLangString(el_id + '_help');

    if (null !== lang && lang.length > 0) {
      el.popover({
        content: lang,
        placement: 'left',
        delay: { show: 100, hide: 100 },
        trigger: 'hover'
      });
    }
  },

  /*
   * Insert a help icon after the element (this)
   *  and apply a popover/tooltip to it if text is available for it
   */
  insertHelpIcon: function(index) {
    var el = $(this);
    el.removeClass($fw.client.lang.INSERT_HELP_ICON);
    var el_id = el.attr('id');
    var lang = $fw.client.lang.getLangString(el_id + '_help_icon');

    if (null !== lang) {
      var btn = $('<button>', {
        'class': 'btn help-button'
      });
      var icon = $('<i>', {
        'class': 'icon-info-sign'
      });
      btn.css('font-size', '18px');
      btn.append(icon);
      el.append('&nbsp;').append(btn);
      btn.popover({
        content: lang,
        placement: 'bottom',
        delay: 100
      });
      btn.click(function(e){
        e.preventDefault();
        return false;
      });
    }
  },

  /*
   * Get the string for the specified id. If the lang is an array or strings,
   *  they are joined into a single string.
   */
  getLangString: function(id) {
    var lang = null;

    var lang_obj = Lang[id];
    var lang_type = typeof lang_obj;
    if ('undefined' !== lang_type) {
      if ('string' === lang_type) {
        lang = lang_obj;
      } else {
        // lang is an array of strings
        lang = lang_obj.join('');
      }
    }

    return lang;
  },

  getLangArray: function(id) {
    var lang_array = Lang[id] || [],
      lang_type = typeof lang_array;

    if ('string' === lang_type) {
      // convert to an array with the string as the only item
      lang_array = [lang_array];
    }

    return lang_array;
  },

  /*
   * Get the jquery DOM array for the specified id with text inserted into paragraphs, if available
   */
  getLangArrayAsBlock: function(id) {
    var lang_array = this.getLangArray(id),
      lang_block = [];

    for (var li = 0; li < lang_array.length; li++) {
      var temp_lang = lang_array[li];
      lang_block.push($('<p>', {
        html: temp_lang
      }));
    }

    return lang_block;
  }
});