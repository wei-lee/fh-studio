var Reporting = Reporting || {};

Reporting.Controller = Reporting.Controller || {};

Reporting.Controller = Apps.Reports.Support.extend({

  showPreview: false,
  views: {
    "reporting_graphs":'#reporting_layout .reporting_graph',
    "report_by_date":'.report_by_date',
    "report_by_device":'.report_by_device',
    "report_by_location":".report_by_location",
    "reports_form":"#reporting_layout .reporting_form"
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
    $('.reporting_pills > li a').unbind().click(function (e){
      console.log("reporting pills click");
      e.preventDefault();
      self.hide();
      $(self.views.reporting_graphs).show();
      $(self.views.reports_form).show();
      $('.reporting_pills > li.active').removeClass("active");
      $(this).parent('li').addClass("active");
      self.activeView = $(this).parent('li').attr("id");
      self.buildGraphs();
    });
  },

  //this uses the element to build up its data and is used for the apps tab
  show:function (ev){
    var self = this;

    var ele = $(ev.target);

    var period = ele.data("period");
    var heading = ele.data("heading");
    var activePill = ele.data("pill");
    $('.reporting_pills > li.active').removeClass("active");
    $('.reporting_pills > li#'+activePill).addClass("active");
    var type = ele.data("target");
    var context = $fw.data.get('app').guid || $fw.getClientProp("domain");
    self.displayGraphs(period, context, type, heading);
    self.initFormDates(period);
  },
  //this can be called from other controllers
  displayGraphs : function (period, context, type, heading){
    console.log("display graps " , period , context , type , heading);
    var self = this;
    self.hide();
    $(self.views.reports_form).show();
    $(self.views.reporting_graphs).show();
    self.period = period;

    self.context = context;
    self.type = type;
    self.heading = heading;
    var activeView = $('.reporting_pills > li.active');
    self.activeView = activeView.attr("id");
    self.buildContainerConfigs(type);
    self.initForm();
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
    console.log("ACTIVE VIEW ", self.activeView);
    if(ele){
      //get form date info
      //set period
      var p = $(ele).data("period");
      if(! p ){
        //get dates from date fields.

        var from = $('input[name="from"]').val();
        var to = $('input[name="to"]').val();

        to = new Date(to);
        from = new Date(from);

        self.period = self.daysBetweenDates(from,to);

        console.log(from.toDateString() + " : " + to.toDateString());
      }else{

        self.period =p;
        self.initFormDates(self.period);
      }

    }
    //else use active period
    var containers = self.containerConfigs;
    if(self.heading){
      $('#graphType').html(self.heading);
    }
    var info;
    if(self.activeView === "dashboard"){
      for(var cont in containers){

        if(containers.hasOwnProperty(cont)){
          info = containers[cont];
          var params = self.buildParamsForDays(self.context, self.period,info.metric,0);
          console.log("METRICS PARAMS", params);
          var container = $(info.container);
          container.show();
          params.dest = false;
          params.height = 225;
          if(info.chart === "geo"){


          }
          self.drawChart(info.chart, container, params, Constants.READ_APP_METRICS_URL, function (err) {
                 console.log(err);
          });
        }
      }
    }else if(self.containerConfigs[self.activeView]){
      info = self.containerConfigs[self.activeView];
      console.log(info);
      var params1 = self.buildParamsForDays(self.context, self.period,info.metric,0);
      var container1 = $(info.container);
      container1.show();
      params1.height = 400;
      params1.dest=true;
      self.drawChart(info.chart, container1, params1, Constants.READ_APP_METRICS_URL, function (err) {

      });
    }
  }

});