application.StagingManager = Class.extend({

  init: function() {},

  show: function() {
    Log.append('staging.show');
    this.bind();
  },

  bind: function() {
    Log.append('staging.bind');
    var self = this;
    var container = $('#staging_container');

    container.find('#staging_dev_button').unbind().bind('click', function() {
      self.devStage();
    });
    container.find('#staging_live_button').unbind().bind('click', function() {
      self.liveStage();
    });

    $('#staging_dev_progressbar').progressbar({
      value: 0
    });
    $('#staging_live_progressbar').progressbar({
      value: 0
    });
  },

  liveStage: function(guid) {
    Log.append('staging.liveStage');
    var self = this;
    if (!guid) {
      guid = $fw_manager.data.get('app').guid;
    }
    var url = Constants.RELEASE_STAGE_APP_URL;
    var params = {
      guid: guid
    };
    $fw_manager.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.stageStarted("live", res.cacheKey);
      } else {
        Log.append('live stage failed:' + res);
      }
    }, null, true);
  },

  devStage: function(guid) {
    Log.append('staging.devStage');
    var self = this;
    if (!guid) {
      guid = $fw_manager.data.get('app').guid;
    }
    var url = Constants.STAGE_APP_URL;
    var params = {
      guid: guid
    };

    $fw_manager.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.stageStarted("dev", res.cacheKey);
      } else {
        Log.append('dev stage failed:' + res);
      }
    }, null, true);
  },

  stageStarted: function(staging_env, cache_key) {
    var self = this;
    this.resetProgress(staging_env);
    Log.append('staging.stageStarted: [' + staging_env + '] [' + cache_key + ']');
    var progress = 0;

    var stage_task = new ASyncServerTask({
      cacheKey: cache_key
    }, {
      updateInterval: Properties.cache_lookup_interval,
      maxTime: Properties.cache_lookup_timeout,
      // 5 minutes
      maxRetries: Properties.cache_lookup_retries,
      timeout: function(res) {
        Log.append('Staging timeout error > ' + JSON.stringify(res));
        self.updateProgressLog(staging_env, "Stage request timed out.");
        if ($.isFunction(self.stageCompleteFailed)) {
          self.stageCompleteFailed();
        }
        self.updateProgress(staging_env, 100);
      },
      update: function(res) {
        Log.append('Staging update > ' + JSON.stringify(res));
        for (var i = 0; i < res.log.length; i++) {
          Log.append(res.log[i]);
        }
        progress += 3;

        self.updateProgressLog(staging_env, res.log);
        self.updateProgress(staging_env, progress);
      },
      complete: function(res) {
        Log.append('Stage successful > ' + JSON.stringify(res));
        if ($.isFunction(self.stageCompleteSuccess)) {
          self.stageCompleteSuccess();
        }
        self.updateProgress(staging_env, 100);
      },
      error: function(res) {
        Log.append('Stage error > ' + JSON.stringify(res));
        self.updateProgressLog(staging_env, res.error);
        if ($.isFunction(self.stageCompleteFailed)) {
          self.stageCompleteFailed();
        }
        self.updateProgress(staging_env, 100);
      },
      retriesLimit: function() {
        Log.append('Stage retriesLimit exceeded: ' + Properties.cache_lookup_retries);
        if ($.isFunction(self.stageCompleteFailed)) {
          self.stageCompleteFailed();
        }
        self.updateProgress(staging_env, 100);
      },
      end: function() {}
    });
    stage_task.run();
  },

  /* 
   * Simple stages don't do any UI updating, and simply 
   * callback when a cacheKey for a stage has completed.
   * It doesn't track progress.
   */
  simpleLiveStage: function(guid, cb) {
    Log.append('staging.liveStage');
    var self = this;
    if (!guid) {
      guid = $fw_manager.data.get('app').guid;
    }
    var url = Constants.RELEASE_STAGE_APP_URL;
    var params = {
      guid: guid
    };

    $fw_manager.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.simpleStageStart("live", res.cacheKey, cb);
      } else {
        Log.append('live stage failed:' + res);
      }
    }, null, true);
  },

  simpleDevStage: function(guid, cb) {
    Log.append('staging.devStage');
    var self = this;
    if (!guid) {
      guid = $fw_manager.data.get('app').guid;
    }
    var url = Constants.STAGE_APP_URL;
    var params = {
      guid: guid
    };

    $fw_manager.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.simpleStageStart("dev", res.cacheKey, cb);
      } else {
        Log.append('dev stage failed:' + res);
      }
    }, null, true);
  },
  
  simpleStageStart: function(staging_env, cache_key, cb) {
    var self = this;
    Log.append('staging.stageStarted: [' + staging_env + '] [' + cache_key + ']');

    var stage_task = new ASyncServerTask({
      cacheKey: cache_key
    }, {
      updateInterval: Properties.cache_lookup_interval,
      maxTime: Properties.cache_lookup_timeout,
      // 5 minutes
      maxRetries: Properties.cache_lookup_retries,
      timeout: function(res) {
        cb(res);
      },
      update: function(res) {
        Log.append('Staging update > ' + JSON.stringify(res));
      },
      complete: function(res) {
        cb(res);
      },
      error: function(res) {
        cb(res);
      },
      retriesLimit: function() {
        cb(res);
      },
      end: function() {}
    });
    stage_task.run();
  },

  updateProgress: function(env, value) {
    var progress_el;
    if (env == 'dev') {
      progress_el = $('#staging_dev_progressbar');
    } else if (env == 'live') {
      progress_el = $('#staging_live_progressbar');
    }

    progress_el.progressbar({
      value: value
    });
  },

  resetProgress: function(env) {
    var progress_el, progress_log_el;
    if (env == 'dev') {
      progress_el = $('#staging_dev_progressbar');
    } else if (env == 'live') {
      progress_el = $('#staging_live_progressbar');
    }

    if (env == 'dev') {
      progress_log_el = $('#staging_dev_progresslog textarea');
    } else if (env == 'live') {
      progress_log_el = $('#staging_live_progresslog textarea');
    }

    progress_log_el.val('');
    progress_el.progressbar({
      value: 0
    });
  },

  updateProgressLog: function(env, log) {
    var progress_log_el;

    // allow for string or array of strings
    log = 'string' === typeof log ? [log] : log;
    if (env == 'dev') {
      progress_log_el = $('#staging_dev_progresslog textarea');
    } else if (env == 'live') {
      progress_log_el = $('#staging_live_progresslog textarea');
    }

    if (log.length > 0) {
      var current_log = progress_log_el.val(),
          log_value;
      if (current_log === '') {
        log_value = current_log + log.join('\n');
      } else {
        log_value = current_log + '\n' + log.join('\n');
      }
      progress_log_el.val(log_value);
    }
  },

  stageCompleteSuccess: function() {
    Log.append('Stage complete - success.');
  },

  stageCompleteFailed: function() {
    Log.append('Stage complete - failed.');
  }
});