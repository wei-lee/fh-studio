var Reporting = Reporting || {};

Reporting.Dashboard = Reporting.Dashboard || {};

Reporting.Dashboard.Controller = Apps.Reports.Support.extend({
  showPreview: false,


  init: function () {
    this._super();
  },

  activePeriod : "",

  views: {
    reporting_dashboard: '#reports_dashboard_container',
    "reporting_graphs":'#report_graph'
  },

  tables : ["appinstallsdest","apptransactionsdest","appstartupsdest","appcloudcallsdest"],

  show: function () {
    var self = this;
    var ele = $(self.views.reporting_dashboard);
    self.initForm();
    $('.doReport:first').trigger("click");
    ele.show();


  },

  initForm : function(){
    console.log("init form");
    var self = this;
    $('.doReport').each(function (btn, ele){

        $(ele).unbind().click(function (event){
          console.log("clicked form report button");
          event.preventDefault();
          self.buildDashboard(ele);
        });
    });
  },

  buildDashboard : function (ele){
    console.log("build dashboard");
    var self = this;
    var dao = new application.MetricsDataLocator($fw.getClientProp("reporting-dashboard-sampledata-enabled"));
    var period = $(ele).data("period");
    self.initFormDates(period);
    //build the top 5 data and the domain level install etc data
    function populateTopResults(){
      var metric = ["appinstallsdest","apptransactionsdest","appstartupsdest","apprequestsdest"];
      var id = $fw.getClientProp("domain");

      var numResults = 5;
      var params = self.buildParams(id,period, metric, numResults);

      dao.getData(params,"list",Constants.READ_APP_METRICS_URL, function (data){
         console.log(dbItem);
        for(var dbItem in data){

          if(data.hasOwnProperty(dbItem)){
            console.log("dealing with item " + dbItem);
            var table = $('#'+dbItem);
            table.empty();
            table.append(" <tr><th>App Name</th><th>Total</th></tr>");

            //add the specific metric for use when the heading is clicked on
            for(var i=0; i< data[dbItem].length; i++){
              var result = data[dbItem][i];
              table.append("<tr><td class=\" appreportrow "+dbItem+"\" data-metric=\""+dbItem+"\" data-appid=\""+result.id.apid+"\">"+result.id.appname+"</td><td>"+result.value.total+"</td></tr>");
            }

            table.find('.appreportrow').css("cursor","pointer").unbind().click(function (){
              //call specific report type controller
            });
          }
        }

      }, function (err){
        console.log("error occurred get metrics data" + err);
      });



    }

    function populateDashboardTotals(){
      console.log("populate dashboard totals");
      var metrics = ["domaininstallsdest","domaintransactionsdest","domainstartupsdest","domainrequestsdest"];
      var id = $fw.getClientProp("domain");
      var metricsSeries = [];



      $(metrics).each(function (indx, metric){
        metricsSeries.push(function (callback){
          var params = self.buildParams(id, period, metric, 0);


          dao.getData(params,"list",Constants.READ_APP_METRICS_URL, function (data){
            var headingToUpdate = $('#' + metric);
            headingToUpdate.css("cursor","pointer");
            headingToUpdate.unbind().click(function (){
              var controller = "reporting.controller";
              var reportSuperType = $(this).data("target");
              var heading =  $(this).data("heading");
              console.log("calling controller " + controller + " for report type " + reportSuperType + " over period of " + period + "days");
              controller = $fw.client.tab.admin.getController(controller);
              self.hide();
              controller.show(period,$fw.getClientProp("domain"),reportSuperType, heading);
            });
            var heading = headingToUpdate.data("heading");

            var total = 0;
            for(var i=0; i < data.length; i++){
              var values = data[i].value;
              total+=values.total;
            }
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
