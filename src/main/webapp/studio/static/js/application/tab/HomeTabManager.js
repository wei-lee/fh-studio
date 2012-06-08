application.HomeTabManager = application.TabManager.extend({
  name: 'home',
  
  init: function (opts) {
    this._super(opts);
    this.recent_apps_grid = null;
  },
  
  doUpdateBreadcrumb: function () {
    var accountType = $fw.client.lang.getLangString('account_type_' + $fw.getClientProp('accountType'));
    $('#' + this.name + '_north .container-title').html($('<div>', {
      'class': 'fh_breadcrumb-wrapper'
    }).html($('<span>', {
      'class': 'fh_breadcrumb fh_breadcrumb-nolink'
    }).text(accountType + ' Account')));
  },
  
  doReset: $.noop,
  
  doPreInit: function () {
    this.layout = proto.Layout.load($('#home_layout'), {
      center__onresize: function(pane, $Pane, pane_state) {
       proto.Grid.resizeVisible();
      },
      east__initClosed: true,
      west__initClosed: true
    });
  },
  
  doPostInit: function () {
    // click first accordion sub-item
    $('#home_top_left_header #home_create_new_app_btn').click(function(){
        //TODO: move this function to somewhere else
        $('#apps_tab').click();
        //$fw_manager.client.tab.apps.showListApps();
        $fw_manager.client.app.doCreate();
    });
  },
  
  doPostShow: function () {
    main_layout.resizeAll();
    this.layout.resizeAll();
    this.showRecentApps();
  },
  
  showRecentApps: function(){
    this.initHomeGrids();
    var self = this;
    this.recent_apps_grid.jqGrid('clearGridData');
    $fw_manager.app.loadHomeGridData(Constants.LIST_APPS_URL, {
        'max': 5,
        'order': 'desc',
        'order-by': 'sysModified',
        'grid': true
    }, function(apps){
        var entries = apps.list;
        for (var di=0; di<entries.length; di++) {
          var entry = entries[di];
          Log.append('add Entry: ' + entry.id);
          self.recent_apps_grid.jqGrid('addRowData', entry.id, entry);
        }
        self.recent_apps_grid.trigger('reloadGrid');
        self.layout.resizeAll();
    });
  },
  
  initHomeGrids: function(){
      if(null === this.recent_apps_grid){
          this.recent_apps_grid = proto.Grid.load($('#recent_apps_grid'), {
            pager: 'recent_apps_grid_pager',
            autoWidth: true,
            colModel : [
              {                
                index : 'title', 
                name : 'title', 
                editible : false
              },
              {                
                index : 'version', 
                name : 'version', 
                editible : false,
                sortable : false,
                fixed: true,
                resizable: false,
                width: 50
              }, 
              {                
                index : 'modified', 
                name : 'modified', 
                editible : false,
                fixed: true,
                resizable: false,
                width: 120
              }
            ],
            colNames: [
              'Name',
              'Version',
              'Last Changed'
            ]   
          });
      }
  }
});