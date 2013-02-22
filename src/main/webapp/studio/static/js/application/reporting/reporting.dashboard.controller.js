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
    "appcloudcallsdest":{
      "enabled":true
    }
  },

  show: function () {
    var self = this;
    var ele = $(self.views.reporting_dashboard);
    self.initForm();


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

    $('a.interactive_heading').unbind('click').click(function (e){
         //set the active view to the target
      var active = $(this).data("pill");
      var heading = $(this).closest('.reportdashboard_div').data("heading");
      var metric = $(this).closest('.reportdashboard_div').data("target");
      console.log("active view will be", active);
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
  },

  buildDashboard : function (ele){
    var self = this;
    var sampleDataEnabled = ($fw.getClientProp("reporting-sampledata-enabled") === "false") ? false : true;
    var dao = new application.MetricsDataLocator(sampleDataEnabled);
    self.period = $(ele).data("period");
    console.log("period is set to " + self.period);
    var from = $('input[name="from"]').val();
    var to = $('input[name="to"]').val();
    to = new Date(to);
    from = new Date(from);

    //build the top 5 data and the domain level install etc data
    function populateTopResults(){
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
        console.log("error occurred get metrics data" + err);
      });



    }

    function populateDashboardTotals(){
      var metrics = ["domaininstallsdest","domaintransactionsdest","domainstartupsdest","domainrequestsdest"];
      var id = $fw.getClientProp("domain");
      var metricsSeries = [];



      $(metrics).each(function (indx, metric){
        metricsSeries.push(function (callback){
          var params = {};
          if(self.period){
            params =  self.buildParamsForDays(id, self.period, metric, 0);
          }else{
            params = self.buildParamsForDates(id, from, to, metric, 0);
          }


          dao.getData(params,"list",Constants.READ_APP_METRICS_URL, function (data){
            var headingToUpdate = $('#' + metric);
            headingToUpdate.css("cursor","pointer");
            headingToUpdate.unbind().click(function (){
              $('.reporting_pills > li.active').removeClass("active");
              $('.reporting_pills > li#dashboard').addClass("active");
              var controller = "reporting.controller";
              var reportSuperType = $(this).parent(".reportdashboard_div").data("target");
              var heading =  $(this).parent(".reportdashboard_div").data("heading");
              console.log("calling controller " + controller + " for report type " + reportSuperType + " over period of " + self.period + "days");
              controller = $fw.client.tab.admin.getController(controller);
              self.hide();
              controller.displayGraphs(self.period,$fw.getClientProp("domain"),reportSuperType, heading);
            });
            var heading = headingToUpdate.parent('.reportdashboard_div').data("heading");

            var total = self.calculateTotal(data);
            headingToUpdate.html(heading + " " + total);
            callback(undefined,data);
          },function (err){
            callback(err);
          });
        });
      });




      async.parallel(metricsSeries, function (err, data){
        console.log("finished metrics series");
         //data is in same order as the calls were pushed into the series.
         if(err){
           //warn of error;
           alert(err);
         }

      });

    }

    async.parallel([populateTopResults,populateDashboardTotals], function (){
       console.log("finished async populate");
    });

  },






  // Overwrite if needed for a particular apps controller.
  // This function will be called on every app controller whenever the 'selected' app has changed
  //  i.e. each controller is responsible for cleaning up after itself before it can show data/ui
  //       for newly selected app
  reset: function () {
    // n/a at generic app controller level
  }
});
