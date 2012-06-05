/*
 * All functions for showing and hiding ide elements should go here
 */

$.extend(Application, {
  /*
   * Hide all elements matching hide specified selector ,
   * then show all elements matching show specified selector
   */
  showAndHide: function(selector_show, selector_hide) {
    $(selector_hide).hide();
    $(selector_show).show();
  },

  showAndLoadGrid: function(grid_name) {
    // hide all grids in the grid wrapper
    $('#list_apps_grid_wrapper > .ui-jqgrid, #generate_app').hide();

    $fw_manager.app.loadAppsGridData(grid_name, function(data) {
      $fw_manager.app.showAppsGrid(grid_name, data);
    });
  },

  showAppsGrid: function(grid_name, data) {
    // initialise grid if required
    var init_grid_fn = 'init' + js_util.camelCase(grid_name.split('_')) + 'Grid';
    Log.append('Initialising with: ' + init_grid_fn + '()');
    $fw_manager.app[init_grid_fn](data);

    // show new grid
    $('#list_apps_grid_wrapper').find('#gbox_' + grid_name + '_grid').show();
    apps_layout.resizeAll();
    list_apps_layout.resizeAll();
    proto.Grid.resizeVisible();
  },

  /*
   * Originally used specifically for snippet tabs callbacks when tabs were shown,
   * but can now be used for any tabs show callback
   *
   * Usage:
   *  If a tab id is 'snippets_tags_list_tab'
   *  a postShow function of $fw_manager.app.postShowSnippetsTagsListTab() will be called after the
   *  tab is shown
   */
  postShowTab: function(event, ui) {
    var tab_name = $(ui.tab).attr('id').replace('_tab', '');
    Log.append('loading ' + tab_name);
    // construct the 'show' function name
    var show_fn_name = 'postShow' + js_util.camelCase(tab_name.split('_')) + 'Tab';
    var fn = $fw_manager.app[show_fn_name];
    // check if it's acutally a function
    if ('function' === typeof fn) {
      fn();
    } else {
      Log.append(show_fn_name + ' isnt a function');
    }
  },

  postShowSnippetsTagsListTab: function() {
    Log.append('postShowSnippetsTagsListTab');
    $fw_manager.client.snippet.doTagsList();
  },

  postShowSnippetsTagsCloudTab: function() {
    Log.append('postShowSnippetsTagsCloudTab');
  }
});