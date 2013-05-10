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
    'click .event_alerts table td:not(.controls)': 'showAlertDetails',
    'click .event_alerts table td input[type=checkbox]':'alertSelected'
  },

  initialize: function() {
    this.collection = App.collections.event_alerts;
    this.collection.bind('sync add destroy', this.render, this);
    this.collection.fetch();
    this.alertFilter = App.models.alertFilters;
    this.alertFilter.bind('sync', this.renderFilters, this);
    this.alertFilter.fetch();
    this.notifications =  App.collections.cloud_events;
    this.notifications.bind("sync", this.renderNotifications, this);
    this.notifications.fetch();
    var html = $("#event-alerts-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template()).show();
  },

  reload: function(){
    this.collection.fetch();
    this.notifications.fetch();
  },

  render: function() {
    var data = this.collection.toJSON();
    _.each(data, function(el, index){
      el.control = "<input type='checkbox' class='row_control'>";
    });

    if(!this.table_view){

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
        "sDom":"<'row-fluid'<'span12'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
        "bLengthChange": false,
        "iDisplayLength": 5,
        "bInfo": true
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

  renderNotifications: function(){
    var emptyNotifications = new App.Collection.CloudEvents([]);
    if(!this.notificationsView){
      this.filteredNotifications = emptyNotifications;
      this.notificationsView = new App.View.CloudNotificationsTable({
        collection: this.filteredNotifications,
        displayLength: 5,
        oLanguage: {
          sEmptyTable: "Please select alerts in the table above to view events."
        }
      });
      this.notificationsView.render();
    } else {
      this.filteredNotifications.reset(emptyNotifications.toJSON());
    }
    this.$el.find('.event_notifications_table_container').html(this.notificationsView.el);


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
    var alertView = new App.View.Alert({model: alert, collection:self.collection});
    alertView.render();
  },

  showAlertDetails: function(e){
    e.preventDefault();
    var self = this;
    var guid = $(e.currentTarget).closest('tr').data('guid');
    var obj = this.collection.findWhere({guid: guid});
    var alertView = new App.View.Alert({model: obj,  collection:self.collection});
    alertView.render();
  },

  renderFilters: function(){
    console.log(this.alertFilter);
    App.collections.categoryFilters = new App.Collection.AlertFilters(this.alertFilter.get("eventCategories"));
    App.collections.eventNameFilters = new App.Collection.AlertFilters(this.alertFilter.get("eventNames"));
    App.collections.severityFilters = new App.Collection.AlertFilters(this.alertFilter.get("eventSeverities"));
  },

  alertSelected: function(e){
    var self = this;
    if(this.$el.find("table td input:checked").length > 0){
      var guid = $(e.currentTarget).closest('tr').data('guid');
      var obj = this.collection.findWhere({guid: guid});
      this.$el.find('.alert_delete_btn').removeClass("disabled").removeAttr("disabled").unbind('click').bind('click', function(event){
        event.preventDefault();
        var confirm = new App.View.ConfirmView({
          message: "Are you sure you want to delete these alerts?",
          success: function(){
            self.deleteAlerts();
          }
        });
        confirm.render();
      });
      if(this.filteredNotifications){
        this.filterEvents(obj);
      }
    } else {
      self.$el.find('.alert_delete_btn').unbind("click").addClass("disabled").attr("disabled", "disabled");
      if(this.filteredNotifications){
        this.filteredNotifications.reset(new App.Collection.CloudEvents([]).toJSON());
      }
    }
  },

  deleteAlerts: function(){
    var self = this;
    var checkedRows = this.$el.find("table td input:checked");
    var guids = [];
    for(var i=0;i<checkedRows.length;i++){
      var guid = $(checkedRows[i]).closest('tr').data('guid');
      guids.push(function(guid){
        return function(callback){
          var obj =  self.collection.findWhere({guid: guid});
          obj.destroy({success: function(){
            callback();
          }, error: function(){
            callback(guid);
          }})
        }
      }(guid));
    }
    async.parallel(guids, function(err, results){
      self.$el.find('.alert_delete_btn').unbind("click").addClass("disabled").attr("disabled", "disabled");
      if(self.filteredNotifications){
        self.filteredNotifications.reset(new App.Collection.CloudEvents([]).toJSON());
      }
    });
  },

  filterEvents : function(filter){
    var eventClasses = filter.get("eventCategories");
    var eventStates = filter.get("eventNames");
    var severities = filter.get("eventSeverities");
    var models = this.notifications.models;
    for(var i=0;i<models.length;i++){
      var model = models[i];
      var match = false;
      if(eventClasses === "" || eventClasses.indexOf(model.get("category")) > -1){
        match = true;
      } else {
        match = false;
      }
      if(match && (eventStates === "" || eventStates.indexOf(model.get("eventType")) > -1)){
        match = true;
      } else {
        match = false;
      }
      if(match && (severities === "" ||severities.indexOf(model.get("severity")) > -1 )){
        match = true;
      } else {
        match = false;
      }
      if( match ){
        if(!this.filteredNotifications.findWhere({guid: model.get('guid')})){
          this.filteredNotifications.add(model);
        }
      }
    }
  }
});

App.View.ConfirmView = Backbone.View.extend({
  tagName: "div",
  className:"modal hide fade in",
  events: {
    'click .confirm': 'confirm'
  },

  render: function(){
    var self = this;
    var template = Handlebars.compile($('#confirm-modal-template').html());
    this.$el.html(template(this.options));
    this.$el.modal({keyboard:false, backdrop:"static"});
    this.$el.on("hidden", function(){
      self.remove();
    });
  },

  confirm: function(){
    var self = this;
    this.$el.modal("hide");
    setTimeout(function(){
      if(self.options && self.options.success){
        self.options.success();
      }
    }, 200);
  }
});

App.View.Alert = Backbone.View.extend({
   events:{
     'click .save_alert_btn': "saveAlert",
     'click .test_emails_btn':'testEmail',
     'click .clone_alert_btn' : "cloneAlert"
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
         var fieldName = fields[i].name;
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
     var enableClone = this.model.isNew() ? false: true;
     this.$el.html(template({alert: this.model, header:header, enableClone: enableClone}));
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
     var self = this;
     this.model.off("invalid").on("invalid", function(m, error){
       self. showError(error);
     });
     this.model.set("alertName", this.$el.find('#input_alertName').val());
     this.model.set("eventCategories", (this.$el.find('#input_eventCategories').val()||[]).join(","));
     this.model.set("eventNames", (this.$el.find('#input_eventNames').val() || []).join(","));
     this.model.set("eventSeverities", (this.$el.find('#input_eventSeverities').val() || []).join(","));
     this.model.set("emails", this.$el.find('#input_emails').val());
     this.model.save(undefined, {success: function(model, response, options){
       if(self.collection){
         self.collection.add(model);
       }
       self.$el.modal("hide");
     }, error: function(model, res){
       self.showError(res.error);
     }});
   },

   cloneAlert: function(e){
     e.preventDefault();
     this.$el.modal("hide");
     var self = this;
     var collection = self.collection;
     setTimeout(function(){
       var obj = self.model.clone();
       obj.unset("guid");
       obj.set("alertName", self.model.get("alertName") + "_cloned");
       var clonedView = new App.View.Alert({model: obj, collection: collection});
       clonedView.render();
     },500);
   },

   showError: function(error){
     var temp = $('#event-alert-message-template').html();
     var template = Handlebars.compile(temp);
     this.$el.find("form").before(template({type:"error", message: error}));
   },

   showInfo: function(message){
     var temp = $('#event-alert-message-template').html();
     var template = Handlebars.compile(temp);
     this.$el.find("form").before(template({type:"success", message: message}));
   },

   testEmail: function(e){
     e.preventDefault();
     var emails = this.$el.find('#input_emails').val();
     if(emails === ""){
       this.showError("Emails field is empty");
       return;
     } else {
       var invalid = this.model.checkEmailAddresses(emails);
       if(invalid){
         this.showError(invalid + " is not a valid email address");
         return;
       }
       var self = this;
       this.model.testEmails(emails, {success: function(){
         self.showInfo("Email sent. Please check your inbox.");
       }, error: function(){
         self.showError("Failed to send email");
       }});
     }
   }
});