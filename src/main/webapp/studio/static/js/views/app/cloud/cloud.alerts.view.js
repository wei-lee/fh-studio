/**
 * Created with JetBrains WebStorm.
 * User: weili
 * Date: 02/05/2013
 * Time: 14:29
 * To change this template use File | Settings | File Templates.
 */
var App = App || {};
App.View = App.View || {};

App.View.EventAlerts = Backbone.View.extend({
  events: {
    'click .alert_create_btn': 'createAlert',
    'click table td:not(.controls)': 'showAlertDetails'
  },

  initialize: function() {
    this.collection = App.collections.event_alerts;
    this.collection.bind('sync', this.render, this);
    this.collection.bind('add', this.render, this);
    this.collection.bind('remove', this.render, this);
    this.collection.fetch();
    this.alertFilter = App.models.alertFilters;
    this.alertFilter.bind('sync', this.renderFilters, this);
    this.alertFilter.fetch();
  },

  render: function() {
    var data = this.collection.toJSON();
    _.each(data, function(el, index){
      el.control = "<input type='checkbox' class='row_control'>";
    });

    if(!this.table_view){
      var html = $("#event-alerts-template").html();
      var template = Handlebars.compile(html);
      this.$el.html(template()).show();

      this.$table_container = this.$el.find('.event_alerts');
      this.table_view = new App.View.DataTable({
        "aaData": data,
        "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
          // Append guid data
          $(nTr).attr('data-guid', sData.guid);
        },
        "aoColumns": [
          {
            sTitle: "",
            "bSortable": false,
            "sClass": "controls",
            "sWidth": "2%",
            "mDataProp": "control"
          },
          {
            "sTitle": "Alert Name",
            "mDataProp": "alertName"
          },{
            "sTitle":"Event Categories",
            "mDataProp": "eventCategories"
          },{
            "sTitle": "Severities",
            "mDataProp": "eventSeverities"
          }, {
            "sTitle": "Event Names",
            "mDataProp": "eventNames"
          }, {
            "sTitle": "Emails",
            "mDataProp": "emails"
          }],
        "bAutoWidth": false,
        "sPaginationType": 'bootstrap',
        "bDestroy": true,
        "sDom":"<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>"
      });
      this.$table_container.append(this.table_view.render().el);
      var controls = $('#event-alerts-controls-template').html();
      var controlsTemp = Handlebars.compile(controls);
      this.$table_container.find('.span12:first').append(controlsTemp());
    } else {
      this.$el.show();
      this.table_view.table.fnClearTable();
      this.table_view.table.fnAddData(data);
    }

  },

  createAlert: function(e){
    e.preventDefault();
    var self = this;
    var alert = new  App.Model.EventAlert({
      "alertName": "",
      "eventCategories" :"",
      "eventNames":"",
      "eventSeverities" : "",
      "emails" : ""
    });
    var alertView = new App.View.Alert({model: alert});
    alertView.render();
    alert.on("sync", function(model){
       self.collection.add(model);
    });
  },

  showAlertDetails: function(e){
    e.preventDefault();
    var guid = $(e.currentTarget).closest('tr').data('guid');
    var obj = this.collection.findWhere({guid: guid});
    console.log(obj);
    var alertView = new App.View.Alert({model: obj});
    alertView.render();
  },

  renderFilters: function(){
    console.log(this.alertFilter);
    App.collections.categoryFilters = new App.Collection.AlertFilters(this.alertFilter.get("eventCategories"));
    App.collections.eventNameFilters = new App.Collection.AlertFilters(this.alertFilter.get("eventNames"));
    App.collections.severityFilters = new App.Collection.AlertFilters(this.alertFilter.get("eventSeverities"));
    console.log(App.collections.categoryFilters);
  }
});

App.View.Alert = Backbone.View.extend({
   events:{
     'click .save_alert_btn': "saveAlert"
   },

  tagName: "div",
  className:"modal hide fade in",
   render: function(){
     var self = this;
     Handlebars.registerHelper("alertDetails", function(alert){
       var html = [];
       var fields = [{field:"alertName",name:"Alert Name"}, {field:"eventCategories",name:"Event Classes"}, {field:"eventNames", name:"Events"}, {field:"eventSeverities", name:"Severities"}, {field:"emails", name:"Emails"}];
       for(var i=0;i<fields.length;i++){
         var key = fields[i].field;
         var fieldName = fields[i].name
         var value = alert.get(key);
         html.push('<div class="control-group '+key+'_control"><label class="control-label" for="input_'+key+'">'+fieldName+'</label><div class="controls">');
         html.push('<input type="text" class="input-xlarge" id="input_'+key+'" value="'+value+'"></input>');
         if(key === "emails"){
           html.push('<button class="btn test_emails_btn"> Test Emails </button>');
         }
         html.push('</div></div>');
       }
       return html.join("");
     });
     var temp = $("#event-alert-template").html();
     var template = Handlebars.compile(temp);
     var header = this.model.isNew()? "Create An Alert" : "Update An Alert";
     this.$el.html(template({alert: this.model, header:header}));
     var categoryFilter = this.$el.find('.eventCategories_control');
     categoryFilter.replaceWith(new App.View.SwapSelect({
       to : self.model.attributes.eventCategories,
       from: App.collections.categoryFilters,
       from_name_key: "name",
       uid: "name",
       label:"Event Classes",
       id:"input_eventCategories"
     }).render().$el.find('div.control-group'));
     var eventFilter = this.$el.find('.eventNames_control');
     eventFilter.replaceWith(new App.View.SwapSelect({
       to : self.model.attributes.eventNames,
       from: App.collections.eventNameFilters,
       from_name_key: "name",
       uid: "name",
       label:"Event States",
       id:"input_eventNames"
     }).render().$el.find('div.control-group'));
     var severitiesFilter = this.$el.find('.eventSeverities_control');
     severitiesFilter.replaceWith(new App.View.SwapSelect({
       to : self.model.attributes.eventSeverities,
       from: App.collections.severityFilters,
       from_name_key: "name",
       uid: "name",
       label:"Severities",
       id:"input_eventSeverities"
     }).render().$el.find('div.control-group'));

     this.$el.modal({keyboard:false, backdrop:"static"});
     this.$el.on("hidden", function(){
       console.log("Remove view for model: " + self.model.cid);
       self.remove();
     });
   },

   saveAlert: function(e){
     e.preventDefault();
     this.model.set("alertName", this.$el.find('#input_alertName').val());
     this.model.set("eventCategories", (this.$el.find('#input_eventCategories').val()||[]).join(","));
     this.model.set("eventNames", (this.$el.find('#input_eventNames').val() || []).join(","));
     this.model.set("eventSeverities", (this.$el.find('#input_eventSeverities').val() || []).join(","));
     this.model.set("emails", this.$el.find('#input_emails').val());
     this.model.save();
   }
});