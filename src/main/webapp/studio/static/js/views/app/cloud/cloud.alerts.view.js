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
    this.collection.fetch();
  },

  render: function() {
    var html = $("#event-alerts-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template()).show();

    this.$table_container = this.$el.find('.event_alerts');
    var data = this.collection.toJSON();
    _.each(data, function(el, index){
      el.control = "<input type='checkbox' class='row_control'>";
    });

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
  },

  createAlert: function(e){
    e.preventDefault();
    var alert = new  App.Model.EventAlert({
      "alertName": "",
      "eventCategories" :"",
      "eventNames":"",
      "eventSeverities" : "",
      "emails" : ""
    });
    var alertView = new App.View.Alert({model: alert});
    alertView.render();
  },

  showAlertDetails: function(e){
    e.preventDefault();
    var guid = $(e.currentTarget).closest('tr').data('guid');
    var obj = this.collection.findWhere({guid: guid});
    console.log(obj);
    var alertView = new App.View.Alert({model: obj});
    alertView.render();
  }
});

App.View.Alert = Backbone.View.extend({
   render: function(){
     var self = this;
     Handlebars.registerHelper("alertDetails", function(alert){
       var html = [];
       var fields = [{field:"alertName",name:"Alert Name"}, {field:"eventCategories",name:"Event Classes"}, {field:"eventNames", name:"Events"}, {field:"eventSeverities", name:"Severities"}, {field:"emails", name:"Emails"}];
       for(var i=0;i<fields.length;i++){
         var key = fields[i].field;
         var fieldName = fields[i].name
         var value = alert.get(key);
         html.push('<div class="control-group"><label class="control-label" for="input'+key+'">'+fieldName+'</label><div class="controls">');
         html.push('<input type="text" class="input-xlarge" id="input'+key+'" value="'+value+'"></input>');
         html.push('</div></div>');
       }
       return html.join("");
     });
     var temp = $("#event-alert-template").html();
     var template = Handlebars.compile(temp);
     var header = this.model.isNew()? "Create An Alert" : "Update An Alert";
     $('#modal_details').html(template({alert: this.model, header:header}));
     $('#modal_details').modal({keyboard:false, backdrop:"static"});
   }
});