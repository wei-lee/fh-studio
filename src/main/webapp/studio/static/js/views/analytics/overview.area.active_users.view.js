App.View.AnalyticsOverviewActiveUsers = Backbone.View.extend({
  initialize: function() {
    var self = this;
    App.vent.on('app-analytics-datechange', function(e) {
      self.showLoading();
    });
  },

  render: function() {
    var html = $("#overview-area-active-users-template").html();
    var template = Handlebars.compile(html);
    this.$el.html(template({
      app: this.model.toJSON()
    }));

    this.$chart = $(".chart", this.el);
    this.$count = $(".count", this.el);
    this.$metrics_type = $(".metrics_type", this.el);
    this.$spinner = $(".spinner", this.el);
    this.showLoading();



    this.chart_view = new App.View.ProjectAppAnalyticsActiveUsersByPlatform({
      chart: {
        width: ($('.span9:visible').width() / 2),
        height: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      },
      plotOptions: {
        pie: {
          dataLabels: false
        }
      },
      exporting: {
        enabled: false
      },
      legend: {
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

    // Sync done, hide loader
    this.hideLoading();
  },

  showLoading: function() {
    this.$chart.hide();
    this.$count.hide();
    this.$metrics_type.hide();
    this.$spinner.html(new App.View.Spinner().render().el);
  },

  hideLoading: function() {
    this.$chart.show();
    this.$count.show();
    this.$metrics_type.show();
    this.$spinner.empty();
  }
});