App.View.PerAppAnalytics = Backbone.View.extend({
  events: {
    'click table tbody tr': 'show',
    'click .view_details': 'showDetails'
  },

  initialize: function() {
    this.collection = new App.Collection.Apps();
    this.collection.bind('reset', this.render, this);
    this.collection.fetch({
      reset: true
    });
  },

  render: function() {
    var self = this;
    var html = $("#project-per-app-analytics-template").html();
    var template = Handlebars.compile(html);

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

    // Pick first app (if none selected)
    if (this.collection.models.length > 0) {
      var active = $('table tbody tr.active', this.$el);
      if (active.length === 0) {
        setTimeout(function(){
          $('table tbody tr:first', self.$el).trigger('click');
        }, 0);
      }
    }

    this.$table_container.find('.dataTables_filter input').attr('placeholder', 'Search...');
    this.$overview_container = this.$el.find('.overview_container');
    this.$datepicker_container = this.$el.find('.datepicker_container');
  },

  renderDatePicker: function() {
    this.picker = new App.View.ProjectAppAnalyticsDatepicker();
    this.picker.render();
    this.$datepicker_container.html(this.picker.el);
  },

  show: function(e) {
    this.renderDatePicker();
    $('table tbody tr', this.$el).removeClass('active');
    $(e.currentTarget).addClass('active');

    var guid = $(e.currentTarget).data('guid');
    console.log('show guid:' + guid);
    var app = this.collection.findWhere({
      id: guid
    });
    this.overview = new App.View.AnalyticsOverview({
      model: app,
      picker_model: this.picker.model
    });
    this.overview.render();
    this.$overview_container.html(this.overview.el);
  },

  showDetails: function(e) {
    var guid = $(e.currentTarget).data('guid');
    var metric_type = $(e.currentTarget).data('metric-type'); // Metric to show
    this.detail_view = new App.View.ProjectAppAnalytics({
      guid: guid,
      picker_model: this.picker.model,
      hidePicker: true,
      type: metric_type
    });
    this.$overview_container.html(this.detail_view.render().el);
    console.log('showDetailView', guid);
  }
});