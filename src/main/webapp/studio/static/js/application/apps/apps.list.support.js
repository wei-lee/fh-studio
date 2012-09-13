var Apps = Apps || {};

Apps.List = Apps.List || {};

Apps.List.Support = Controller.extend({
  init: function() {

  },

  show: function() {
    this._super();
  },

  renderAppListing: function(container, wrapper, data) {
    var self = this;
    this.user_table = $(container).show().dataTable({
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

    if (data.aaData.length === 0) {
      // Adjust colspan based on visible columns for new colspan
      var visible_columns = $('.dataTable:visible th:visible').length;
      var no_data_td = $('.dataTable:visible tbody td');
      no_data_td.attr('colspan', visible_columns);
      no_data_td.text(Lang.no_apps);
    }

    // Inject Create button
    var create_button = $('<button>').addClass('btn btn-primary pull-right').text('Create an App').click(function(e) {
      e.preventDefault();
      $fw.client.tab.apps.listapps.getController('apps.create.controller').show();
    });
    var import_button = $('<button>').addClass('btn pull-right import_app').text('Import an App').click(function(e) {
      e.preventDefault();
      $fw.client.tab.apps.listapps.getController('apps.import.controller').show();
    });
    $(wrapper + ' .span12:first').append(create_button).append(import_button);
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

      var guid = data[6];
      $('td:lt(6)', row).addClass('app_title').unbind().click(function(){
        // GUID is last, TODO: Make this better

        $fw.data.set('template_mode', false);
        $fw.client.tab.apps.manageapps.show(guid);
      });
      $('.edit_app', row).unbind().click(function(){
        $fw.data.set('template_mode', false);
        $fw.client.tab.apps.manageapps.show(guid);
      });
    }
  },

  addControls: function(res) {

    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls",
      "sWidth": "62px"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      var guid = row[6];
      // TODO: Move to clonable hidden_template
      var button = '<button class="btn edit_app">Edit</button>';
      controls.push(button);


      row.push(controls.join(""));

    });
    return res;
  }

});