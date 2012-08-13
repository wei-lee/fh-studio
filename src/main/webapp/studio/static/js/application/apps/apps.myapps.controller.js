var Apps = Apps || {};

Apps.Myapps = Apps.Myapps || {};

Apps.Myapps.Controller = Controller.extend({

  model: {
    app: new model.App()
  },

  views: {
    myapps_grid: "#my_apps_grid_wrapper",
    generate_app: "#generate_app"
  },

  myapps_grid: null,

  container: null,

  init: function() {

  },

  show: function() {
    var self = this;
    console.log('myapps show');
    
    var grid_name = 'my_apps';
    console.log('loading grid data');
    var url = Constants.LIST_APPS_URL;

    this.model.app.list(function(res) {
      var data = self.addControls(res);
      self.renderAppListing(data);
    }, function() {
      // Failure
    }, true);
  },

  renderAppListing: function(data) {
    var self = this;

    this.user_table = $('#my_apps_grid').dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData);
      }
    });

    // Inject Create button
    var create_button = $('<button>').addClass('btn btn-primary pull-right').text('Create an App').click(function() {
      self.showCreateApp();
      return false;
    });
    $('#list_apps_grid_wrapper .span12:first').append(create_button);
  },

  rowRender: function(row, data) {
    var self = this;
    var icon_cell = $('td:first', row);

    // Render icons (can be called multiple times, e.g. after sorting)
    if ( $('img', icon_cell).length === 0 ) {
      icon_cell.addClass('app_icon_cell');
      var icon_path = icon_cell.text().trim();
      var icon = $('<img>').attr('src', icon_path).addClass('app_icon');
      icon_cell.empty().append(icon);

      //self.model.app.configForField('icon');

      // Bind row clicks to show Manage an app
      $('td:eq(1)', row).addClass('app_title').unbind().click(function(){
        // GUID is last, TODO: Make this better
        var guid = data[6];
        $fw.client.tab.apps.showManageapps(guid);
        // $fw.client.tab.showManageapps
      });
    }
  },

  addControls: function(res) {
    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      // TODO: Move to clonable hidden_template
      controls.push('<button class="btn edit_app">Edit</button>&nbsp;');
      controls.push('<button class="btn clone_app">Clone</button>&nbsp;');
      controls.push('<button class="btn btn-danger delete_app">Delete</button>');
      row.push(controls.join(""));
    });
    return res;
  },

});