var Apps = Apps || {};
Apps.Migrate = Apps.Migrate || {};

App.Model.Progress = Backbone.Model.extend({
  defaults: {
    progress: 0,
    title: 'Progress Title',
    logs: [],
    current_status: 'Current Status'
  }
});

App.View.ProgressView = Backbone.View.extend({
  template: '#migrate-app-progress-template',

  events: {
    'click #toggle_show_less': 'toggleLog'
  },

  initialize: function() {
    this.listenTo(this.model, 'change:progress', this.updateProgress);
    this.listenTo(this.model, 'change:logs', this.updateLogs);
  },

  render: function() {
    var template = Handlebars.compile($(this.template).html());
    this.$el.html(template(this.model.toJSON()));

    this.$progress_bar = this.$el.find('.progress .bar');
    this.$textarea = this.$el.find('textarea');
    this.$toggle = this.$el.find('#toggle_show_less');
    this.$report = this.$el.find('.migrate_report');
  },

  updateProgress: function() {
    this.$progress_bar.css('width', this.model.get('progress') + '%');
  },

  updateLogs: function() {
    var logs = this.model.get('logs');
    var messages = _.compact(_.pluck(logs, 'msg', 'ok', 'error'));

    this.$textarea.text(messages.join("\n"));
    this.$progress_bar.text(messages[messages.length - 1]);

    // Scroll to bottom
    this.$textarea[0].scrollTop = this.$textarea[0].scrollHeight;

    this.updateStatusCategories();
  },

  updateStatusCategories: function() {
    var logs = this.model.get('logs');

    var oks = _.compact(_.pluck(logs, 'ok'));
    var errors = _.compact(_.pluck(logs, 'error'));

    this.$report.empty();

    var tpl = Handlebars.compile($('#migrate-report-entry-template').html());
    _.each(oks, function(ok) {
      this.$report.append(tpl({
        text: ok,
        className: 'ok'
      }));
    }, this);

    _.each(errors, function(error) {
      this.$report.append(tpl({
        text: error,
        className: 'error'
      }));
    }, this);

    console.log(oks, errors);
  },

  toggleLog: function(e) {
    if (e) e.preventDefault();
    if (this.$textarea.is(':visible')) {
      this.$toggle.text('[Show More]');
      this.$textarea.slideUp();
    } else {
      this.$toggle.text('[Show Less]');
      this.$textarea.slideDown();
    }
  },

  fail: function() {
    // Mark as failed
    this.model.set('progress', 100);
    this.$el.find('.progress').removeClass('progress-striped').addClass('progress-danger');
  },

  done: function() {
    // Mark as done
    this.model.set('progress', 100);
    this.$el.find('.progress').removeClass('progress-striped').addClass('progress-success');
    this.toggleLog();
  }
});

