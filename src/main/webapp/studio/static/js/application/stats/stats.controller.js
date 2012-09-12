var Stats = Stats || {};

Stats.Controller = Apps.Cloud.Controller.extend({
  model: null,
  views: {
    stats_container: '#stats_container'
  },

  openItemId: null, // used for opening last item after refresh. id of element e.g. psdev-4dt5v7gvwiik2uo0pcd8wizw-dev_api___fh_all_list_item

  init: function(params) {
    this._super();
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super(this.views.stats_container);
    var self = this;

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
      self.openItemId = null;
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

    this.cloudEnv = $fw.data.get('cloud_environment');
    this.statsType = $('.stats_type_nav li.active a', this.container).data('type');
    this.statsContainer = $('.pill-pane.active', this.container);

    if ('api' === this.statsType) {
      this.models.push(new Stats.Model.Historical.APICalls({
        deploy_target: this.cloudEnv,
        stats_type: this.statsType,
        stats_container: this.statsContainer
      }));
    } else { // default is 'app'
      this.models.push(new Stats.Model.Historical.Counters({
        deploy_target: this.cloudEnv,
        stats_type: this.statsType,
        stats_container: this.statsContainer
      }));
      this.models.push(new Stats.Model.Historical.Timers({
        deploy_target: this.cloudEnv,
        stats_type: this.statsType,
        stats_container: this.statsContainer
      }));
    }
  },

  toggleStats: function(el, model, callback) {
    // Already open, close
    if ($(el).hasClass('active')) {
      $('.chart_container', model.stats_container).empty();
      $(el).removeClass('active');
      //return;
    }

    this.closeAll(model);

    $('.stats_area li', model.stats_container).removeClass('active');
    $(el).addClass('active');
    return callback();
  },

  closeAll: function(model) {
    // Empty showing containers
    $('.chart_container', (model != null ? model.stats_container : null)).empty();
  },

  buildLists: function() {
    // Models are loaded, build lists
    if ('api' === this.statsType) {
      this.buildList(this.models[0], $('.available_apicalls', this.models[0].stats_container)[0], Stats.View.List.APICalls);
    } else { // default to 'app'
      this.buildList(this.models[0], $('.available_counters', this.models[0].stats_container)[0]);
      this.buildList(this.models[1], $('.available_timers', this.models[1].stats_container)[0]);
    }
  },

  emptyLists: function() {
    $('.available_list', this.container).empty();
  },

  showStatsLoading: function() {
    $('#stats_loading_area').empty();
    $('#stats_loading').clone().show().appendTo($('#stats_loading_area')).show();
  },

  hideStatsLoading: function() {
    $('#stats_loading_area').empty();
  },

  buildList: function (model, renderTo, listModel) {
    var self = this;

    var params = {
      controller: self,
      model: model, //this.models[0],
      renderTo: renderTo //$('.available_apicalls', this.models[0].stats_container)[0]
    };
    var list_view = listModel != null ? (new listModel(params)) : (new Stats.View.List(params));

    list_view.render();
  },

  loadModels: function() {
    this.showStatsLoading();

    var self = this;
    var data = null;

    async.series([function (cb) {
      // call load on first model
      // we can reuse the data returned by this model because the same
      // data result set is used by every stats model. Don't want to
      // make unnecessary calls to API
      var model = self.models[0];
      model.load({
        loaded: function(res) {
          console.log('Stats loaded');

          if (res.status == 'ok') {
            data = res.results;
            cb(null, data);
          } else {
            console.log("Couldn't load stats: " + model.name);
            self.hideStatsLoading();
            var failed = $("<li>", {
              "class": "load_failed",
              text: "No stats data is currently available for this app."
            });
            $('.available_' + model.name, model.stats_container).empty().append(failed);
            cb(res.error);
          }
        }
      });

    }, function (cb) {
      // in series, so we should have data at this point to load
      // into remaining models, if any (only 1 for apicalls, 2 for custom stats (counters & timers))
      var remainingModels = self.models.slice(1, self.models.length);

      async.forEach(remainingModels, function (model, innerCb) {
        model.load({
          data: data, // specifying data so remote call isn't needed
          loaded: function(res) {
            console.log('Stats loaded');

            if (res.status == 'ok') {
              innerCb(null, res);
            } else {
              console.log("Couldn't load stats: " + model.name);
              self.hideStatsLoading();
              var failed = $("<li>", {
                "class": "load_failed",
                text: "No stats data is currently available for this app."
              });
              $('.available_' + model.name, model.stats_container).empty().append(failed);
              innerCb(res.error);
            }
          }
        });
      }, function (err) {
        cb(err);
      });
    }], function (err, results) {
      if (err != null) {
        console.log('Error loading stats:' + err);
        // not much to do here. errors handled above
      } else {
        // all models loaded with data, good to go
        self.hideStatsLoading();
        self.buildLists();
      }
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