var Reporting = Reporting || {};

Reporting.Perapp = Reporting.Perapp || {};

Reporting.Perapp.Controller = Apps.Reports.Support.extend({

  init: function () {
    this._super();
  },

  model: {
    app: new model.App()
  },

  views: {
    //those views will be hidden initially
    report_per_app: '#reports_per_app_container',
    app_list_table: '#reports_per_app_container #reports_per_app_all_apps_table',
  },

  viewnames: {
    report_per_app: '#reports_per_app_container',
    app_list_table: '#reports_per_app_container #reports_per_app_all_apps_table',
    do_report_btn: '.doReport',
    loading_indicator:'#reports_per_app_container #apps_loading',
    app_summary_metrics_container: '#per_app_summary_container'
  },

  show: function () {
    var self = this;
    var ele = $(self.viewnames.report_per_app);
    ele.show();
    $(self.viewnames.loading_indicator).show();
    $(self.viewnames.app_list_table).hide();
    $(self.viewnames.app_summary_metrics_container).show();
    $(self.viewnames.do_report_btn).addClass('disabled').unbind('click').bind('click', function(e){
      e.preventDefault();
      var appGuid = $(this).data('selected_app');
      if(appGuid){
        self.showSummaryMetrics(appGuid);
      }
    });
    self.loadAppList();
  },

  loadAppList: function(){
    var self = this;
    self.model.app.listMyApps(function(res) {
      self.renderAppListing(self.viewnames.app_list_table, res);
    }, function() {
      // Failure
    }, true);
  },

  renderAppListing: function(table, data){
    var self = this;
    $(self.viewnames.loading_indicator).hide();
    self.appListTable = $(table).removeClass('hidden').show().dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid table_nav'<'span6 app_search'f><'span6'p>>t",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData);
      }
    });
    if (data.aaData.length === 0) {
      // Adjust colspan based on visible columns for new colspfan
      var visible_columns = $('.dataTable:visible th:visible').length;
      var no_data_td = $('.dataTable:visible tbody td');
      no_data_td.attr('colspan', visible_columns);
      no_data_td.text(Lang.no_apps);
    }
  },

  rowRender: function(row, data){
    var self = this;
    var icon_cell = $('td:first', row);

    // Render icons (can be called multiple times, e.g. after sorting)
    if ( $('img', icon_cell).length === 0 ) {
      icon_cell.addClass('app_icon_cell');
      var icon_path = icon_cell.text().trim();
      var icon = $('<img>').attr('src', icon_path).addClass('app_icon');
      icon_cell.empty().append(icon);

      var guid = data[6];
      $('td:lt(6)', row).addClass('app_title').unbind().click(function(){
        $(self.viewnames.do_report_btn).removeClass('disabled').data('selected_app',guid);
        self.showSummaryMetrics(guid);
      });
    }
  },

  showSummaryMetrics: function(appGuid){
    var self = this;
    var summaryMetricsContainer = $(self.viewnames.app_summary_metrics_container);
    var period = $(self.viewnames.do_report_btn).data('period');
    summaryMetricsContainer.empty();
  }
});
