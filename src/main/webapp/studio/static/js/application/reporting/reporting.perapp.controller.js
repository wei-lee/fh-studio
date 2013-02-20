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
      var appTitle = data[1];
      $('td:lt(6)', row).addClass('app_title').unbind().click(function(){
        $(self.viewnames.do_report_btn).removeClass('disabled').data('selected_app',guid).data('selected_appname', appTitle);
        self.showSummaryMetrics(guid, appTitle);
      });
    }
  },

  showSummaryMetrics: function(appGuid, appTitle){
    var self = this;
    var summaryMetricsContainer = $(self.viewnames.app_summary_metrics_container);
    var period = $(self.viewnames.do_report_btn).data('period');
    summaryMetricsContainer.find('.summary_background_text').hide();
    summaryMetricsContainer.find('div.report-well').remove();
    var metrics = ["appinstallsdest", "appstartupsdest", "apprequestsdest", "apptransactionsdest"];
    var id = appGuid;
    self.populateTotals(id, period, metrics, function(err, data){
      if(err){
        alert(err);
      } else {
        summaryMetricsContainer.find('.app_summary_name_container').removeClass('hidden').find('span').text(appTitle);
        var appInstallsTemplate = self.getTemplate(metrics[0], true, 'appinstalls', "Installs", 'Installs: ' + data[0],null);
        var appStartTemplate = self.getTemplate(metrics[1], false, 'appstartups', 'Start Ups', 'Startups: ' + data[1], null);
        var appRequestsTemplate = self.getTemplate(metrics[2], true, 'apprequests', 'Requests','Requests: ' + data[2], null);
        var appTransactionsTemplate = self.getTemplate(metrics[3], false, 'apptransactions', 'Transactions', 'Transactions' + data[3], null);
        summaryMetricsContainer.append(self.getWellTemplate('App Client', [appInstallsTemplate, appStartTemplate])).append(self.getWellTemplate('App Cloud',[appRequestsTemplate, appTransactionsTemplate]));
        summaryMetricsContainer.find('.reportingdashboard_heading').unbind('click').bind('click', function(e){
          var controller = "reporting.controller";
          var reportSuperType = $(this).data("target");
          var heading =  $(this).data("heading");
          console.log("calling controller " + controller + " for report type " + reportSuperType + " over period of " + period + "days");
          controller = $fw.client.tab.admin.getController(controller);
          self.hide();
          controller.show(period,$fw.getClientProp("domain"),reportSuperType, heading);
        });
      }
    });
  },

  populateTotals: function(id, period, metrics, cb){
    var self = this;
    var dao = new application.MetricsDataLocator($fw.getClientProp("reporting-dashboard-sampledata-enabled"));
    var metricsSeries = [];
    $(metrics).each(function (indx, metric){
      metricsSeries.push(function (callback){
        var params = self.buildParams(id, period, metrics, 0);
        dao.getData(params,"list",Constants.READ_APP_METRICS_URL, function (data){
          /*var headingToUpdate = $('#' + metric);
          headingToUpdate.css("cursor","pointer");
          headingToUpdate.unbind().click(function (){
            var controller = "reporting.controller";
            var reportSuperType = $(this).data("target");
            var heading =  $(this).data("heading");
            console.log("calling controller " + controller + " for report type " + reportSuperType + " over period of " + period + "days");
            controller = $fw.client.tab.admin.getController(controller);
            self.hide();
            controller.show(period,$fw.getClientProp("domain"),reportSuperType, heading);
          });*/
          //var heading = headingToUpdate.data("heading");

          var total = 0;
          for(var i=0; i < data.length; i++){
            var values = data[i].value;
            total+=values.total;
          }
          //headingToUpdate.html(heading + " " + total);
          callback(undefined,total);
        },function (err){
          callback(err);
        });
      });
    });
    async.parallel(metricsSeries, function (err, data){
      cb(err, data);
    });
  },

  getTemplate: function(id, showboarder, target, heading, headingText, toptable){
    var html = '<div class="span6 reportdashboard_div ' + (showboarder?'reportdashboard_div_boarder':'') + '" style="margin: 3px;">';
    html += ' <h4 class="reportingdashboard_heading interactive_heading" id="'+id+'" data-target="'+target+'" data-heading="'+heading+'" style="cursor: pointer">'+headingText+'</h4>';
    html += '<div class="span11 reportingdashboard_image_container">';
    html += '<div class="span10" style="margin-left: 80px;">';
    html += '<ul class="nav nav-pills">';
    html += '<li class="reportdashboard_link"><a href="#">By Date</a></li>';
    html += '<li class="reportdashboard_link"><a href="#">By Platform</a></li>';
    html += '<li class="reportdashboard_link"><a href="#">By Location</a></li>';
    html += '</ul>';
    html += '</div>';
    html += '</div>';
    if(toptable){
      html += '<div class="span12">';
      html += '<h4>Top 5 Apps</h4>';
      html += '</div>';
      html += '<table class="table table-striped reportdashboard" id="'+toptable+'">';
      html += '</table>';
    }
    html += '</div>';
    return html;
  },

  getWellTemplate: function(legendText, divs){
    var html = '<div class="row-fluid report-well"><form class="form-inline">';
    html += '<fieldset class="well">';
    html += '<legend>'+legendText+'</legend>';
    for(var i=0;i<divs.length;i++){
      html +=  divs[i];
    }
    html += '</fieldset>';
    html += '</form></div>';
    return html;
  }
});
