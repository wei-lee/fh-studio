App.View.AnalyticsOverviewInstalls = Backbone.View.extend({
  initialize: function() {},

  render: function() {
    var html = $("#overview-area-installs-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template({
      app: this.model.toJSON(),
      count: 1000
    }));

    this.$chart = $(".chart", this.el)

    this.$chart.html(new App.View.ProjectAppAnalyticsClientInstallsByPlatform({
      chart: {
        width: 150,
        height: 200,
        backgroundColor:'rgba(255, 255, 255, 0.1)'
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
    }).render().$el);
  }
});