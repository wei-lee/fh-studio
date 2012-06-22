proto.Grid = {
  defaults: {
    hidegrid: false,
    datatype: 'jsonstring',
    rowNum: 1,
    altRows: true,
    sortorder: 'asc',
    viewrecords: false,
    cellEdit: false
  },

  load: function(el, overrides) {
    return el.jqGrid($.extend({}, proto.Grid.defaults, overrides));
  },

  resizeVisible: function() {
    Log.append('resizing visible grids');
    var grid = $('.ui-jqgrid-btable');
    if (grid.length > 0) {
      grid.each(function(index) {
        try {
          var grid_id = $(this).attr('id'),
              temp_grid = $('#' + grid_id),
              temp_gbox = $('#gbox_' + grid_id);
          var outer_container = temp_gbox.parent();
          var grid_width = outer_container.innerWidth() - 2;
          var outer_height = outer_container.innerHeight() - 2;
          var outer_grid_height = proto.Grid.calculateGridOuterHeight(temp_gbox);
          var other_heights = 0;
          outer_container.children(':visible').not('.ui-jqgrid').each(function() {
            other_heights += $(this).outerHeight(true); //include padding, border and margin
          });
          var grid_height = outer_height - outer_grid_height - other_heights;
          temp_grid.setGridWidth(grid_width).setGridHeight(grid_height);

          var row_num = proto.Grid.calculateRowNum(temp_gbox);
          //console.log('row_num:' + row_num);
          temp_grid.setGridParam({
            rowNum: row_num
          }).trigger('reloadGrid');
        } catch (err) {
          Log.append("Couldn't resize a grid - not visible");
        }
      });
    }
  },

  calculateGridOuterHeight: function(gbox) {
    var height;
    // add overall grid height plus height of any other visible elements
    height = gbox.innerHeight(); // + 29;
    // subtract height of grid table element so only non table elements are sized
    height -= parseInt(gbox.find('.ui-jqgrid-bdiv').innerHeight(), 10);
    return height;
  },

  calculateRowNum: function(gbox) {
    var row = gbox.find('.ui-jqgrid-bdiv .jqgrow:first-child');
    if (row.length > 0) {
      var table_height = parseInt(gbox.find('.ui-jqgrid-bdiv').innerHeight(), 10);
      var row_height = parseInt(row.outerHeight(), 10);
      //console.log('table height:' + table_height);
      Log.append('row_height:' + row_height);
      //alert('row_height:' + row_height);
      return Math.floor(table_height / row_height);
    }
    return 10;
  },

  destroy: function(grid) {
    if (null !== grid) {
      grid.parentsUntil('.ui-jqgrid').parent().after($('<table>', {
        id: grid.attr('id')
      })).end().remove();
      grid = null;
    }
  }
};