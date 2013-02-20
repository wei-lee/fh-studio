var Reporting = Reporting || {};

Reporting.Controller = Reporting.Controller || {};

Reporting.Controller = Apps.Reports.Support.extend({

  showPreview: false,
  views: {
    "reporting_graphs":'#report_graph'
  },

  containerConfigs : {
    "by_date":{
      "chart":"line",
      "container":'.report_by_date',
      "metric":""
    },
    "by_device":{
      "chart":"pie",
      "container":'.report_by_device',
      "metric":""
    },
    "by_location":{
      "chart":"geo",
      "container": '.report_by_location',
      "metric":""
    }
  },

  "period":"",
  "context":"",
  "type":"",

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

  show:function (period, context, type, heading){
    var self = this;
    //need defaults?? for use on its own?
    self.period = period;

    self.context = context;
    self.type = type;
    self.heading = heading;
    self.buildContainerConfigs(type);
    self.initForm();
    $(self.views.reporting_graphs).show();
    //trigger click on activ nav element
    self.buildGraphs();
  },

  buildContainerConfigs : function (type){
    var self = this;
    self.containerConfigs.by_date.metric = type+"dest";
    self.containerConfigs.by_device.metric = type+"dest";
    self.containerConfigs.by_location.metric = type+"geo";
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
        self.period=undefined;
        var from = $('input[name="from"]').val();
        var to = $('input[name="to"]').val();

        to = new Date(to);
        from = new Date(from);

        console.log(from.toDateString() + " : " + to.toDateString());
      }else{

        self.period =p;
        self.initFormDates(self.period);
      }

    }
    var containers = self.containerConfigs;
    console.log(containers);
    if(self.heading){
      $('#graphType').html(self.heading);
    }
    for(var cont in containers){

      if(containers.hasOwnProperty(cont)){
        var info = containers[cont];
        var params = self.buildParams(self.context, self.period,info.metric,0);
        if(! self.period) {
          var days =self.daysBetweenDates(from, to);
          params = {
            id: self.context,
            metric: info.metric,
            from: self.splitDate(from),
            to: self.splitDate(to),
            days: days
          };
          console.log("report button clicked params set up ", params);
        }

        var container = $(info.container);
        params.dest = false;
        params.height = 210;
        if(info.chart === "geo"){

         // params.width

        }
        self.drawChart(info.chart, container, params, Constants.READ_APP_METRICS_URL, function (err) {

        });
      }
    }
  }

});