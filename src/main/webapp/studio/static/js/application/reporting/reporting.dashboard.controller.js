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

  show: function () {
    var self = this;
    var ele = $(self.views.reporting_dashboard);
    self.initForm();
    $('.doReport:first').trigger("click");
    ele.show();
    //trigger last seven days data
    console.log("show called dashboard");

  },

  initForm : function(){
    console.log("init form");
    var self = this;
    $('.doReport').each(function (btn, ele){

        $(ele).unbind().click(function (event){
          console.log("clicked form report button");
          event.preventDefault();
          self.buildData(ele, function (err, data){
            if(err) console.log(err);

            self.buildDashboard(data);
          });

        });
    });
  },

  buildDashboard : function (data){
    console.log("build dashboard");
    var self = this;

    function buildClickBehaviour(e){
      var target = e.data("target");
      var metric = e.data("metric");
      var heading = e.data("heading");

      var action = function (){
        console.log("no action defined");
      };
      if(target === self.views.reporting_graphs){
        action = function (){
          var containers = {
            "by_date":{
              "chart":"line",
              "container":$('.report_by_date'),
              "metric":metric+"dest"
            },
            "by_device":{
              "chart":"pie",
              "container":$('.report_by_device'),
              "metric":metric+"dest"
            },
            "by_location":{
              "chart":"geo",
              "container": $('.report_by_location'),
              "metric":metric+"geo"
            }
          };
          self.hide();
          console.log("show graphs for active period ", self.activePeriod);
          //self.drawChart()


          $('#graphType').html(heading);
          $('#report_graph').show();
          //chage to async
          for(var containerInfo in containers){
            if(containers.hasOwnProperty(containerInfo)){
              var info = containers[containerInfo];
              var params = self.buildParams(null, self.activePeriod, info.metric,0);
              params.dest = true;

              self.drawChart(info.chart, info.container, params, Constants.READ_APP_METRICS_URL, function (err) {

              });
            }
          }
        };
      }else if(target === "bydate"){
         action = function () {
           console.log("bydate");
         };
      }

      return action;

    }

    $('.interactive_heading').each(function (idx, ele){
      $(ele).unbind().click(buildClickBehaviour($(ele)));
    });

      for(var dbItem in data){
        if(data.hasOwnProperty(dbItem)){
          console.log("dealing with item " + dbItem);
          var table = $('#'+dbItem);
          table.empty();
          table.append(" <tr><th>App Name</th><th>Total</th></tr>");
          var hele = table.parent().find("h4:first");
          var headingContent = hele.data("heading");
          var total =0;
          for(var i=0; i< data[dbItem].length; i++){
            var result = data[dbItem][i];
            total+=result.value.total;
            $('#'+dbItem).append("<tr><td>"+result.id.appname+"</td><td>"+result.value.total+"</td></tr>");

          }
          hele.html(headingContent + " " + total);
        }
      }
  },

  buildParams : function (id, days, metric,num){
    var self = this;
    var to = new Date();
    var from = moment().subtract('days',days);
    from = new Date(from);
    to =  self.splitDate(to);
    from = self.splitDate(from);
    return  {
      "id":id || $fw.getClientProp("domain"),
      "metric":metric,
      "from":from,
      "to":to,
      "num":num || 0
    };
  },

  buildData : function (ele, cb){
    console.log("build data called", ele);
    var self = this;
    var period = $(ele).data("period");
    self.activePeriod = period;

    var from;
    var to;
    if(period){
      console.log("period found ", period);
      //get last period days
      to = new Date();
      from = moment().subtract('days',period);
      from = new Date(from);
      to =  self.splitDate(to);
      from = self.splitDate(from);
    }else{
      //look at form values
      console.log("no period look at form info");
    }


       //call for metrics data
    var dao = new application.MetricsDataLocator($fw.getClientProp("reporting-dashboard-sampledata-enabled"));



    var params = {
      "id":$fw.getClientProp("domain"),
      "metric":["appinstallsdest","apptransactionsdest","appstartupsdest","appcloudcallsdest"],
      "from":from,
      "to":to,
      "num":"5"
    };
    console.log("calling metrics" , params);
    dao.getData(params,"list",Constants.READ_APP_METRICS_URL, function (suc){
      return cb(undefined, suc);
    }, function (err){
      console.log("error occurred get metrics data" + err);
      return cb(err);
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
