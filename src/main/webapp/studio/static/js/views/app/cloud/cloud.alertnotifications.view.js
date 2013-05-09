var App = App || {};
App.View = App.View || {};

App.View.EventAlertNotifications = Backbone.View.extend({

  events: {
    'click table tbody tr': 'showDetails'
  },

  initialize: function(){
    var html = $("#alert-notifications-template").html();
    var template = Handlebars.compile(html);
    this.$el.show().html(template());
    this.collection = App.collections.alerts_notifications;
    this.collection.bind("sync", this.render, this);
    this.collection.fetch();
  },

  render: function(){
    if(!this.table_view){
      this.table_container = this.$el.find('.alert_notifications_table_container');
      this.table_view = new App.View.DataTable({
        "aaData": this.collection.toJSON(),
        "aaSorting": [[0, 'desc']],
        "bFilter": false,
        "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
          // Append guid data
          $(nTr).attr('data-guid', sData.guid);
          //self.rowRender(nTr, sData, oData);

        },
        "aoColumns": [{
          "sTitle": "TimeStamp",
          "mDataProp": "sysCreated"
        }, {
          "sTitle": "Alert Name",
          "mDataProp": "alertName"
        }, {
          "sTitle": "Recipients",
          "mDataProp": "recipients"
        }, {
          "sTitle": "Subject",
          "mDataProp": "subject"
        }],
        "bAutoWidth": false,
        "sPaginationType": 'bootstrap',
        "sDom": "<'row-fluid'r>t<'row-fluid'<'span6'i><'span6'p>>",
        "bLengthChange": false,
        "iDisplayLength": 10,
        "bInfo": false
      });
      this.table_view.render();
      this.table_container.html(this.table_view.el);
    }
  },

  showDetails: function(e){
    e.preventDefault();
    var guid = $(e.currentTarget).closest('tr').data('guid');
    var obj = this.collection.findWhere({guid: guid});
    var detailView = new App.View.AlertNotification({model: obj});
    detailView.render();
  }
});

App.View.AlertNotification = Backbone.View.extend({
  tagName: "div",
  className:"modal hide fade in",

  render: function(){
    var self = this;
    var temp = $("#event-alert-notification-template").html();
    var template = Handlebars.compile(temp);
    this.$el.html(template(this.model.toJSON()));
    this.$el.modal({keyboard:false, backdrop:"static"});
    this.$el.on("hidden", function(){
      console.log("Remove view for model: " + self.model.cid);
      self.remove();
    });
  }
});