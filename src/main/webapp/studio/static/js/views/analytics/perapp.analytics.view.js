App.View.PerAppAnalytics = Backbone.View.extend({
  events: {
    'click table tbody tr': 'show'
  },

  initialize: function() {
    this.collection = new App.Collection.Apps();
    this.collection.bind('sync', this.render, this);
    this.collection.fetch();
  },

  render: function() {
    var html = $("#project-per-app-analytics-template").html();
    var template = Handlebars.compile(html);
    console.log(this.collection.toJSON());

    this.$el.html(template());

    this.$table_container = this.$el.find('.apps_list');
    this.table_view = new App.View.DataTable({
      "aaData": this.collection.toJSON(),
      "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
        // Append guid data
        $(nTr).attr('data-guid', sData.id);
      },
      "aoColumns": [
        {
          "sTitle": "GUID",
          "mDataProp": "id",
          "bVisible": false
        },
        {
          "sTitle": "Name",
          "mDataProp": "title"
        }
      ]
    });
    this.$table_container.append(this.table_view.render().el);

    this.$overview_container = this.$el.find('.overview_container');
  },

  show: function(e) {
    var guid = $(e.currentTarget).data('guid');
    console.log('show guid:' + guid);
    this.$overview_container.text(guid);
  }
});