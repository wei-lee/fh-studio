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
  },

  updateProgress: function() {
    this.$progress_bar.css('width', this.model.get('progress') + '%');
  },

  updateLogs: function() {
    var logs = this.model.get('logs');
    this.$textarea.text(logs.join("\n"));
    this.$progress_bar.text(logs[logs.length - 1]);

    console.log('*** logz', logs, logs.join("\n"));

    // Scroll to bottom
    this.$textarea[0].scrollTop = this.$textarea[0].scrollHeight;
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

  renderProgress: function() {
    this.$progress = this.$el.find('#migration_progress');
    this.progress_model = new App.Model.Progress({
      progress: 10,
      title: 'App Migration in progress...',
      current_status: 'Beginning migrate'
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

  migrate: function() {
    var self = this;
    var progress_view = this.renderProgress();
    var project_id = $fw.data.get('app').guid;
    var app_model = new model.App();

    app_model.migrate({
      projectguid: project_id
    }, function(res) {
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
        },

        error: function(res) {
          console.log('error > ' + JSON.stringify(res));
          progress_view.fail();
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
    });

    //     modal.on('hidden', function() {
    //       self.showAlert('success', '<strong>App migrated successfully, redirecting you back to your Apps... </strong>');
    //       setTimeout(function() {
    //         $fw.client.tab.apps.listapps.show();
    //       }, 3000);
    //     });
    //   });
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