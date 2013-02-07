var Apps = Apps || {};

Apps.Cloudnotifications = Apps.Cloudnotifications || {};

Apps.Cloudnotifications.Controller = Apps.Cloud.Controller.extend({
  alert_timeout: 3000,

  models: {
    notification_event: new model.CloudNotifications()
  },

  views: {
    cloudnotifications_container: "#cloudnotifications_container",
    load_spinner: '#notifications_loading',
    notification_table_container: '#notification_container'
  },

  init: function() {
    this._super();
  },

  show: function() {
    this._super(this.views.cloudnotifications_container);
    $(this.views.cloudnotifications_container).show();
    $(this.views.load_spinner).show();
    $(this.views.notification_table_container).hide();
    this.loadNotifications();
  },

  loadNotifications: function(){
    var instGuid = $fw.data.get('inst').guid;
    var self = this;
    this.models.notification_event.list(instGuid, function(res){
      $(self.views.load_spinner).hide();
      $(self.views.notification_table_container).show();
      self.showNotifications(res);
    }, function(err){
      $(self.views.load_spinner).hide();
      self.showAlert('error', 'Failed to load notification events. Error: ' + err);
    });
  },

  showNotifications: function(res) {
    var self = this;
    self.addControls(res);
    self.notification_table = $('table.table', this.container).dataTable({
      "bDestroy": true,
      "aaSorting": [[0, 'desc']],
      "bAutoWidth": false,
      "sPaginationType":'bootstrap',
      "sDom": "<'row-fluid'<'span12'>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "bLengthChange": true,
      "iDisplayLength": 20,
      "bInfo": false,
      "aaData": res.aaData,
      "aoColumns": res.aoColumns,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData, iDisplayIndex);
      }
    }).removeClass('hidden');

    if (res.aaData.length === 0) {
      // Adjust colspan based on visible columns for new colspan
      var visible_columns = $('.dataTable:visible th:visible').length;
      var no_data_td = $('.dataTable:visible tbody td');
      no_data_td.attr('colspan', visible_columns);
      no_data_td.text('No notifications found.');
    }
  },

  addControls: function(res) {

    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls",
      "sWidth": "62px"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      var button = '<button class="btn btn-danger delete-btn">Dismiss</button>';
      controls.push(button);
      row.push(controls.join(""));

    });
    return res;
  },


  rowRender: function(row, data, index){
    var self = this;
    var d = moment(data[0], 'YYYY-MM-DD h:mm:ss:SSS').fromNow();
    $('td:eq(0)', row).html(d);
    var notification = data[1];
    var message = data[2];
    if(message.toLowerCase().indexOf("fail") > -1){
      $('td:eq(2)', row).attr('style', 'background-color: #f2dede !important').text(message);
    } else {
      $('td:eq(2)', row).attr('style', 'background-color: #dff0d8 !important').text(message);
    }
    var nh = "<span class='label label-"+ self.getLabelClass(notification) +"'>" + js_util.capitaliseWords(notification) + "</span>";
    $('td:eq(1)', row).html(nh);
    var instGuid = $fw.data.get('inst').guid;
    $(row).find('.delete-btn').unbind().bind('click', function(){
      self.models.notification_event.dismiss(instGuid, data[3], function(res){
        self.showAlert('success', 'Notification message dismissed.');
        self.notification_table.fnDeleteRow(row);
      }, function(err){
        self.showAlert('error', 'Failed to delete notification. Error: ' + err);
      });
    });
  },

  getLabelClass: function(notificationType){
    if(notificationType.indexOf("create") > -1){
      return "info";
    }else if(notificationType.indexOf("stage") > -1){
      return "info";
    } else if(notificationType.indexOf("start") > -1) {
      return "success";
    } else if(notificationType.indexOf("stop") > -1) {
      return "warning";
    } else if(notificationType.indexOf("delete") > -1) {
      return "important";
    }
  }

});