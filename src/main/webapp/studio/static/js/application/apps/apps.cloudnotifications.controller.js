var Apps = Apps || {};

Apps.Cloudnotifications = Apps.Cloudnotifications || {};


// Notes:
// 
// This controller only exists to proxy Backbone view creation (since 
// giving the current Studio a router would take an age). Existing
// methods have likely moved to other subviews.

Apps.Cloudnotifications.Controller = Apps.Cloud.Controller.extend({
  // alert_timeout: 3000,

  // indexes: {
  //   when: 1,
  //   updatedBy: 2,
  //   eventType: 0,
  //   message: 3,
  //   guid: 4,
  //   dissmissed: 5
  // },

  // models: {
  //   notification_event: new model.CloudNotifications()
  // },

  views: {
    cloudnotifications_container: "#cloudnotifications_container",
    systemlog_container: "#cloud_notifications_pill",
    event_alerts_container: "#event_alerts_container",
    alerts_notification_container: "#alerts_notifications_container"
    // load_spinner: '#notifications_loading',
    // notification_table_container: '#notification_container'
  },

  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function(){
    var container = $(this.views.cloudnotifications_container);
    var self = this;
    $('a[data-toggle="pill"]', container).on('shown', function(e){
      $('.pill-pane', container).hide();
      var dataType = $(e.target).data("type");
      var paneId = $(e.target).attr("href");
      console.log("data type is " + dataType + "paneId is " + paneId );
      $(paneId, container).show();
      if(dataType.toLowerCase() === "cloud_notifications"){
        self.renderSystemlogs();
      } else if(dataType.toLowerCase() === "alerts"){
        self.renderAlerts();
      } else {
        self.renderAlertNotifications();
      }
    });

  },

  show: function() {
    this.initFn();
    var container = $(this.views.cloudnotifications_container);
    container.show();
    this._super(this.views.cloudnotifications_container);
    $('a[data-toggle="pill"]:first', container).parent('li').removeClass('active');
    $('a[data-toggle="pill"]:first', container).trigger('click');

    // $(this.views.load_spinner).show();
    // $(this.views.notification_table_container).hide();
    // this.loadNotifications();
  },

  renderSystemlogs : function(){
    if(!this.view){
      this.view = new App.View.CloudNotifications({
        el: this.views.systemlog_container
      });
    } else {
      this.view.render();
    }

    //this.view.render();
  },

  renderAlerts: function(){
    if(!this.alertsView){
      this.alertsView = new App.View.EventAlerts({
        el: this.views.event_alerts_container
      });
    } else {
      this.alertsView.render();
    }

    //this.alertsView.render();
  },

  renderAlertNotifications: function(){
    if(!this.alertNotificationView){
      this.alertNotificationView = new App.View.EventAlertNotifications({
        el: this.views.alerts_notification_container
      });
    } else {
      this.alertNotificationView.render();
    }
  }

  // loadNotifications: function() {
  //   var instGuid = $fw.data.get('inst').guid;
  //   var cloudEnv = $fw.data.get('cloud_environment');
  //   var self = this;
  //   self.models.notification_event.list(instGuid, cloudEnv, function(res) {
  //     $(self.views.load_spinner).hide();
  //     $(self.views.notification_table_container).show();
  //     self.renderFilters(res);
  //     var notifications = {};
  //     notifications.aoColumns = [];
  //     for (var k = 0; k < res.aoColumns.length; k++) {
  //       notifications.aoColumns.push(_.clone(res.aoColumns[k]));
  //     }
  //     var data = [];
  //     for (var i = 0; i < res.aaData.length; i++) {
  //       if (res.aaData[i][self.indexes.dissmissed] === false) {
  //         data.push(_.clone(res.aaData[i]));
  //       }
  //     }
  //     notifications.aaData = data;
  //     self.showNotifications(notifications);
  //     self.showAuditLog(res);
  //   }, function(err) {
  //     $(self.views.load_spinner).hide();
  //     self.showAlert('error', 'Failed to load notification events. Error: ' + err);
  //   }, true);
  // },

  // getFilterOptions: function(data, index) {
  //   var fields = [];
  //   for (var i = 0; i < data.length; i++) {
  //     var entry = data[i];
  //     var val = entry[index];
  //     if (fields.indexOf(val) === -1) {
  //       fields.push(val);
  //     }
  //   }
  //   return fields;
  // },

  // getOptionTemplate: function(val, capitalise) {
  //   return "<option value='" + val + "'>" + (capitalise ? js_util.capitaliseWords(val) : val) + "</option>";
  // },

  // renderFilters: function(res) {
  //   var self = this;
  //   var typeFilterField = $('#cloudNotificationsAuditLogTypeFilter', this.conatiner);
  //   var userFilterField = $('#cloudNotificationsAuditLogUserFilter', this.conatiner);
  //   typeFilterField.find('option:not(:first)').remove();
  //   userFilterField.find('option:not(:first)').remove();
  //   var typeFilters = this.getFilterOptions(res.aaData, this.indexes.eventType);
  //   for (var i = 0; i < typeFilters.length; i++) {
  //     typeFilterField.append(self.getOptionTemplate(typeFilters[i], true));
  //   }
  //   var userFilters = this.getFilterOptions(res.aaData, this.indexes.updatedBy);
  //   for (var k = 0; k < userFilters.length; k++) {
  //     userFilterField.append(self.getOptionTemplate(userFilters[k], false));
  //   }
  //   var instGuid = $fw.data.get('inst').guid;
  //   var cloudEnv = $fw.data.get('cloud_environment');
  //   $('#cloud_notifications_audit_log_filter').unbind('click').click(function(e) {
  //     e.preventDefault();
  //     var typefilter = typeFilterField.val();
  //     var userfilter = userFilterField.val();
  //     self.models.notification_event.list(instGuid,cloudEnv, function(res) {
  //       self.showAuditLog(res);
  //     }, function(err) {
  //       self.showAlert('error', 'Failed to load notification events audit log. Error: ' + err);
  //     }, true, typefilter, userfilter);
  //   });
  //   $('#cloud_notifications_audit_log_reset').unbind('click').click(function(e) {
  //     e.preventDefault();
  //     typeFilterField.val('all');
  //     userFilterField.val('all');
  //   });
  // },

  // showNotifications: function(res) {
  //   var self = this;
  //   self.addControls(res);
  //   self.notification_table = self.createTable('cloud_notification_events_table', res);
  // },

  // showAuditLog: function(res) {
  //   var self = this;
  //   self.notification_auditlog_table = self.createTable('cloud_notification_audit_log_table', res);
  // },

  // createTable: function(table_id, data) {
  //   var self = this;
  //   var table = $('#' + table_id, this.conatiner).dataTable({
  //     "bDestroy": true,
  //     "aaSorting": [
  //       [self.indexes.when, 'desc']
  //     ],
  //     "bAutoWidth": false,
  //     "sPaginationType": 'bootstrap',
  //     "sDom": "<'row-fluid'<'span12'>r>t<'row-fluid'<'span6'i><'span6'p>>",
  //     "bLengthChange": true,
  //     "iDisplayLength": 20,
  //     "bInfo": false,
  //     "aaData": data.aaData,
  //     "aoColumns": data.aoColumns,
  //     "fnRowCallback": function(nRow, aData, iDisplayIndex) {
  //       self.rowRender(nRow, aData, iDisplayIndex);
  //     }
  //   }).removeClass('hidden');

  //   if (data.aaData.length === 0) {
  //     // Adjust colspan based on visible columns for new colspan
  //     var visible_columns = $('.dataTable:visible th:visible').length;
  //     var no_data_td = $('.dataTable:visible tbody td');
  //     no_data_td.attr('colspan', visible_columns);
  //     no_data_td.text('No notifications found.');
  //   }

  //   return table;

  // },

  // addControls: function(res) {

  //   // Add control column
  //   res.aoColumns.push({
  //     sTitle: "Controls",
  //     "bSortable": false,
  //     "sClass": "controls",
  //     "sWidth": "62px"
  //   });

  //   $.each(res.aaData, function(i, row) {
  //     var controls = [];
  //     var button = '<button class="btn btn-danger delete-btn">Dismiss</button>';
  //     controls.push(button);
  //     row.push(controls.join(""));

  //   });
  //   return res;
  // },


  // rowRender: function(row, data, index) {
  //   var self = this;
  //   var when_td = $('td:eq(' + self.indexes.when + ')', row);

  //   var timestamp = moment(data[self.indexes.when], 'YYYY-MM-DD h:mm:ss:SSS').fromNow();
  //   var ts = $('<span>').text(timestamp);
  //   when_td.html(ts);

  //   when_td.attr('data-toggle', 'tooltip');
  //   when_td.attr('data-original-title', data[self.indexes.when]);
  //   when_td.tooltip();

  //   var notification = data[self.indexes.eventType];
  //   var message = data[self.indexes.message];
  //   if (message.toLowerCase().indexOf("fail") > -1) {
  //     $('td', row).addClass('fail');
  //   }
  //   var parts = message.split("\n");
  //   var processed = [parts[0]];
  //   for(var n=1;n<parts.length;n++){
  //     var p = parts[n];
  //     var converted = p;
  //     if(p.indexOf(":") > -1){
  //       var ps = p.split(":");
  //       var firstPart = ps[0];
  //       var secondPart = ps.slice(1).join(":");
  //       firstPart = "<span class='label' style='display: inline-block; width: 85px; padding: 2px;'>" + firstPart + "</span>";
  //       converted = [firstPart, secondPart].join(" ");
  //     }
  //     processed.push("<span style='line-height: 2.em'>" + converted + "</span>");
  //   }
  //   message = processed.join("<br />");
  //   $('td:eq(' + self.indexes.message + ')', row).html(message);
  //   var nh = "<span class='label label-" + self.getLabelClass(notification) + "'>" + js_util.capitaliseWords(notification) + "</span>";
  //   $('td:eq(' + self.indexes.eventType + ')', row).html(nh);
  //   var instGuid = $fw.data.get('inst').guid;
  //   $(row).find('.delete-btn').unbind().bind('click', function() {
  //     self.models.notification_event.dismiss(instGuid, data[self.indexes.guid], function(res) {
  //       self.showAlert('success', 'Notification message dismissed.');
  //       self.notification_table.fnDeleteRow(row);
  //     }, function(err) {
  //       self.showAlert('error', 'Failed to dismiss notification. Error: ' + err);
  //     });
  //   });
  // },

  // getLabelClass: function(notificationType) {
  //   if (notificationType.indexOf("create") > -1) {
  //     return "info";
  //   } else if (notificationType.indexOf("stage") > -1) {
  //     return "info";
  //   } else if (notificationType.indexOf("start") > -1) {
  //     return "success";
  //   } else if (notificationType.indexOf("stop") > -1) {
  //     return "warning";
  //   } else if (notificationType.indexOf("delete") > -1) {
  //     return "warning";
  //   } else {
  //     return "info";
  //   }
  // }

});