App.View.MigrateApp = Backbone.View.extend({
  template: '#migrate-app-template',

  events: {
    'click #migrate_app': 'confirmMigrate',
    'click #migratecheck_app': 'migrateCheck',
    'click .fh3_link': 'migratedLink'
  },

  initialize: function() {
    this.options.initial = this.options.initial || 0;
  },

  render: function() {
    var template = Handlebars.compile($(this.template).html());

    this.$el.html(template({
      migrated: $fw.data.get('app').migrated,
      migrated_url: this.migratedUrl()
    }));
  },

  migratedUrl: function() {
    var project = $fw.data.get('app').guid;
    return document.location.origin + "/#projects/" + project;
  },

  migratedLink: function(e) {
    e.preventDefault();
    var url = $(e.currentTarget).attr('href');

    // Set property
    var data = {
      payload: {
        key: "studio.version",
        value: "beta"
      }
    };

    $.ajax({
      type: 'POST',
      url: '/box/srv/1.1/ide/' + Constants.DOMAIN + '/user/setProp',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'text/plain',
      timeout: 20000,
      success: function(res) {
        console.log('successfully set studio version');
        var project = $fw.data.get('app').guid;
        window.location.href = "/#projects/" + project;
        location.reload();
      },
      error: function(xhr, status) {
        console.log('error saving user preference');
      }
    });

  },

  renderProgress: function(checkOnly) {
    var title = 'App Migration in progress...';
    var current = 'Beginning migrate...';

    if (checkOnly) {
      title = 'Validation in progress...';
      current = 'Beginning validation...';
    }

    this.$progress = this.$el.find('#migration_progress');
    this.progress_model = new App.Model.Progress({
      progress: 10,
      title: title,
      current_status: current
    });
    this.progress = new App.View.ProgressView({
      model: this.progress_model
    });

    this.progress.render();
    this.$progress.html(this.progress.el);

    return this.progress;
  },

  confirmMigrate: function() {
    var self = this;
    console.log('confirm migrate!');

    var message = "Are you sure you want to migrate this App to FH3? Once migrated, you won't be able to easily revert this app back to FH2";
    this.showBooleanModal(message, function() {
      self.migrate();
    });

    return false;
  },

  migrateCheck: function() {
    this.migrate(true);
  },

  migrate: function(checkOnly) {
    var self = this;
    var progress_view = this.renderProgress(checkOnly);
    var project_id = $fw.data.get('app').guid;
    var app_model = new model.App();

    var cb = function(res) {
      console.log('migrate request success:' + res);

      var migrate_task = new ASyncServerTask({
        cacheKey: res.result
      }, {
        updateInterval: Properties.cache_lookup_interval,
        maxTime: Properties.cache_lookup_timeout,
        maxRetries: Properties.cache_lookup_retries,

        timeout: function(res) {
          console.log('timeout > ' + JSON.stringify(res));
          progress_view.fail();
        },

        update: function(res) {
          console.log('update > ' + JSON.stringify(res));

          var logs = _.clone(self.progress_model.get('logs'));
          if (!logs) logs = [];
          var progress = self.progress_model.get('progress');

          for (var i = 0; i < res.log.length; i++) {
            console.log(res.log[i]);
            logs.push(res.log[i]);
            progress = progress + 2;
          }

          self.progress_model.set({
            progress: progress,
            logs: logs
          });
        },

        complete: function(res) {
          console.log('complete > ' + JSON.stringify(res));
          var logs = _.clone(self.progress_model.get('logs'));
          if (!logs) logs = [];
          var progress = self.progress_model.get('progress');

          for (var i = 0; i < res.log.length; i++) {
            console.log(res.log[i]);
            logs.push(res.log[i]);
            progress = progress + 2;
          }

          console.log(logs);

          self.progress_model.set({
            logs: logs,
            progress: progress
          });

          progress_view.done();
          if (!checkOnly) {
            self.migrationComplete();
          } else {
            // could alert maybe?
            self.migrationCheckSuccess();
          }
        },

        error: function(res) {
          console.error('error > ' + JSON.stringify(res));

          if (res.error && res.error != '') {
            var logs = _.clone(self.progress_model.get('logs'));
            logs.push(res.error);

            var progress = self.progress_model.get('progress');
            self.progress_model.set({
              logs: logs,
              progress: progress
            });
          }

          progress_view.fail();
          self.showAlert('error', '<strong>App migrate was unsuccessful - exampine the logs below for more details.</strong>', 10000);
        },

        retriesLimit: function() {
          console.log('retries limit!');
          progress_view.fail();
        },

        end: function() {
          // nothing to do here
        }
      });

      // Start
      migrate_task.run();
    };

    if (checkOnly) {
      app_model.migrateCheck({
        projectguid: project_id
      }, cb);
    } else {
      app_model.migrate({
        projectguid: project_id
      }, cb);
    }

  },

  migrationCheckSuccess: function() {
    var btn = this.$el.find('#migratecheck_app');
    btn.addClass('btn-success disabled');
    btn.find('i').removeClass('display_none');
    this.$el.find('#migrate_app').removeClass('display_none');
  },

  showAlert: function(type, message, timeout) {
    timeout = timeout || 3000;
    var self = this;
    var alerts_area = this.$el.find('.alerts');
    var alert = $('<div>').addClass('alert fade in alert-' + type).html(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    alerts_area.append(alert);
    // only automatically hide alert if it's not an error
    if ('error' !== type) {
      setTimeout(function() {
        alert.slideUp(function() {
          alert.remove();
        });
      }, timeout);
    }
  },

  migrationComplete: function() {
    var self = this;

    this.showAlert('success', '<strong>App migrated successful - reloading... </strong>', 10000);
    setTimeout(function() {
      $fw.client.tab.apps.manageapps.show($fw.data.get('inst').guid);
    }, 3000);
  },

  // TODO: Mixin?
  showBooleanModal: function(msg, success) {
    var modal = $('#generic_boolean_modal').clone();
    modal.find('.modal-body').html(msg).end().appendTo($("body")).modal({
      "keyboard": false,
      "backdrop": "static"
    }).find('.btn-primary').unbind().on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      // confirmed delete, go ahead
      modal.modal('hide');
      success();
    }).end().on('hidden', function() {
      // wait a couple seconds for modal backdrop to be hidden also before removing from dom
      setTimeout(function() {
        modal.remove();
      }, 2000);
    });
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

  init: function() {},

  show: function() {
    this._super();

    console.log('app migrate show');

    this.hide();
    this.container = this.views.migrate_app_container;

    this.view = new App.View.MigrateApp();
    this.view.render();
    $('.fh-box-inner', this.container).html(this.view.el);

    $(this.container).show();
  }
});