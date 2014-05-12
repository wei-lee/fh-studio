var Apps = Apps || {};

Apps.Migrate = Apps.Migrate || {};

Apps.Migrate.View = Backbone.View.extend({
  template: '#migrate-app-template',

  initialize: function() {},

  render: function() {
    var template = Handlebars.compile($(this.template).html());
    this.$el.html(template());
  }
});

Apps.Migrate.Controller = Apps.Controller.extend({

  models: {
    app: new model.App()
  },

  views: {
    migrate_app_container: '#migrate_app_container'
  },

  container: null,
  showPreview: true,

  init: function() {
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super();

    console.log('app migrate show');
    this.initFn();

    this.hide();
    this.container = this.views.migrate_app_container;

    this.view = new Apps.Migrate.View();
    this.view.render();
    $('.fh-box-inner', this.container).html(this.view.el);

    $(this.container).show();
  },

  initBindings: function() {
    var self = this;
    $('#migrate_app').on('click', function() {
      self.doMigrate();
    });
  },

  doMigrate: function() {
    var self = this;
    var project_id = $fw.data.get('app').guid;
    var import_progress = 10;

    var modal = null;

    self.showBooleanModal("Are you sure you want to migrate this App to FH3? Once migrated, you won't be able to easily revert this app back to FH2",
      function() {
        modal = self.showProgressModal("App Migration", "Migrating your App to FH3...", function() {
          self.clearProgressModal();
          self.appendProgressLog('Beginning FH2 to FH3 migration');
          self.updateProgressBar(import_progress);

          self.models.app.migrate({
            projectguid: project_id
          }, function(res) {
            console.log('migrate request success:' + res);

            var migrate_task = new ASyncServerTask({
              cacheKey: res.result
            }, {
              updateInterval: Properties.cache_lookup_interval,
              maxTime: Properties.cache_lookup_timeout,
              // 5 minutes
              maxRetries: Properties.cache_lookup_retries,
              timeout: function(res) {
                console.log('timeout > ' + JSON.stringify(res));
                self.markCompleteFailure();
              },
              update: function(res) {
                console.log('update > ' + JSON.stringify(res));
                for (var i = 0; i < res.log.length; i++) {
                  console.log(res.log[i]);
                  self.appendProgressLog(res.log[i]);
                  console.log("Current progress> " + import_progress);
                }
                import_progress = import_progress + 2;
                self.updateProgressBar(import_progress);
              },
              complete: function(res) {
                console.log('complete > ' + JSON.stringify(res));
                self.markCompleteSuccess();
              },
              error: function(res) {
                console.log('error > ' + JSON.stringify(res));
                self.markCompleteFailure();
              },
              retriesLimit: function() {
                console.log('retries limit!');
                self.markCompleteFailure();
              },
              end: function() {
                // nothing to do here
              }
            });
            migrate_task.run();
          });
        }, function(error) {
          console.log('migrate failed:' + error);
        });


        modal.on('hidden', function() {
          self.showAlert('success', '<strong>App migrated successfully, redirecting you back to your Apps... </strong>');
          setTimeout(function() {
            $fw.client.tab.apps.listapps.show();
          }, 3000);
        });
      });
  }
});