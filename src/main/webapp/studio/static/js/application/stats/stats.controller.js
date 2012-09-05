var Stats = Stats || {};

Stats.Controller = Apps.Cloud.Controller.extend({
  model: null,
  views: {
    stats_container: '#stats_container'
  },

  init: function(params) {
    this._super();
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super(this.views.stats_container);
    var self = this;

    this.hide();
    this.initFn();

    $(this.container).show();
    this.showStats();
  },

  initBindings: function() {
    var self = this;

    // $('#deploy_target .refresh').unbind().click(function(e) {
    //   e.preventDefault();
    //   console.log('stats refresh');
    //   self.showStats();
    // });

    $('.stats_type_nav a[data-toggle="pill"]', this.container).on('shown', function (e) {
      // refresh
      console.log('pill changed, stats screen refresh');
      self.show();
    });

    //this.closeAll(this.container);
  },

  showStats: function() {
    console.log('showStats');
    this.emptyLists();
    this.initModels();
    this.loadModels();
  },

  initModels: function() {
    this.models = [];

    var cloudEnv = $fw.data.get('cloud_environment');
    var statsType = $('.stats_type_nav li.active a', this.container).data('type');
    var statsContainer = $('.pill-pane.active', this.container);

    this.models.push(new Stats.Model.Historical.Counters({
      deploy_target: cloudEnv,
      stats_type: statsType,
      stats_container: statsContainer
    }));
    this.models.push(new Stats.Model.Historical.Timers({
      deploy_target: cloudEnv,
      stats_type: statsType,
      stats_container: statsContainer
    }));
  },

  toggleCounterStats: function(el, model, series_name) {
    // Already open, close
    if ($(el).hasClass('active')) {
      $('.chart_container', model.stats_container).empty();
      $(el).removeClass('active');
      return;
    }

    $('.stats_area li').removeClass('active');
    $(el).addClass('active');
    console.log('toggle Counter stats');
    var series = model.getSeries(series_name);

    // Empty showing containers
    $('.chart_container', model.stats_container).empty();

    var self = this;
    var chart = new Stats.View.Chart.Counter({
      model: model,
      series: series,
      controller: self
    });
    chart.render();
  },

  closeAll: function(model) {
    // Empty showing containers
    $('.chart_container', model.stats_container).empty();
  },

  toggleTimerStats: function(el, model, series_name) {
    // Already open, close
    if ($(el).hasClass('active')) {
      $('.chart_container', model.stats_container).empty();
      $(el).removeClass('active');
      return;
    }

    $('.stats_area li', model.stats_container).removeClass('active');
    $(el).addClass('active');
    var series = model.getSeries(series_name);

    // Empty showing containers
    this.closeAll(model);

    var self = this;
    var chart = new Stats.View.Chart.Timer({
      model: model,
      series: series,
      controller: self
    });
    chart.render();
  },

  buildLists: function() {
    // Models are loaded, build lists
    var counters_model = this.models[0];
    var timers_model = this.models[1];

    this.buildCountersList(counters_model);
    this.buildTimersList(timers_model);
  },

  emptyLists: function() {
    $('.available_counters, .available_timers', this.container).empty();
  },

  showStatsLoading: function() {
    $('#stats_loading_area').empty();
    $('#stats_loading').clone().show().appendTo($('#stats_loading_area')).show();
  },

  hideStatsLoading: function() {
    $('#stats_loading_area').empty();
  },

  buildCountersList: function(model) {
    var self = this;
    var list_view = new Stats.View.List.Counters({
      controller: self,
      model: this.models[0],
      renderTo: $('.available_counters', model.stats_container)[0]
    });

    list_view.render();
  },

  buildTimersList: function(model) {
    var self = this;
    var list_view = new Stats.View.List.Timers({
      controller: self,
      model: this.models[1],
      renderTo: $('.available_timers', model.stats_container)[0]
    });

    list_view.render();
  },

  loadModels: function() {
    this.showStatsLoading();

    var self = this;
    $.each(self.models, function(item_number, model) {
      var total = self.models.length;
      item_number = item_number + 1;
      model.load({
        loaded: function(res) {
          console.log('Stats loaded');

          if (res.status == 'ok') {
            // model.applyFilter({
            //   name: 'filterDate',
            //   from: new Date(1333014354000),
            //   to: new Date(1333014354000 + 30000) // 30 seconds of data
            // });
            if (item_number >= total) {
              self.hideStatsLoading();
              self.buildLists();
            }
          } else {
            console.log("Couldn't load stats: " + model.name);
            self.hideStatsLoading();
            var failed = $("<li>", {
              "class": "load_failed",
              text: "No stats data is currently available for this app."
            });
            $('#available_' + model.name).empty().append(failed);
          }
        }
      });
    });
  },

  doExport: function(filename, content, content_type) {
    // Remove if it exists
    $('#export_form').remove();

    $('body').append('<form name="export_form" id="export_form" method="post" action="' + Constants.TRIGGER_DOWNLOAD_URL + '"><input type="hidden" name="content" value=""><input type="hidden" name="content_type" value=""><input type="hidden" name="filename" value=""><input type="submit" name="export_json_submit" id="export_json_submit" value="Export" style="display: none"></form>');
    $("#export_form input[name=content]").val(content);
    $("#export_form input[name=content_type]").val(content_type);
    $("#export_form input[name=filename]").val(filename);
    $('#export_form').submit();
  }
});