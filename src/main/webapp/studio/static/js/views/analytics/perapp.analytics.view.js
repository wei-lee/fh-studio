App.View.PerAppAnalytics = Backbone.View.extend({
  events: {
    'click table tbody tr': 'show'
  },

  initialize: function() {
    this.collection = new App.Collection.Apps();
    this.collection.bind('reset', this.render, this);
    this.collection.fetch({
      reset: true
    });
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
      oLanguage: {
        sEmptyTable: "Nothing to display."
      },
      "aoColumns": [
        {
          "sTitle": "GUID",
          "mDataProp": "id",
          "bVisible": false
        },
        {
          "sTitle": "App",
          "mDataProp": "title"
        }
      ]
    });
    this.$table_container.append(this.table_view.render().el);
    this.$overview_container = this.$el.find('.overview_container');

    this.$datepicker_container = this.$el.find('.datepicker_container');

    App.views.picker = new App.View.ProjectAppAnalyticsDatepicker();
    App.views.picker.render();
    this.$datepicker_container.append(App.views.picker.el);
  },

  show: function(e) {
    $('table tbody tr', this.$el).removeClass('active');
    $(e.currentTarget).addClass('active');

    var guid = $(e.currentTarget).data('guid');
    console.log('show guid:' + guid);
    var app = this.collection.findWhere({
      id: guid
    });
    this.overview = new App.View.AnalyticsOverview({
      model: app
    });
    this.overview.render();
    this.$overview_container.html(this.overview.el);
  }
});