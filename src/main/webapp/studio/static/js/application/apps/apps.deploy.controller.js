var Apps = Apps || {};

Apps.Deploy = Apps.Deploy || {};

Apps.Deploy.Controller = Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    deploying_container: "#deploying_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    this.initFn = _.once(this.initBindings);
    
  },

  show: function(){
    // TODO
    this.hide();
    this.container = this.views.deploying_container;
    this.initFn();

    $(this.container).show();
  },

  initBindings: function() {
    console.log('deploying.bind');
    var self = this;
    var container = $(this.views.deploying_container);

    $fw.client.lang.insertLangForContainer(container);

    container.find('#deploying_dev_button').unbind().bind('click', function() {
      self.devDeploy();
    });
    container.find('#deploying_live_button').unbind().bind('click', function() {
      self.liveDeploy();
    });

    $('#deploying_dev_progressbar').progressbar({
      value: 0
    });
    $('#deploying_live_progressbar').progressbar({
      value: 0
    });
  },

  liveDeploy: function(guid) {
    console.log('deploying.liveDeploy');
    var self = this;
    if (!guid) {
      guid = $fw_manager.data.get('app').guid;
    }
    var url = Constants.RELEASE_DEPLOY_APP_URL;
    var params = {
      guid: guid
    };
    $fw_manager.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.deployStarted("live", res.cacheKey);
      } else {
        console.log('live Deploy failed:' + res);
      }
    }, null, true);
  },

  devDeploy: function(guid) {
    console.log('deploying.devDeploy');
    var self = this;
    if (!guid) {
      guid = $fw_manager.data.get('app').guid;
    }
    var url = Constants.DEPLOY_APP_URL;
    var params = {
      guid: guid
    };

    $fw_manager.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.deployStarted("dev", res.cacheKey);
      } else {
        console.log('dev Deploy failed:' + res);
      }
    }, null, true);
  },

  deployStarted: function(deploying_env, cache_key) {
    var self = this;
    this.resetProgress(deploying_env);
    console.log('deploying.deployStarted: [' + deploying_env + '] [' + cache_key + ']');
    var progress = 0;

    var deploy_task = new ASyncServerTask({
      cacheKey: cache_key
    }, {
      updateInterval: Properties.cache_lookup_interval,
      maxTime: Properties.cache_lookup_timeout,
      // 5 minutes
      maxRetries: Properties.cache_lookup_retries,
      timeout: function(res) {
        console.log('deploying timeout error > ' + JSON.stringify(res));
        self.updateProgressLog(deploying_env, "Deploy request timed out.");
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed();
        }
        self.updateProgress(deploying_env, 100);
      },
      update: function(res) {
        console.log('deploying update > ' + JSON.stringify(res));
        for (var i = 0; i < res.log.length; i++) {
          console.log(res.log[i]);
        }
        progress += 3;

        self.updateProgressLog(deploying_env, res.log);
        self.updateProgress(deploying_env, progress);
      },
      complete: function(res) {
        console.log('Deploy successful > ' + JSON.stringify(res));
        if ($.isFunction(self.deployCompleteSuccess)) {
          self.deployCompleteSuccess();
        }
        self.updateProgress(deploying_env, 100);
      },
      error: function(res) {
        console.log('Deploy error > ' + JSON.stringify(res));
        self.updateProgressLog(deploying_env, res.error);
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed();
        }
        self.updateProgress(deploying_env, 100);
      },
      retriesLimit: function() {
        console.log('Deploy retriesLimit exceeded: ' + Properties.cache_lookup_retries);
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed();
        }
        self.updateProgress(deploying_env, 100);
      },
      end: function() {}
    });
    deploy_task.run();
  },

  /*
   * Simple Deploys don't do any UI updating, and simply
   * callback when a cacheKey for a Deploy has completed.
   * It doesn't track progress.
   */
  simpleLiveDeploy: function(guid, cb) {
    console.log('deploying.liveDeploy');
    var self = this;
    if (!guid) {
      guid = $fw_manager.data.get('app').guid;
    }
    var url = Constants.RELEASE_DEPLOY_APP_URL;
    var params = {
      guid: guid
    };

    $fw_manager.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.simpleDeployStart("live", res.cacheKey, cb);
      } else {
        console.log('live Deploy failed:' + res);
      }
    }, null, true);
  },

  simpleDevDeploy: function(guid, cb) {
    console.log('deploying.devDeploy');
    var self = this;
    if (!guid) {
      guid = $fw_manager.data.get('app').guid;
    }
    var url = Constants.DEPLOY_APP_URL;
    var params = {
      guid: guid
    };

    $fw_manager.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.simpleDeployStart("dev", res.cacheKey, cb);
      } else {
        console.log('dev Deploy failed:' + res);
      }
    }, null, true);
  },
  
  simpleDeployStart: function(deploying_env, cache_key, cb) {
    var self = this;
    console.log('deploying.deployStarted: [' + deploying_env + '] [' + cache_key + ']');

    var deploy_task = new ASyncServerTask({
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
        console.log('deploying update > ' + JSON.stringify(res));
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
    deploy_task.run();
  },

  updateProgress: function(env, value) {
    var progress_el;
    if (env == 'dev') {
      progress_el = $('#deploying_dev_progressbar');
    } else if (env == 'live') {
      progress_el = $('#deploying_live_progressbar');
    }

    progress_el.progressbar({
      value: value
    });
  },

  resetProgress: function(env) {
    var progress_el, progress_log_el;
    if (env == 'dev') {
      progress_el = $('#deploying_dev_progressbar');
    } else if (env == 'live') {
      progress_el = $('#deploying_live_progressbar');
    }

    if (env == 'dev') {
      progress_log_el = $('#deploying_dev_progresslog textarea');
    } else if (env == 'live') {
      progress_log_el = $('#deploying_live_progresslog textarea');
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
      progress_log_el = $('#deploying_dev_progresslog textarea');
    } else if (env == 'live') {
      progress_log_el = $('#deploying_live_progresslog textarea');
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

  deployCompleteSuccess: function() {
    console.log('Deploy complete - success.');
  },

  deployCompleteFailed: function() {
    console.log('Deploy complete - failed.');
  }

});