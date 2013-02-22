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
    reports_graph : '#reporting_layout .reporting_graph'
  },

  viewnames: {
    report_per_app: '#reports_per_app_container',
    app_list_table: '#reports_per_app_container #reports_per_app_all_apps_table',
    app_list_table_wrapper: '#reports_per_app_all_apps_table_wrapper',
    do_report_btn: '.doReport',
    loading_indicator:'#reports_per_app_container #apps_loading',
    app_summary_metrics_container: '#per_app_summary_container',
    "reports_form":"#reporting_layout .reporting_form"
  },

  show: function (app) {
    var self = this;
    $(self.views.reports_graph).hide();

    var ele = $(self.viewnames.report_per_app);

    self.initDatepickers($(self.viewnames.reports_form +' input[name="from"]'), $(self.viewnames.reports_form +' input[name="to"]'));
    self.initFormDates(7);
    ele.show();

    $(self.viewnames.loading_indicator).show();
    $(self.viewnames.app_list_table_wrapper).hide();
    $(self.viewnames.app_summary_metrics_container).show();
    $(self.viewnames.app_summary_metrics_container).find('div:gt(0)').hide();
    $(self.viewnames.app_summary_metrics_container).find('div:eq(0)').show();
    $(self.viewnames.reports_form).show();
    $(self.viewnames.do_report_btn).addClass('disabled').unbind('click').bind('click', function(e){
      e.preventDefault();
      var appGuid = $(this).data('selected_app');
      var appTitle = $(this).data('selected_appname');
      var period = $(this).data('period');
      if(period){
        self.initFormDates(period);
      }
      if(appGuid){
        self.showSummaryMetrics(appGuid, appTitle, period);
      }
    });
    self.loadAppList(app);
  },

  loadAppList: function(app){
    var self = this;
    self.model.app.listAll(function(res) {
      self.renderAppListing(self.viewnames.app_list_table, res);
      if(app){
        var appId = app.guid;
        var title = app.title;
        var period = app.period;
        if(period){
          self.initFormDates(period);
        }
        if(appId && title){
          self.showSummaryMetrics(appId, title, period);
        }
      }
    }, function() {
      // Failure
    }, true);
  },

  renderAppListing: function(table, data){
    var self = this;
    $(self.viewnames.loading_indicator).hide();
    $(self.viewnames.app_list_table_wrapper).show();
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
      $('td:lt(6)', row).addClass('app_title').attr('id', guid).unbind().click(function(){
        self.showSummaryMetrics(guid, appTitle);
      });
    }
  },

  showSummaryMetrics: function(appGuid, appTitle, period){
    var self = this;
    var summaryMetricsContainer = $(self.viewnames.app_summary_metrics_container);
    var metrics = ["appinstallsdest", "appstartupsdest", "apprequestsdest", "apptransactionsdest"];
    var params = {};
    if(period){
      params = self.buildParamsForDays(appGuid, period, metrics,0);
    } else {
      var from = $('input[name="from"]').val();
      var to = $('input[name="to"]').val();

      period = self.daysBetweenDates(new Date(from), new Date(to));

      params = self.buildParamsForDates(appGuid, from, to, metrics, 0);
    }
    summaryMetricsContainer.find('.summary_background_text').hide();
    summaryMetricsContainer.find('div.report-well').remove();
    $(self.viewnames.do_report_btn).removeClass('disabled').data('selected_app',appGuid).data('selected_appname', appTitle);

    self.populateTotals(params, function(err, data){

      if(err){
        alert(err);
      } else {
        summaryMetricsContainer.find('.app_summary_name_container').removeClass('hidden').show().find('span').text(appTitle);
        var appInstallsTemplate = self.getTemplate(metrics[0], true, 'appinstalls', "Installs", 'Installs: ' + data[0],null);
        var appStartTemplate = self.getTemplate(metrics[1], false, 'appstartups', 'Start Ups', 'Startups: ' + data[1], null);
        var appends = [];

        summaryMetricsContainer.append(self.getWellTemplate('App Client', [appInstallsTemplate, appStartTemplate]));
        if($fw.getClientProp("cloudrequest-reporting-enabled") !== "false"){
          var appRequestsTemplate = self.getTemplate(metrics[2], true, 'apprequests', 'Requests','Requests: ' + data[2], null);
          appends.push(appRequestsTemplate);
        }
        if($fw.getClientProp("transaction-reporting-enabled") !== "false"){
          var appTransactionsTemplate = self.getTemplate(metrics[3], false, 'apptransactions', 'Active Uses', 'Active Users: ' + data[3], null);
          appends.push(appTransactionsTemplate);
        }
        if(appends.length > 0){
            summaryMetricsContainer.append(self.getWellTemplate('App Cloud', appends));
        }
        summaryMetricsContainer.find('.reportingdashboard_heading').unbind('click').bind('click', function(e){
          var controller = "reporting.controller";
          var reportSuperType = $(this).data("target");
          var heading =  $(this).data("heading");
          console.log("calling controller " + controller + " for report type " + reportSuperType + " over period of " + period + "days");
          controller = $fw.client.tab.admin.getController(controller);
          self.hide();
          controller.displayGraphs(period, appGuid,reportSuperType, heading);
        });
        summaryMetricsContainer.find('a.interactive_heading').unbind('click').click(function(e){
          e.preventDefault();
          var active = $(this).data("target");
          console.log("active view will be", active);
          $('.reporting_pills > li.active').removeClass("active");
          $('.reporting_pills > li#'+active).addClass("active");
          var reportSuperType = $(this).closest('.reportdashboard_div').find('h4').data('target');
          var heading = $(this).closest('.reportdashboard_div').find('h4').data('heading');
          var controller = "reporting.controller";
          controller = $fw.client.tab.admin.getController(controller);
          self.hide();
          controller.displayGraphs(period, appGuid, reportSuperType,heading);
        });
        summaryMetricsContainer.find('.reportdashboard_link i').unbind('click').click(function(e){
          e.preventDefault();
          $(this).prev('a').trigger('click');
        });
      }
    });
  },

  populateTotals: function(params, cb){
    var self = this;
    var dao = new application.MetricsDataLocator($fw.getClientProp("reporting-sampledata-enabled"));
    var metricsSeries = [];
    $(params.metric).each(function (indx, metric){
      metricsSeries.push(function (callback){
        var p = params;
        p.metric = metric;
        dao.getData(p,"list",Constants.READ_APP_METRICS_URL, function (data){
          var total = self.calculateTotal(data);
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
    html += '<div class="span11 offset1 reportingdashboard_image_container">';
    html += '<div class="span9 offset2">';
    html += '<ul class="nav nav-pills">';
    html += '<li class="reportdashboard_link"><a class="interactive_heading" data-target="by_date" href="#">By Date</a><i class="icon-calendar icon-4x"></i></li>';
    html += '<li class="reportdashboard_link"><a class="interactive_heading" data-target="by_device" href="#">By Platform</a><i class="icon-mobile-phone icon-4x"></i></li>';
    html += '<li class="reportdashboard_link"><a class="interactive_heading" data-target="by_location" href="#">By Location</a><i class="icon-globe icon-4x"></i></li>';
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
