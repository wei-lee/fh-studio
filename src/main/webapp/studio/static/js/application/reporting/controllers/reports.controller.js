var Reports = Reports || {};

Reports.Controller = Class.extend({
  models: null,
  config: null,

  init: function(params) {
    var self = this;
    params = params || {};
    this.config = params.config || null;
    this.initModels();
  },

  initModels: function() {
    this.models = [];
    this.models.push(new Reports.Model.InstallsByDate({
      guid: 'sampleid'
    }));
  },

  showInstallsByDate: function() {
    var model = this.models[0];
    var self = this;

    self = this;
    var chart = new Reports.View.Chart.Base({
      model: model,
      series: model.getSeries(),
      controller: self
    });
    chart.render();
  },


  // toggleCounterStats: function(el, model, series_name) {
  //   // Already open, close
  //   if ($(el).hasClass('active') ) {
  //     $('.table_container, .chart_container').empty();
  //     $(el).removeClass('active');
  //     return;
  //   }
  //   $('.stats_area li').removeClass('active');
  //   $(el).addClass('active');
  //   Log.append('toggle Counter stats');
  //   var series = model.getSeries(series_name);
  //   // Empty showing containers
  //   $('.table_container, .chart_container').empty();
  //   var self = this;
  //   var chart = new Stats.View.Chart.Counter({
  //     model: model,
  //     series: series,
  //     controller: self
  //   });
  //   chart.render();
  //   var table = new Stats.View.Table.Counter({
  //     model: model,
  //     series: series,
  //     controller: self
  //   });
  //   table.render();
  // },
  // closeAll: function() {
  //   // Empty showing containers
  //   $('.table_container, .chart_container').empty();
  // },
  // toggleTimerStats: function(el, model, series_name) {
  //   // Already open, close
  //   if ($(el).hasClass('active') ) {
  //     $('.table_container, .chart_container').empty();
  //     $(el).removeClass('active');
  //     return;
  //   }
  //   $('.stats_area li').removeClass('active');
  //   $(el).addClass('active');
  //   Log.append('toggle Timer stats');
  //   var series = model.getSeries(series_name);
  //   // Empty showing containers
  //   this.closeAll();
  //   var self = this;
  //   var chart = new Stats.View.Chart.Timer({
  //     model: model,
  //     series: series,
  //     controller: self
  //   });
  //   chart.render();
  //   var table = new Stats.View.Table.Timer({
  //     model: model,
  //     series: series,
  //     controller: self
  //   });
  //   table.render();
  // },
  // buildLists: function() {
  //   // Models are loaded, build lists
  //   var counters_model = this.models[0];
  //   var timers_model = this.models[1];
  //   this.buildCountersList(counters_model);
  //   this.buildTimersList(timers_model);
  // },
  // emptyLists: function() {
  //   $('#available_counters, #available_timers').empty();
  // },
  // showStatsLoading: function() {
  //   $('#stats_loading_area').empty();
  //   $('#stats_loading').clone().show().appendTo($('#stats_loading_area')).show();
  // },
  // hideStatsLoading: function() {
  //   $('#stats_loading_area').empty();
  // },
  // buildCountersList: function(model) {
  //   var self = this;
  //   var list_view = new Stats.View.List.Counters({
  //     controller: self,
  //     model: this.models[0],
  //     renderTo: '#available_counters'
  //   });
  //   list_view.render();
  // },
  // buildTimersList: function(model) {
  //   var self = this;
  //   var list_view = new Stats.View.List.Timers({
  //     controller: self,
  //     model: this.models[1],
  //     renderTo: '#available_timers'
  //   });
  //   list_view.render();
  // },
  // changeTarget: function(target) {
  //   this.deploy_target = target;
  //   this.emptyLists();
  //   this.initModels();
  //   this.loadModels();
  // },
  loadModels: function() {
    // this.showStatsLoading();

    var self = this;
    $.each(self.models, function(item_number, model) {
      var total = self.models.length;
      item_number = item_number + 1;
      model.load({
        loaded: function(res) {
          Log.append('Reports loaded');

          if (res.status == 'ok') {
            // model.applyFilter({
            //   name: 'filterDate',
            //   from: new Date(1333014354000),
            //   to: new Date(1333014354000 + 30000) // 30 seconds of data
            // });
            if (item_number >= total) {
              // self.hideStatsLoading();
              // self.buildLists();
            }
          } else {
            Log.append("Couldn't load reports: " + model.name);
            // self.hideStatsLoading();
            var failed = $("<li>", {
              "class": "load_failed",
              text: "Failed to load reports."
            });
            $('#available_' + model.name).empty().append(failed);
          }
        }
      });
    });
  }
});