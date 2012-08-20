var Dashboard = Dashboard || {};
Dashboard.Tab = Dashboard.Tab || {};

Dashboard.Tab.Manager = Tab.Manager.extend({

  id: 'dashboard_layout',

  model: { // have models & views in tab manager here rather than separate controller for now
    app: new model.App()
  },

  views: {
    recentapps_grid_wrapper: "#recentapps_grid_wrapper",
    recentapps_grid: "#recentapps_grid"
  },

  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super();

    this.showRecentApps();
  },

  initBindings: function() {
    var docs, nodeEnabled = $fw.getClientProp('nodejsEnabled');

    if ('true' === nodeEnabled) {
      docs = $fw.getClientProp('dashboard-docs-v2'); // nodejs
    } else {
      docs = $fw.getClientProp('dashboard-docs-default');
    }

    $('#dashboard_create_new_app_btn').click(function() {
      //TODO: move this function to somewhere else
      $('#apps_tab').click();
      $fw.client.tab.apps.listapps.show();
      $fw.client.tab.apps.listapps.getController('apps.create.controller').show();
    });

    try {
      var docs_array = docs;
      console.log('got ' + docs_array.length + ' docs');

      var docs_container = $('.doc_list');
      for (var di = 0, dl = docs_array.length; di < dl; di++) {
        var temp_doc = docs_array[di],
          temp_doc_text = $fw.client.lang.getLangString('docs_' + temp_doc.id);
        if (temp_doc_text === null) {
          temp_doc_text = temp_doc.id.replace('_', ' ');
        }
        var temp_doc_link = $('<a>').attr('href', temp_doc.url).attr('target', '_blank').text(temp_doc_text),
          temp_doc_item = $('<li>').addClass('doc_links').append(temp_doc_link);

        docs_container.append(temp_doc_item);

        $('.doc_links').unbind().bind('click', function(evt) {
          var docName = this.innerText;
          console.log('Clicked Doc Link : ' + docName);

          $fw.analytics.trackEvent({
            id: 'Dashboard - View Documentation',
            props: {
              'docName': docName
            }
          });
        });
      }
    } catch (e) {
      console.log('Error getting docs links from property', 'ERROR');
    }
  },

  updateCrumbs: function(self) {
    console.log('dashboard updateCrumbs');

    // get account type
    var accountType = $fw.client.lang.getLangString('account_type_' + $fw.getClientProp('accountType'));

    var crumb = $('#' + self.id).find('.breadcrumb').empty();
    crumb.append($('<li>', {
      "class": "active",
      "text": accountType + ' Account'
    }));
  },

  // loadRecentAppsGridData: function(url, data, callback) {
  //   $fw.server.post(url, data, function(data) {
  //     callback(data);
  //   });
  // },

  showRecentApps: function() {
    var self = this;

    this.model.app.listRecent(function(res) {
      self.renderAppListing(self.views.recentapps_grid, self.views.recentapps_grid_wrapper, res);
    }, function() {
      // Failure
    });

    // // FIXME: convert to datatables and fix conclick event for each row
    // this.initRecentAppsGrid();
    // var self = this;
    // this.recent_apps_grid.jqGrid('clearGridData');
    // this.loadRecentAppsGridData(Constants.LIST_APPS_URL, {
    //   'max': 5,
    //   'order': 'desc',
    //   'order-by': 'sysModified'
    // }, function(apps) {
    //   var entries = apps.list;
    //   for (var di = 0; di < entries.length; di++) {
    //     var entry = entries[di];
    //     console.log('add Entry: ' + entry.id);
    //     self.recent_apps_grid.jqGrid('addRowData', entry.id, entry);
    //   }
    //   self.recent_apps_grid.trigger('reloadGrid');
    // });
  },

  // initRecentAppsGrid: function() {
  //   if (null == this.recent_apps_grid) {
  //     this.recent_apps_grid = proto.Grid.load($('#recent_apps_grid'), {
  //       pager: 'recent_apps_grid_pager',
  //       autoWidth: true,
  //       colModel: [{
  //         index: 'title',
  //         name: 'title',
  //         editible: false
  //       }, {
  //         index: 'version',
  //         name: 'version',
  //         editible: false,
  //         sortable: false,
  //         fixed: true,
  //         resizable: false,
  //         width: 50
  //       }, {
  //         index: 'modified',
  //         name: 'modified',
  //         editible: false,
  //         fixed: true,
  //         resizable: false,
  //         width: 120
  //       }],
  //       colNames: ['Name', 'Version', 'Last Changed']
  //     });
  //   }
  // },

  renderAppListing: function(container, wrapper, data) {
    var self = this;

    this.user_table = $(container).show().dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "t",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData);
      }
    });
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

      var guid = data[4];
      $('td', row).unbind().click(function(){
        // GUID is last, TODO: Make this better

        $fw.data.set('template_mode', false);
        $('#apps_tab').trigger('click');
        $fw.client.tab.apps.manageapps.show(guid);
      });
    }
  }
});