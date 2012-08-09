var Apps = Apps || {};

Apps.Myapps = Apps.Myapps || {};

Apps.Myapps.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    myapps_grid: "#gbox_my_apps_grid",
    generate_app: "#generate_app"
  },

  myapps_grid: null,

  container: null,

  init: function () {
    
  },

  show: function(){
    var self = this;
    console.log('myapps show');

    // TODO: need to throttle this call

    // TODO: where to put this logic
    // var app_generation_enabled = $fw_manager.getClientProp('app-generation-enabled') == "true";
    // var nodejs_domain = $fw_manager.getClientProp('nodejsEnabled') == "true";
    // if (!app_generation_enabled || !nodejs_domain) {
    //   $('#list_apps_button_generate_app').hide().remove();
    //   $('#create_app_generator_container').hide().remove();
    // }

    // ($.throttle(Properties.click_throttle_timeout, function() {
    //   $fw_manager.app.showAndLoadGrid('my_apps');
    // }))();
    //$fw_manager.app.showAndLoadGrid('my_apps');

    // hide all grids in the grid wrapper
    //$('#list_apps_grid_wrapper > .ui-jqgrid, #generate_app').hide();

    var grid_name = 'my_apps';
    console.log('loading grid data');
    var url;
    
    url = 'templates' === grid_name ? Constants.LIST_TEMPLATE_APPS_URL : Constants.LIST_APPS_URL;
    
    $fw.server.post(url, {
      grid: true
    }, function (res) {
      var data = res.list;
      // initialise grid if required
      var init_grid_fn = 'init' + js_util.camelCase(grid_name.split('_')) + 'Grid';
      console.log('Initialising with: ' + init_grid_fn + '()');
      //$fw.app[init_grid_fn](data);

      proto.Grid.destroy(self.myapps_grid);
      self.myapps_grid = proto.Grid.load($('#my_apps_grid'), {
        pager: 'my_apps_grid_pager',
        viewrecords: true,
        recordtext: 'Total Apps : {2}',
        emptyrecords: 'No apps',
        datatype: 'jsonstring',
        data: data,
        colModel : [
          // if there is no id column the guid will not be set as the id of the row
          {
            index: 'id',
            name: 'id',
            hidden: true
          },
          {
            index : 'title',
            name : 'title',
            editible : false,
            title: false
          },
          {
            index : 'email',
            name : 'email',
            editible : false,
            title: false
          },
          {
            index : 'description',
            name : 'description',
            editable : false,
            title: false
          },
          {
            index : 'version',
            name : 'version',
            width : 50,
            editible : false,
            sortable : false,
            fixed: true,
            resizable: false,
            title: false
          },
          {
            index : 'modified',
            name : 'modified',
            editible : false,
            fixed: true,
            width: 120,
            resizable: false,
            title: false
          },
          {
            index : 'actions',
            name : 'actions',
            editable : false,
            sortable : false,
            fixed: true,
            width: 210,
            resizable: false,
            title: false
          }
        ],
        colNames : $fw_manager.client.lang.getLangArray('my_apps_grid_columns')
      });

      // show new grid
      $('#list_apps_grid_wrapper').find('#gbox_' + grid_name + '_grid').show();
      //apps_layout.resizeAll();
      //list_apps_layout.resizeAll();
      proto.Grid.resizeVisible();
    });
  }

});