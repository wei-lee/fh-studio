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
    this.collection.bind('sync', function(){
      this.render();
    }, this);
    this.collection.fetch();
    this.alertFilter = this.options.alertFilter;
    this.alertFilter.bind('sync', function(){
      this.renderFilters();
    }, this);
    this.alertFilter.fetch();
    this.notifications =  this.options.sysEvents;
    this.notifications.bind("sync", function(){
      this.renderNotifications();
    }, this);
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
    this.collection.off("add destroy").on("add destroy", function(){
      this.render();
    }, this);
    var data = this.collection.toJSON();
    _.each(data, function(el, index){
      el.control = Handlebars.compile($('#alert-checkbox-template').html())();
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
          }, {
            "sTitle" : "Enabled",
            "mDataProp": "enabled"
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
      this.table_view.$el.find(".dataTables_filter").addClass("span3");
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
          sEmptyTable: "Please use the checkboxes to select alerts in the table above to view events."
        }
      });
      this.notificationsView.render();
      this.$el.find('.event_notifications_table_container').html(this.notificationsView.el);
    } else {
      this.filteredNotifications.reset(emptyNotifications.toJSON());
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
    var alertView = new App.View.Alert({model: alert, collection:self.collection});
    alertView.render();
  },

  showAlertDetails: function(e){
    e.preventDefault();
    var self = this;
    var guid = $(e.currentTarget).closest('tr').data('guid');
    if(guid){
      var obj = this.collection.findWhere({guid: guid});
      var alertView = new App.View.Alert({model: obj,  collection:self.collection});
      alertView.render();
    }
  },

  renderFilters: function(){
    console.log(this.alertFilter);
    App.collections.categoryFilters = new App.Collection.AlertFilters(this.alertFilter.get("eventCategories"));
    App.collections.eventNameFilters = new App.Collection.AlertFilters(this.alertFilter.get("eventNames"));
    App.collections.severityFilters = new App.Collection.AlertFilters(this.alertFilter.get("eventSeverities"));
  },

  alertSelected: function(e){
    var self = this;
    var objs = [];
    var checked = self.$el.find("table td input:checked");
    if(checked && checked.length > 0){
      _.each(checked, function(el){
        var guid = $(el).closest('tr').data('guid');
        var obj = self.collection.findWhere({guid: guid});
        objs.push(obj);
      });
      self.$el.find('.alert_delete_btn').removeClass("disabled").removeAttr("disabled").unbind('click').bind('click', function(event){
        event.preventDefault();
        var confirm = new App.View.ConfirmView({
          message: "Are you sure you want to delete these alerts?",
          success: function(){
            self.deleteAlerts();
          }
        });
        confirm.render();
      });
    } else {
      if(!self.$el.find('.alert_delete_btn').hasClass("disabled")){
        self.$el.find('.alert_delete_btn').addClass("disabled").attr("disabled", "disabled").unbind("click");
      }
    }
    

    if(self.filteredNotifications){
      self.filteredNotifications.reset(new App.Collection.CloudEvents([]).toJSON());
      self.filterEvents(objs);
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
          }});
        };
      }(guid));
    }
    async.parallel(guids, function(err, results){
      self.$el.find('.alert_delete_btn').unbind("click").addClass("disabled").attr("disabled", "disabled");
      if(self.filteredNotifications){
        self.filteredNotifications.reset(new App.Collection.CloudEvents([]).toJSON());
      }
    });
  },

  filterEvents : function(filters){
    var self = this;
    var matched = self.notifications.filterEvents(filters);
    _.each(matched, function(model){
      if(!self.filteredNotifications.findWhere({guid: model.get('guid')})){
        self.filteredNotifications.add(model);
      }
    });
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
     'click .clone_alert_btn' : "cloneAlert",
     'click .disable_btn' : "disableAlert",
     'click .enable_btn': "enableAlert"
   },

   tagName: "div",
   className:"modal fade in alert_details_view",

   render: function(){
     var self = this;
     var temp = $("#event-alert-template").html();
     var template = Handlebars.compile(temp);
     var header = this.model.isNew()? "Create An Alert" : "Update An Alert";
     var enableClone = this.model.isNew() ? false: true;
     this.$el.html($(template({alertName: this.model.get("alertName"), emails: this.model.get("emails"), enabled: this.model.get("enabled"), header:header, enableClone: enableClone})));

     //need to append the view to the DOM so that select2 can render placeholders properly
     $("body").append(self.$el);
     if($fw && $fw.client){
       $fw.client.lang.insertLangForContainer(self.$el, "alert_details", true );
     }
     //init swap selects
     var categorySelector =  new App.View.SwapSelect({
       to : self.model.attributes.eventCategories,
       from: App.collections.categoryFilters,
       from_name_key: "name",
       uid: "name",
       label:"Event Categories",
       id:"input_eventCategories",
       el: self.$el.find('#input_eventCategories').parent()[0],
       placeholder: "Any Event Category"
     }).render();

     var eventNameCollection = App.collections.eventNameFilters.clone();
     var eventNameSelector =  new App.View.SwapSelect({
       to : self.model.attributes.eventNames,
       from: eventNameCollection,
       from_name_key: "name",
       uid: "name",
       label:"Event Names",
       id:"input_eventNames",
       el:self.$el.find('#input_eventNames').parent()[0],
       groupBy: "category",
       placeholder: "Any Event Name"
     }).render();

     var severitiesFilterSelector = new App.View.SwapSelect({
       to : self.model.attributes.eventSeverities,
       from: App.collections.severityFilters,
       from_name_key: "name",
       uid: "name",
       label:"Severities",
       id:"input_eventSeverities",
       el:self.$el.find('#input_eventSeverities').parent()[0],
       placeholder: "Any Level of Severity"
     }).render();

     var filterEvents = function(collection, filterKey, filterValues){
       var parts = filterValues;
       if(parts && parts.length > 0){
         var results = [];
         _.each(parts, function(el){
           var f = {};
           f[filterKey] = el;
           var filtered = collection.where(f);
           _.each(filtered, function(model){
             results.push(model.toJSON());
           });
         });
         collection.reset(results);
       }
     };

     var doFilter = function(){
       var categoeis = categorySelector.$select.val();
       var severities = severitiesFilterSelector.$select.val();
       var allEvents = App.collections.eventNameFilters.clone();
       filterEvents(allEvents, "category", categoeis);
       filterEvents(allEvents, "severity", severities);
       eventNameCollection.reset(allEvents.models);
     };

     //bind change event to the category select so that the event names will be filtered
     categorySelector.$select.on('change', function(event){
       console.log("Selected categories : " + event.val);
       doFilter();
     });

     severitiesFilterSelector.$select.on('change', function(event){
       console.log("Selected severites: " + event.val);
       doFilter();
     });

     var changeEvent = $.Event("change");
     severitiesFilterSelector.$select.trigger(changeEvent);

     this.$el.modal({keyboard:false, backdrop:"static"});
     this.$el.on("hidden", function(){
       console.log("Remove view for model: " + self.model.cid);
       self.remove();
     });
   },

   saveAlert: function(e, enabled){
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
     this.model.set("enabled", true);
     if(typeof enabled !== "undefined" && false === enabled){
       this.model.set("enabled", false);
     }
     this.model.save(undefined, {success: function(model, response, options){
       if(self.collection){
         self.collection.add(model);
       }
       self.$el.modal("hide");
     }, error: function(model, res){
       self.showError(res.error);
     }});
   },

  disableAlert: function(e){
    this.saveAlert(e, false);
  },

  enableAlert: function(e){
    this.saveAlert(e, true);
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