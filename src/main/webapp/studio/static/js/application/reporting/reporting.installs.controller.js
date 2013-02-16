var Reporting = Reporting || {};

Reporting.Installs = Reporting.Installs || {};

Reporting.Installs.Controller = Apps.Reports.Support.extend({
  showPreview: false,
  views: {
    "reporting_graphs":'#report_graph'
  },

  containers : {
    "by_date":{
      "chart":"line",
      "container":$('.report_by_date'),
      "metric":"appinstallsdest"
    },
    "by_device":{
      "chart":"pie",
      "container":$('.report_by_device'),
      "metric":"appinstallsdest"
    },
    "by_location":{
      "chart":"geo",
      "container": $('.report_by_location'),
      "metric":"appinstallsgeo"
    }
  },

  "period":"",
  "context":"",

  init: function () {
    this._super();
  },

  initForm: function (){
    var self = this;
    $('.doReport').each(function (btn, ele){

      $(ele).unbind().click(function (event){
        console.log("clicked form report button");
        event.preventDefault();
        self.buildGraphs(ele);
      });
    });
  },

  show:function (period, context){
    var self = this;
    self.period = period;
    self.context = context;
    self.initForm();
    $(self.views.reporting_graphs).show();
    self.buildGraphs();
  },
  //poss should abstract this
  buildGraphs: function (ele){

    var self = this;

     if(ele){
        //get form date info
       //set period
       var p = $(ele).data("period");
       if(! p ){
         //get dates from date fields.

       }

     }
    var containers = self.containers;
    for(var cont in containers){

      if(containers.hasOwnProperty(cont)){
        var info = containers[cont];
        var params = self.buildParams(self.context, self.period,info.metric,0);
        self.drawChart(info.chart, info.container, params, Constants.READ_APP_METRICS_URL, function (err) {

        });
      }
    }
  }

});