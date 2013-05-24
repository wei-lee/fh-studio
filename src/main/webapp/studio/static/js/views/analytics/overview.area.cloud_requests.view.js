App.View.AnalyticsOverviewCloudRequests = Backbone.View.extend({
  initialize: function() {},

  render: function() {
    var html = $("#overview-area-cloud-requests-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template({
      app: this.model.toJSON(),
      count: 1000
    }));

    this.$chart = $(".chart", this.el)
    this.$count = $(".count", this.el);

    this.chart_view = new App.View.ProjectAppAnalyticsCloudRequestsByPlatform({
      chart: {
        width: 150,
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
      guid: this.model.get('id')
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
  }
});