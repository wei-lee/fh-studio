App.View.Gauge = Backbone.View.extend({
  defaultOptions: {
    exporting: {
      enabled: false
    },

    credits: {
      enabled: false
    },

    lang: {
      "loading": ""
    },

    loading: {
      labelStyle: {
        position: "relative",
        top: "2em"
      },
      style: {
        backgroundColor: 'gray'
      }
    },

    chart: {
      type: 'gauge',
      alignTicks: false,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false,
      backgroundColor: null
    },

    title: {
      margin: 20,
      text: 'Loading...'
    },
    pane: {
      startAngle: -90,
      endAngle: 90,
      center: ["50%", "75%"],
      background: {
        backgroundColor: 'white',
        borderWidth: 0
      }
    },
    plotOptions: {
      gauge: {
        dataLabels: {
          formatter: function() {
            return 'CPU Load ' + this.y + ' %';
          }
        },
        dial: {
          rearLength: 0,
          baseWidth: 10,
          baseLength: 5,
          radius: 100
        }
      }
    },
    yAxis: [{
      showLastLabel: true,
      lineColor: '#339',
      tickColor: '#339',
      minorTickColor: '#339',
      offset: 0,
      lineWidth: 0,
      labels: {
        distance: 18,
        rotation: 'auto'
      },
      tickLength: 0,
      minorTickLength: 0,
      endOnTick: false
    }]
  },

  initialize: function(options) {
    _.bindAll(this);

    this.options = $.extend(true, {}, this.defaultOptions, options);
    this.model = this.options.model;

    this.model.bind("sync", function() {
      self.render();
    });

    delete this.options.model;
  },

  render: function() {
    var self = this;

    // Collection/Model might be empty
    if (!this.model) {
      console.log('No model');
      this.$el.append("Loading...");
      return this;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.options.chart.renderTo = this.el;
    this.chart = new Highcharts.Chart(this.options);
    return this;
  }
});