var Reporting = Reporting || {};

Reporting.Controller = Reporting.Controller || {};
Reporting.App = Reporting.App || {};
Reporting.App.Controller = Reporting.Controller.extend({

  views: {
    "reporting_graphs":'#app_content .reporting_graph',
    "report_by_date":'#app_content .report_by_date',
    "report_by_device":'#app_content .report_by_device',
    "report_by_location":"#app_content .report_by_location",
    "reports_form":"#app_content .reporting_form"
  },

  containerConfigs : {
    "by_date":{
      "chart":"line",
      "container":'#app_content .report_by_date',
      "metric":""
    },
    "by_device":{
      "chart":"pie",
      "container":'#app_content .report_by_device',
      "metric":""
    },
    "by_location":{
      "chart":"geo",
      "container": '#app_content .report_by_location',
      "metric":""
    }
  }

});