Stats.View.List.APICalls = Stats.View.List.extend({
  fh_all: '__fh_all',

  init: function(params) {
    this._super(params);
  },

  formatSeriesName: function (name) {
    var formatted = name;

    var m1 = name.match(/\b\S*_api_(.*?)\b/);
    if (m1 != null && m1.length > 1) {
      formatted = m1[1] + '()';
    }
    //console.log('formatSeriesName: ' + name + ' => ' + formatted);
    if ((this.fh_all + '()') === formatted) {
      formatted = Lang.stats_fh_all_name;
    }

    return formatted;
  },

  render: function() {
    console.log('Rendering List');
    var self = this;
    $(self.renderTo).empty();
    var all_series = this.model.getAllSeries();

    if (_.isEmpty(all_series)) {
      // no stats, show some message saying just that
      $(self.renderTo).append($('<p>', {
        "text": Lang.stats_empty_apicalls
      }));
    } else {
      // order alphabetically with '__fh_all' first, if it's there
      all_series = _.sortBy(_.toArray(all_series), function (obj) {
        return self.fh_all === obj.name ? '00000000000000000' : obj.name;
      });

      $.each(all_series, function(i, series) {
        var series_name = series.name;
        var formatted_name = self.formatSeriesName(series_name);
        var latestStats = [];
        var series_data = series.series;

        var numRequests, activeRequests, avgRequestTime;

        for (var tempSeriesKey in series_data) {
          var tempSeries = series_data[tempSeriesKey];
          if (tempSeries.name === Lang.stats_apicalls_requests_number) {
            numRequests = tempSeries.data[tempSeries.data.length - 1][1];
            var periodMS = 60000; // 1 minute
            var sampleValue = (numRequests * (periodMS / 1000));
            latestStats.push(Lang.stats_apicalls_requests_per_interval + ': ' + (Math.round(sampleValue * 100) / 100));
          } else if (tempSeries.name === Lang.stats_apicalls_requests_average_concurrent) {
            avgConcurrentRequests = tempSeries.data[tempSeries.data.length - 1][1];
            latestStats.push(Lang.stats_apicalls_requests_average_concurrent + ': ' + avgConcurrentRequests);
          } else if (tempSeries.name === Lang.stats_apicalls_request_times_90th_percentile_mean) {
            avgRequestTime = tempSeries.data[tempSeries.data.length - 1][1];
            latestStats.push(Lang.stats_apicalls_request_times_90th_percentile_mean_short + ': ' + Math.round(avgRequestTime) + 'ms');
          }
        }

        var list_item = $('<li>', {
          "id": series_name + '_list_item'
        }).append($('<h3>', {
          "text": formatted_name + ' '
        }).append($('<span>', {
          "text": latestStats.join(' - ')
        })));

        var list_containers = '<div class="' + series_name + '_container"><div class="chart_container"></div></div>';
        list_item.append(list_containers);
        // Bind click
        $('h3', list_item).unbind().click(function (e) {
          self.controller.openItemId = ($(this).parent().attr('id'));
          self.renderChart(series_name, formatted_name);
        });

        $(self.renderTo).append(list_item);
      });

      // try reopen last open item if it's there
      if (self.controller.openItemId != null) {
        $('h3', '#' + self.controller.openItemId).trigger('click');
      } else {
        $('li:first h3', self.renderTo).trigger('click');
      }
    }
  },

  renderChart: function (series_name, formatted_name) {
    var self = this;

    self.controller.toggleStats(this, self.model, function () {
      var series = self.model.getSeries(series_name);

      var chart = new Stats.View.Chart.APICalls({
        model: self.model,
        series: series,
        series_name: series_name,
        formatted_name: formatted_name,
        controller: self.controller
      });
      chart.render();
    });
  }
});