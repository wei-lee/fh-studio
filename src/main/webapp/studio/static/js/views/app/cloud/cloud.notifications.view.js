var App = App || {};
App.View = App.View || {};

App.View.CloudNotifications = Backbone.View.extend({
  events: {},

  initialize: function() {
    this.collection = App.collections.cloud_events;
    this.collection.bind('sync', this.render, this);
    this.collection.fetch();
  },

  render: function() {
    var html = $("#cloud-notifications-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template());

    this.$table_container = this.$el.find('.cloud_notifications');

    this.table_view = new App.View.DataTable({
      "aaData": this.collection.toJSON(),
      "fnRowCallback": $.noop,
      "aoColumns": [{
        "sTitle": "Notification Type",
        "mDataProp": "eventType"
      }, {
        "sTitle": "When",
        "mDataProp": "sysCreated"
      }, {
        "sTitle": "Updated By",
        "mDataProp": "updatedBy"
      }, {
        "sTitle": "Details",
        "mDataProp": "message"
      }]
    });
    this.$table_container.append(this.table_view.render().el);
  }
});