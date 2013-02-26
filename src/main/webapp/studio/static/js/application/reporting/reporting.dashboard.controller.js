var Reporting = Reporting || {};

Reporting.Dashboard = Reporting.Dashboard || {};

Reporting.Dashboard.Controller = Apps.Reports.Support.extend({
  showPreview: false,


  init: function () {
    this._super();
  },

  activePeriod : "",

  reports_controller : "reporting.controller",
  reports_per_app_controller : "reporting.perapp.controller",

  views: {
    reporting_dashboard: '#reporting_layout #reports_dashboard_container',
    "reporting_graphs":'#reporting_layout #report_graph',
    "reporting_form":"#reporting_layout .reporting_form"
  },

  tables :{
    appinstallsdest:{
    "enabled":true
    },
    "apptransactionsdest":{
      "enabled":true
    },
    "appstartupsdest":{
      "enabled":true
    },
    "apprequestsdest":{
      "enabled":true
    }
  },

  show: function () {
    var self = this;
    var ele = $(self.views.reporting_dashboard);
    self.initForm();

    self.container = self.views.reporting_dashboard;


    self.initDatepickers($(self.views.reporting_form+' input[name="from"]'), $(self.views.reporting_form + ' input[name="to"]'));
    $('.doReport:first').trigger("click");
    $(self.views.reporting_form).show();
    ele.show();

  },

  initForm : function(){
    var self = this;
    $('.doReport').each(function (btn, ele){

        $(ele).removeClass('disabled').unbind().click(function (event){
          event.preventDefault();
          self.buildDashboard(ele);
        });
    });


  },

  buildDashboard : function (ele){
    var self = this;
    var sampleDataEnabled =  ($fw.getClientProp("reporting-sampledata-enabled") !== "false");
    var dao = new application.MetricsDataLocator(sampleDataEnabled);
    self.period = $(ele).data("period");
    console.log("period is set to " + self.period);
    var from = $('input[name="from"]').val();
    var to = $('input[name="to"]').val();
    to = new Date(to);
    from = new Date(from);

    //build the top 5 data and the domain level install etc data
    function populateTopResults(cb){
      var metric = ["appinstallsdest","apptransactionsdest","appstartupsdest","apprequestsdest"];
      var id = $fw.getClientProp("domain");
      var numResults = 5;
      if(self.period){
        self.initFormDates(self.period);
      }else{
        self.period = self.daysBetweenDates(from,to);
      }
      var params = self.buildParamsForDays(id,self.period, metric, numResults);

      dao.getData(params,"list",Constants.READ_APP_METRICS_URL, function (data){
        for(var dbItem in data){

          if(data.hasOwnProperty(dbItem)){
            var table = self.tables[dbItem];
            if(table && table.enabled){
              table = $('#'+dbItem);

              table.empty();
              table.append(" <tr><th>App Name</th><th>Total</th></tr>");

              //add the specific metric for use when the heading is clicked on
              for(var i=0; i< data[dbItem].length; i++){
                var result = data[dbItem][i];
                table.append("<tr><td class=\" appreportrow "+dbItem+"\" data-metric=\""+dbItem+"\" data-appid=\""+result.id.apid+"\">"+result.id.appname+"</td><td>"+result.value.total+"</td></tr>");
              }
              table.find('.appreportrow').css("cursor","pointer").unbind().click(function (e){
                //call specific report type controller
                var appid = $(this).data('appid');
                var appname = $(this).text();
                var period = self.period;
                console.log("show app metrics with appid = " + appid + " appname = " + appname + " period = " + period);
                self.hide();
                var reportingNav = $('.reporting_nav_list');
                reportingNav.removeClass('active');
                reportingNav.find('li:eq(1)').addClass('active');
                $fw.client.tab.admin.getController(self.reports_per_app_controller).show({guid: appid, title: appname, period: period});
              });
            }
          }
        }

      }, function (err){
        console.log(err);
        self.showAlert("Warning", "Error occurred getting metrics data");
      });




    }

    function populateDashboardTotals(cb){
      $('.reportdashboard_div').remove();
      var metrics = [
        {"metric":"domainrequestsdest","heading":"Requests","target":"domainrequests","isEnabled":$fw.getClientProp("cloudrequest-reporting-enabled") || "true","container":".appcloud", "boarder":true},
        {"metric":"domaininstallsdest","heading":"Installs","target":"domaininstalls","isEnabled": "true","container":".appclient",boarder:true},
        {"metric":"domainstartupsdest","heading":"Start Ups","target":"domainstartups","isEnabled":"true" , container:".appclient",boarder:false},
        {"metric":"domaintransactionsdest", "heading":"Active Users","target":"domaintransactions","isEnabled":$fw.getClientProp("transaction-reporting-enabled") || "true","container":".appcloud", boarder:false}

      ];
      var id = $fw.getClientProp("domain");
      var metricsSeries = [];

      $(metrics).each(function (indx, metric){

        metricsSeries.push(function (callback){
          var params = {};
          if(self.period){
            params =  self.buildParamsForDays(id, self.period, metric.metric, 0);

          }else{
            params = self.buildParamsForDates(id, from, to, metric.metric, 0);
          }
          params.domain = id;
          var tableId = metric.metric.replace("domain","app");
          if("true" === metric.isEnabled){
           var template = self.getTemplate(metric.metric, metric.boarder,metric.target,metric.heading, metric.heading + " ", tableId);
            $(metric.container).append(template);
          }


          dao.getData(params,"list",Constants.READ_APP_METRICS_URL, function (data){
            var total = self.calculateTotal(data);
            if("true" === metric.isEnabled){
              var headingToUpdate = $('#' + metric.metric);
              headingToUpdate.html(metric.heading + " " + total);

              headingToUpdate.unbind().click(function (){
                $('.reporting_pills > li.active').removeClass("active");
                $('.reporting_pills > li#dashboard').addClass("active");
                var controller = "reporting.controller";
                var reportSuperType = $(this).data("target");
                var heading =  $(this).data("heading");
                console.log("calling controller " + controller + " for report type " + reportSuperType + " over period of " + self.period + "days" + " setting heading " + heading);
                controller = $fw.client.tab.admin.getController(controller);
                self.hide();
                controller.displayGraphs(self.period,$fw.getClientProp("domain"),reportSuperType, heading);
              });
            }


            callback(undefined,data);
          },function (err){
            callback(err);
          });
        });
      });

      async.parallel(metricsSeries, function (err, data){
         //data is in same order as the calls were pushed into the series.

         if(err){
           //warn of error;
           console.log(err);
           self.showAlert("Warning", "Error occurred retrieving metrics data");
         }
        $('a.interactive_heading').unbind('click').click(function (e){
          //set the active view to the target
          var active = $(this).data("target");
          var reportingContainerDiv = $(this).closest('.reportdashboard_div');
          var heading = reportingContainerDiv.find('.reportingdashboard_heading').data("heading");
          var metric = reportingContainerDiv.find('.reportingdashboard_heading').data("target");

          $('.reporting_pills > li.active').removeClass("active");
          $('.reporting_pills > li#'+active).addClass("active");

          var controller = $fw.client.tab.admin.getController(self.reports_controller);
          self.hide();
          controller.displayGraphs(self.period,$fw.getClientProp("domain"),metric, heading);
        });

        $('.reportdashboard_link i').unbind('click').click(function(e){
          e.preventDefault();
          $(this).prev('a').trigger('click');
        });

      });

    }

    async.series([populateDashboardTotals,populateTopResults], function (errs, oks){
      if(errs){
        console.log("errors populating data ", errs);
      }

    });

  },

  getTemplate: function(id, showboarder, target, heading, headingText, toptable){
    var html = '<div class="span6 reportdashboard_div ' + (showboarder?'reportdashboard_div_boarder':'') + '" style="margin: 3px;">';

    html += '<div class="span11 offset0 reportingdashboard_image_container">';
    html += ' <h4 class="reportingdashboard_heading interactive_heading" id="'+id+'" data-target="'+target+'" data-heading="'+heading+'" style="cursor: pointer">'+headingText+'</h4>';
    html += '<div class="span9 offset3">';
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
  },




  // Overwrite if needed for a particular apps controller.
  // This function will be called on every app controller whenever the 'selected' app has changed
  //  i.e. each controller is responsible for cleaning up after itself before it can show data/ui
  //       for newly selected app
  reset: function () {
    // n/a at generic app controller level
  }
});
