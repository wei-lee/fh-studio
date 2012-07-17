application.TabSupport = Class.extend({
  BREADCRUMB_SEPARATOR: ' / ',
  
  init: function () {
    
  },
  
  createBreadcrumbsHtml: function (crumbs) {
    var wrapper = $('<div>', {
      'class': 'fh_breadcrumb-wrapper'
    });
    
    // add all crumbs except final one
    for (var ci=0; ci<crumbs.length-1; ci++) {
      var temp_crumb = crumbs[ci];
      var link = $('<a>', {
        'class': 'fh_breadcrumb fh_breadcrumb-link',
        text: temp_crumb.text.trim()
      });
      if ($.isFunction(temp_crumb.callback)) {
        link.bind('click', temp_crumb.callback);
      }
      wrapper.append(link);
      // add spearator
      wrapper.append($('<span>', {
        'class': 'fh_breadcrumb-separator',
        text: this.BREADCRUMB_SEPARATOR
      }));
    }
    // add final crumb
    var final_crumb = crumbs[crumbs.length-1];
    wrapper.append($('<span>', {
      'class': 'fh_breadcrumb fh_breadcrumb-nolink',
      text: final_crumb.text
    }));
    
    return wrapper;
  }
});