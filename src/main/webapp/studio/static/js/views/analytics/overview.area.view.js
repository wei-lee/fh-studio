App.View.AnalyticsOverviewArea = Backbone.View.extend({
  initialize: function(options) {
    var self = this;
    this.model = options.model;
    this.picker_model = options.picker_model;
  },

  render: function() {
    var self = this;
    var html = $(this.template).html();
    var template = Handlebars.compile(html);
    this.$el.html(template({
      app: this.model.toJSON()
    }));

    this.$chart = $(".chart", this.el);
    this.$count = $(".count", this.el);
    this.$view_details = $(".view_details", this.el);
    this.$metrics_type = $(".metrics_type", this.el);
    this.$spinner = $(".spinner", this.el);
    this.showLoading();

    this.chart_view = new this.chart_view_type({
      chart: {
        width: 350,
        height: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: false
          }
        }
      },
      exporting: {
        enabled: false
      },
      legend: {
        margin: 0,
        itemStyle: {
          fontSize: '10px'
        }
      },
      title: {
        text: null
      },
      guid: this.model.get('id'),
      picker_model: this.picker_model
    });

    this.chart_view.collection.bind('sync', this.updateTotal, this);
    this.$chart.html(this.chart_view.render().$el);
  },

  updateTotal: function(collection) {
    // Calculate total
    var total = 0;
    $.each(collection.models, function(i, model) {
      var value = model.get('y');
      total = total + value;
    });

    this.$count.text(_.str.numberFormat(total, 0, '.', ','));

    // Sync done, hide loader
    this.hideLoading();
  },

  showLoading: function() {
    this.$chart.hide();
    this.$count.hide();
    this.$view_details.hide();
    this.$metrics_type.hide();
    this.$spinner.html(new App.View.Spinner().render().el);
  },

  hideLoading: function() {
    this.$chart.show();
    this.$count.show();
    this.$metrics_type.show();
    this.$view_details.show();
    this.$spinner.empty();
  }
});