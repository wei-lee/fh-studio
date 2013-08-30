App.View.DataBrowserMigrateView = App.View.DataBrowserView.extend({
  templates : {
    'dataviewEmptyContainer' : '#dataviewEmptyContainer',
    'dataMigrateMessage' : '#dataMigrateMessage',
    'databrowserNavbar' : '#databrowserNavbar',
    dataMigratingView : '#dataMigratingView'
  },
  events : {
    'click  .btn-migrate' : 'onMigrate'
  },
  initialize : function(options){
    this.compileTemplates();
    this.options = options;
    this.breadcrumb(['Data Browser', 'Migrate']);
  },
  render: function() {
    var self = this,
    nav = this.templates.$databrowserNavbar({ brand : 'Data Browser', class : 'migratenavbar', baritems : '' });
    this.message = new App.View.DataBrowserMessageView({ message : this.templates.$dataMigrateMessage(), button : 'Migrate now &raquo;', cb : function(){
      self.onMigrate.apply(self, arguments);
    }});

    this.$el.empty();
    this.$el.append(nav);
    this.$el.append(this.message.render().$el);
    return this;
  },
  onMigrate : function(){
    var self = this,
    url = Constants.DB_MIGRATE_URL;
    var params = {
      appGuid: this.options.guid,
      env : this.options.mode
    };

    this.message.$el.hide();
    this.$el.append(this.templates.$dataMigratingView());
    $.ajax({
      type: 'POST',
      url: url,
      contentType : 'application/json',
      data: JSON.stringify(params),
      timeout: 20000,
      success: function(res){
        if (res.status === "ok") {
          self.migrateStarted(res.result.cacheKey);
        } else {
          console.log('Migrate failed:' + res);
        }
      },
      error : function(response, message, status){
        try{
          var msg = JSON.parse(response.responseText).message;
          self.updateProgressLog(msg);
        }catch(err){
        }
        self.migrateCompleteFailed();
      }
    });
  },
  migrateStarted: function (cache_key) {
    var self = this;
    this.resetProgress();
    console.log('migrateStarted: [' + cache_key + ']');
    var progress = 0;

    this.active_async_task = new ASyncServerTask({
      cacheKey: cache_key
    }, {
      updateInterval: Properties.cache_lookup_interval,
      maxTime: Properties.cache_lookup_timeout,
      // 5 minutes
      maxRetries: Properties.cache_lookup_retries,
      timeout: function (res) {
        console.log('migration timeout error > ' + JSON.stringify(res));
        self.updateProgressLog("Migrate timed out.");
        if ($.isFunction(self.migrateCompleteFailed)) {
          self.migrateCompleteFailed();
        }
        self.updateProgress(100);
      },
      update: function (res) {
        console.log('migration update > ' + JSON.stringify(res));
        for (var i = 0; i < res.log.length; i++) {
          console.log(res.log[i]);
        }
        if (res.progress) {
          progress = res.progress;
        } else {
          progress += 2;
        }

        self.updateProgressLog(res.log);
        self.updateProgress(progress);
      },
      complete: function (res) {
        console.log('Migrate successful > ' + JSON.stringify(res));
        if ($.isFunction(self.migrateCompleteSuccess)) {
          self.migrateCompleteSuccess();
        }
        self.updateProgress(100);
      },
      error: function (res) {
        console.log('Migrate error > ' + JSON.stringify(res));
        self.updateProgressLog(res.error);
        if ($.isFunction(self.migrateCompleteFailed)) {
          self.migrateCompleteFailed();
        }
        self.updateProgress(100);
      },
      retriesLimit: function () {
        console.log('Migrate retriesLimit exceeded: ' + Properties.cache_lookup_retries);
        if ($.isFunction(self.migrateCompleteFailed)) {
          self.migrateCompleteFailed();
        }
        self.updateProgress(100);
      },
      end: function () {

      }
    });
    this.active_async_task.run();
  },
  resetProgress: function () {
    var progress_el = this.$el.find('.data_migrate_progress .progress');
    var progress_log_el = this.$el.find('.data_migrate_progress textarea');
    var bar = this.$el.find('.bar', progress_el);

    progress_log_el.val('');

    bar.css('width', '0%');
    setTimeout(function () {
      bar.css('width', '0%');
    }, 500);
  },
  updateProgressLog: function (log) {
    // allow for string or array of strings
    log = 'string' === typeof log ? [log] : log;
    var progress_log_el = this.$el.find('.data_migrate_progress textarea');

    if (log.length > 0) {
      var current_log = progress_log_el.val(),
      log_value;
      if (current_log === '') {
        log_value = current_log + log.join('\n');
      } else {
        log_value = current_log + '\n' + log.join('\n');
      }
      progress_log_el.val(log_value);
      progress_log_el.scrollTop('10000000');
    }
  },
  updateProgress: function (value) {
    var progress_el = this.$el.find('.data_migrate_progress .progress');
    var bar = this.$el.find('.bar', progress_el);
    bar.css('width', value + '%');
  },
  migrateCompleteFailed: function () {
    console.log('Migrate complete - failed.');

    this.makeProgressRed();

  },
  migrateCompleteSuccess: function () {
    console.log('Migrate complete - success');
    this.makeProgressGreen();
  },
  makeProgressRed: function () {
    this.$el.find('.data_migrate_progress .progress').removeClass('progress-striped').addClass('progress-danger');
  },
  makeProgressGreen: function () {
    this.$el.find('.cloud_deploy_progress .progress').removeClass('progress-striped').addClass('progress-success');
  }
});