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
  events: {},

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

    this.table_view = new App.View.DataTable({
      "aaData": this.collection.toJSON(),
      "fnRowCallback": $.noop,
      "aoColumns": [{
        "sTitle": "Alert Name",
        "mDataProp": "alertName"
      },{
        "sTitle":"Event Categories",
        "mDataProp": "eventCategories"
      },{
        "sTitle": "Severity",
        "mDataProp": "eventSeverities"
      }, {
        "sTitle": "Event Names",
        "mDataProp": "eventNames"
      }, {
        "sTitle": "Emails",
        "mDataProp": "emails"
      }]
    });
    this.$table_container.append(this.table_view.render().el);
  }
});