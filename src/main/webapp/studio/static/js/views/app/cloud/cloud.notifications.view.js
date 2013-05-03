var App = App || {};
App.View = App.View || {};

App.View.CloudNotifications = Backbone.View.extend({
  events: {
    'click table tbody tr': 'showDetails'
  },

  initialize: function() {
    this.collection = App.collections.cloud_events;
    this.collection.bind('sync', this.render, this);
    this.collection.fetch();
  },

  render: function() {
    var html = $("#cloud-notifications-template").html();
    var template = Handlebars.compile(html);
    this.$el.show().html(template());

    this.$table_container = this.$el.find('.system_log');

    this.table_view = new App.View.DataTable({
      "aaData": this.collection.toJSON(),
      "fnRowCallback": $.noop,
      "bFilter": false,
      "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
        // Append guid data
        $(nTr).attr('data-guid', sData.guid);
      },
      "aoColumns": [{
        "sTitle": "TimeStamp",
        "mDataProp": "sysCreated"
      }, {
        "sTitle": "Event Class",
        "mDataProp": "category"
      }, {
        "sTitle": "Event State",
        "mDataProp": "eventType"
      }, {
        "sTitle": "Severity",
        "mDataProp": "severity"
      }, {
        "sTitle": "Message",
        "mDataProp": "message"
      }]
    });
    this.$table_container.append(this.table_view.render().el);
  },
  showDetails: function(e) {
    e.preventDefault();
    this.collection.findWhere({guid: guid});
    var guid = $(e.currentTarget).closest('tr').data('guid');
    var obj = this.collection.findWhere({guid: guid});
    var html = $("#log-details-template").html();
    var template = Handlebars.compile(html);

    // Note: handlebars doesn't support iterating over an Object
    // so we create an array of the 'eventDetails' and use it in the template
    obj.attributes.eventDetailsArray = [];

    for (var prop in obj.attributes.eventDetails){
      if (obj.attributes.eventDetails.hasOwnProperty(prop)){
        obj.attributes.eventDetailsArray.push({
          'key' : prop,
          'value' : obj.attributes.eventDetails[prop]
        });
      }
    }

    $('#modal_details').html(template(obj.attributes));
    $('#modal_details').modal({}); 
  }
});