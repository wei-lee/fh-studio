var Reporting = Reporting || {};

Reporting.Controller = Reporting.Controller || {};

Reporting.Controller = Apps.Controller.extend({

  init: function() {},

  show: function(el) {
    $(this.views.container).empty();
    $(this.views.container).show();
    this.view = new App.View.ProjectAppAnalytics();
    this.view.render();
    $(this.views.container).append(this.view.el);
  }

  // showPreview: false,


  // containerConfigs : {
  //   "by_date":{
  //     "chart":"line",
  //     "container":'.report_by_date',
  //     "metric":""
  //   },
  //   "by_device":{
  //     "chart":"pie",
  //     "container":'.report_by_device',
  //     "metric":""
  //   },
  //   "by_location":{
  //     "chart":"geo",
  //     "container": '.report_by_location',
  //     "metric":""
  //   }
  // },
  // "metrics_url":Constants.READ_APP_METRICS_URL,
  // "period":"",
  // "context":"",
  // "type":"",

  // initForm: function (){
  //   var self = this;
  //   $('.doReport').each(function (btn, ele){

  //     $(ele).unbind().click(function (event){
  //       event.preventDefault();
  //       self.buildGraphs(ele);
  //     });
  //   });
  //   $('.reporting_pills > li a').unbind().click(function (e){
  //     console.log("reporting pills click");
  //     e.preventDefault();
  //     self.hide();
  //     $(self.views.reporting_graphs).show();
  //     $(self.views.reports_form).show();
  //     $('.reporting_pills > li.active').removeClass("active");
  //     $(this).parent('li').addClass("active");
  //     self.activeView = $(this).parent('li').attr("id");
  //     self.buildGraphs();
  //   });
  // },

  // //this uses the element to build up its data and is used for the apps tab
  // show:function (ev){
  //   var self = this;

  //   var ele = $(ev.target);

  //   var period = ele.data("period");
  //   var heading = ele.data("heading");
  //   var activePill = ele.data("pill");
  //   $('.reporting_pills > li.active').removeClass("active");
  //   $('.reporting_pills > li#'+activePill).addClass("active");
  //   var type = ele.data("target");
  //  // console.log($fw.data.get('inst').guid;
  //   var context = $fw.data.get('app').guid;
  //   self.displayGraphs(period, context, type, heading);
  //   self.initFormDates(period);

  // },
  // //this can be called from other controllers
  // displayGraphs : function (period, context, type, heading){
  //   var self = this;
  //   self.container = self.views.reporting_graphs;
  //   console.log("display graps " , period , context , type , heading);

  //   $(".doReport").removeClass('disabled');
  //   self.hide();
  //   $(self.views.reports_form).show();
  //   $(self.views.reporting_graphs).show();
  //   self.period = period;

  //   self.context = context;
  //   self.type = type;
  //   self.heading = heading;
  //   var activeView = $('.reporting_pills > li.active');
  //   self.activeView = activeView.attr("id");
  //   self.buildContainerConfigs(type);
  //   self.initForm();
  //   //trigger click on activ nav element
  //   self.buildGraphs();
  // },

  // buildContainerConfigs : function (type){
  //   var self = this;
  //   self.containerConfigs.by_date.metric = type+"dest";
  //   self.containerConfigs.by_device.metric = type+"dest";
  //   self.containerConfigs.by_location.metric = type+"geo";
  // },

  // //poss should abstract this
  // buildGraphs: function (ele){

  //   var self = this;
  //   console.log("ACTIVE VIEW ", self.activeView);
  //   if(ele){
  //     //get form date info
  //     //set period
  //     var p = $(ele).data("period");
  //     if(! p ){
  //       //get dates from date fields.

  //       var from = $('input[name="from"]').val();
  //       var to = $('input[name="to"]').val();

  //       to = new Date(to);
  //       from = new Date(from);

  //       self.period = self.daysBetweenDates(from,to);

  //       console.log(from.toDateString() + " : " + to.toDateString());
  //     }else{

  //       self.period =p;
  //       self.initFormDates(self.period);
  //     }

  //   }
  //   //else use active period
  //   var containers = self.containerConfigs;
  //   if(self.heading){
  //     console.log("heading is set " + self.heading);
  //     $(self.views.report_heading).html(self.heading).show();
  //   }
  //   var info;
  //   var params;
  //   var container;
  //   if(self.activeView === "dashboard"){
  //     for(var cont in containers){

  //       if(containers.hasOwnProperty(cont)){
  //         info = containers[cont];
  //         params = self.buildParamsForDays(self.context, self.period,info.metric,0);
  //         console.log("METRICS PARAMS", params);
  //         container = $(info.container);
  //         container.show();
  //         params.dest = false;
  //         params.height = 225;

  //         self.drawChart(info.chart, container, params, self.metrics_url, function (err) {
  //           if(err){
  //             //ignored as this error is shown by the draw chart functionality as no results for selected options.
  //           }
  //         });
  //       }
  //     }
  //   }else if(self.containerConfigs[self.activeView]){
  //     info = self.containerConfigs[self.activeView];

  //     params = self.buildParamsForDays(self.context, self.period,info.metric,0);
  //     container = $(info.container);
  //     container.show();
  //     params.height = 400;
  //     params.dest=true;
  //     self.drawChart(info.chart, container, params, self.metrics_url, function (err) {
  //          if(err){
  //            //ignored as this error is shown by the draw chart functionality as no results for selected options.
  //          }
  //     });
  //   }
  // }

});