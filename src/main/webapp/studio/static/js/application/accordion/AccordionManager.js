/*
 * Contains callbacks for accordion containers
 */
application.AccordionManager = Class.extend({

  init: function (accordion_name) {
    this.name = accordion_name;
  },

  show: function () {
    this.el = $('#' + this.name);
    this.checkForDisabled();
    var that = this;
    var overrides = {
      change: function(event, ui){
        // update state information
        $fw_manager.state.set(that.getSelectedItemKey(), 'selected', ui.options.active);
        
        // Call the generic change handler
        $fw_manager.app.appAccordionChangeHandler(event, ui);
      },
      active: false,
      collapsible: true
    };
    // Check if we need to force a state
    // TODO: allow for UI structural changes
    var selected = $fw_manager.state.get(this.getSelectedItemKey(), 'selected', 0);
    this.el = proto.Accordion.load(this.el, overrides);
    this.bindCallback();
    
    this.el.accordion('activate', selected).accordion('option', 'collapsible', false);
  },
  
  reset: function () {
    // First click the accordion item stored in state 
    var selected = $fw_manager.state.get(this.getSelectedItemKey(), 'selected', 0);
    this.el.accordion('activate', selected);
    
    // Try reclick the state store sub-item if its visible, otherwise click the first sub-item
    var selectedAccordionItem = this.el.find(':nth-child(' + ((selected + 1) * 2) + ')');
    var selectedIndex =  $fw_manager.state.get(this.name + '_' + selectedAccordionItem.prev().attr('id'), 'selected', 0);
    var item = selectedAccordionItem.find('li:nth-child(' + (selectedIndex + 1) + '):visible');
    if (item.length > 0) { 
      item.trigger('click');
    }
    else {
      selectedAccordionItem.find('li:first').trigger('click');
    }
  },
  
  preSelect: function (id, container) {
    log('accordion:' + this.name + ' - preSelect');
    var callback_suffix = js_util.camelCase(id.split('_'));
    var pre_select_fn_name = 'preSelect' + callback_suffix;
    var pre_fn = this[pre_select_fn_name];
    
    if ('function' === typeof pre_fn) {
      pre_fn.call(container[0], id, container);
    }
    else if ('function' === typeof this.preSelectCatchAll) {
      this.preSelectCatchAll.call(container[0], id, container);
    }
    else {
      log(pre_select_fn_name + '() not implemented for accordion:' + this.name);
    }
  },
  
  postSelect: function (id, container) {
    log('accordion:' + this.name + ' - postSelect');
    var callback_suffix = js_util.camelCase(id.split('_'));
    var post_select_fn_name = 'postSelect' + callback_suffix;
    var post_fn = this[post_select_fn_name];
    
    if ('function' === typeof post_fn) {
      post_fn.call(container[0], id, container);
    }
    else if ('function' === typeof this.postSelectCatchAll) {
      this.postSelectCatchAll.call(container[0], id, container);
    }
    else {
      log(post_select_fn_name + '() not implemented for accordion:' + this.name);
    }
  },
  
  bindCallback: function(){
    log('bindCallback');
    var that = this;
    //use jquery delegate method here so that it will automatically bind click events to future created nodes. See http://api.jquery.com/delegate/
    that.el.delegate('li.ui-menu-item','click', function(e){
      log('li.ui-menu-item clicked');
      var clicked_item = $(this); 
      if (clicked_item.is(':visible')) {
        clicked_item.parent().parent().parent().find('li.ui-state-active').removeClass('ui-state-active');
        clicked_item.addClass('ui-state-active');
        
        var accordion_name = that.name.replace('_accordion', '');
        var id = clicked_item.attr('id');
        var item = that.el.find('#accordion_item_' + id.split('_')[0] + ' a').text();
        
        // update state information
        var sub_selected = clicked_item.index();
        $fw_manager.state.set(that.el.attr('id') + '_' + clicked_item.parent().parent().prev().attr('id'), 'selected', sub_selected);
        
        // show only the selected container
        $('.' + accordion_name + '-container').hide();
        var container_name = id + '_container';
        var container = $('#' + id + '_container');
        
        if (container.length > 0) {
          container.show();
        }  
        else {
          // create the container as it may have content dynamically generated later
          // TODO: use template cloning to create this container. Prevents class names
          // getting changed causing problems
          container = $('<div>', {
            id: id + '_container',
            'class': accordion_name + '-container section-container'
          }).append($('<div>', {
            id: id + '_body',
            'class': 'section-body'
          })).appendTo($('#' + accordion_name + '_content'));
        }
        
        // trigger preSelect callback
        that.preSelect(id, container);
        
        // insert any language stuff
        $fw_manager.client.lang.insertLangForContainer(container);
        
        // show the outer container header
        $('#' + accordion_name + '_header').show();
        // Hide all inner container headers - the default one for showing standard text, and any non standard ones
        $('.' + accordion_name + '-header').hide();
        
        // Build the header unique Id
        var headerId = id + '_header';
        // Look for text in the language file corresponding to the header Id
        var headerText = $fw_manager.client.lang.getLangString(headerId);
        
        var accordionContentHeader = $('#' + accordion_name + '_header_text');
        if (null !== headerText && headerText.length > 0) {
          // Found text in the language file for the selected accordion item
          // Show the standard header and set the text
          accordionContentHeader.show().text(headerText);
        }
        else {
          // Look for a non standard header
          var header = $('#' + headerId);
          if (header.length > 0) {
            // Found a non standard header - show it
            header.show();
          }
          else {
            // Show the standard header and set the text to the headerId
            accordionContentHeader.show().text(headerId);
          }
        }
        
        // show tab main content now as it should all be initialised and looking good
        $('#' + accordion_name + '_content').show();
        
        // trigger postSelect callback
        that.postSelect(id, container);
        
        // need to manually trigger a resize in case center pane header has changed height e.g. editor toolbar
        log('resizing visible inner layouts');
        var innerLayouts = $('.inner-layout:visible');
        if (innerLayouts.length > 0) {
          innerLayouts.layout().resizeAll();
        }
      } else {
        log('clicked accordion item not visible');
      }
    });
  },
  
  getSelectedItemKey: function () {
    return this.name;
  },
  
  checkForDisabled: function () {
    var that = this;
    try {
      var hidden_items = $fw_manager.getClientProp('disabled-accordion-items');
      $.each(hidden_items, function (key, val) {
        that.el.find('#accordion_item_' + val).next().andSelf().remove();
      });
    }
    catch (e) {
      log('error reading hidden accordion items prop:' + e, 'ERROR');
    }
  }

});