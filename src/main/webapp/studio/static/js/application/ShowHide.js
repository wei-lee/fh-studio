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
    console.log('Initialising with: ' + init_grid_fn + '()');
    $fw_manager.app[init_grid_fn](data);

    // show new grid
    $('#list_apps_grid_wrapper').find('#gbox_' + grid_name + '_grid').show();
    //apps_layout.resizeAll();
    //list_apps_layout.resizeAll();
    proto.Grid.resizeVisible();
  }
});