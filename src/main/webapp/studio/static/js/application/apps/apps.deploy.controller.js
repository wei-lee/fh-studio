var Apps = Apps || {};

Apps.Deploy = Apps.Deploy || {};

Apps.Deploy.Controller = Apps.Cloud.Controller.extend({

  model: {
    deploy: new model.Deploy()
  },

  views: {
    deploying_container: "#deploying_container",
    deploy_targets: '#deploy_targets'
  },

  container: null,

  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super(this.views.deploying_container);
    var self = this;

    this.hide();
    this.container = this.views.deploying_container;
    this.initFn();

    this.resetProgress();
    $('.deploy_action', self.views.deploying_container).removeClass('hidden').addClass('hidden');

    var cloud_env = $fw.data.get('cloud_environment');

    this.model.deploy.list('guid', cloud_env, function(targets) {
      self.renderTargets(targets);
      $(self.container).show();
    }, function() {
      // List failed
    });
  },

  initBindings: function() {
    var self = this;
    var container = $(this.views.deploying_container);

    $fw.client.lang.insertLangForContainer(container);

    $('#deploy_cloud_app').unbind().click(function(e) {
      e.preventDefault();
      self.deploy();
    });
  },

  deploy: function() {
    var progress_area = $('#cloud_deploy_progress');
    var env = $fw.data.get('cloud_environment');
    progress_area.slideDown();

    if (env === 'live') {
      this.liveDeploy();
    } else {
      this.devDeploy();
    }
  },

  renderTargets: function(targets) {
    var self = this;
    var targets_area = $(this.views.deploy_targets).show();
    targets_area.empty();

    $.each(targets, function(i, target) {
      var target_name = target.fields.target;

      var button = $('<a>').addClass('btn');
      // TODO: Check active
      var icon = $('<img>').attr('src', '/studio/static/themes/default/img/cloud_target_' + target_name.toLowerCase() + '.png');
      // TODO: Check for custom
      //var label = $('<h5>').text(target_name);
      button.append(icon);
      // button.append(label);
      targets_area.append(button);

      button.data(target);

      button.click(function(e) {
        e.preventDefault();
        var target = $(this).data();
        $(this).parent().find('a').removeClass('active');
        $(this).addClass('active');

        // Show the deploy button
        if (!$('.deploy_action', self.views.deploying_container).is(':visible')) {
          $('.deploy_action', self.views.deploying_container).removeClass('hidden');
        }
      });
    });
  },

  liveDeploy: function(guid) {
    var self = this;
    if (!guid) {
      guid = $fw.data.get('app').guid;
    }
    var url = Constants.RELEASE_DEPLOY_APP_URL;
    var params = {
      guid: guid
    };
    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.deployStarted(res.cacheKey);
      } else {
        console.log('live Deploy failed:' + res);
      }
    }, null, true);
  },

  devDeploy: function(guid) {
    var self = this;
    if (!guid) {
      guid = $fw.data.get('app').guid;
    }
    var url = Constants.DEPLOY_APP_URL;
    var params = {
      guid: guid
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.deployStarted(res.cacheKey);
      } else {
        console.log('dev Deploy failed:' + res);
      }
    }, null, true);
  },

  deployStarted: function(cache_key) {
    $('.progress', this.views.deploying_container).slideDown();

    var self = this;
    this.resetProgress();
    console.log('deploying.deployStarted: [' + cache_key + ']');
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
        self.updateProgressLog("Deploy request timed out.");
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed();
        }
        self.updateProgress(100);
      },
      update: function(res) {
        console.log('deploying update > ' + JSON.stringify(res));
        for (var i = 0; i < res.log.length; i++) {
          console.log(res.log[i]);
        }
        progress += 3;

        self.updateProgressLog(res.log);
        self.updateProgress(progress);
      },
      complete: function(res) {
        console.log('Deploy successful > ' + JSON.stringify(res));
        if ($.isFunction(self.deployCompleteSuccess)) {
          self.deployCompleteSuccess();
        }
        self.updateProgress(100);
      },
      error: function(res) {
        console.log('Deploy error > ' + JSON.stringify(res));
        self.updateProgressLog(res.error);
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed();
        }
        self.updateProgress(100);
      },
      retriesLimit: function() {
        console.log('Deploy retriesLimit exceeded: ' + Properties.cache_lookup_retries);
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed();
        }
        self.updateProgress(100);
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
    var self = this;
    if (!guid) {
      guid = $fw.data.get('app').guid;
    }
    var url = Constants.RELEASE_DEPLOY_APP_URL;
    var params = {
      guid: guid
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.simpleDeployStart(res.cacheKey, cb);
      } else {
        console.log('live Deploy failed:' + res);
      }
    }, null, true);
  },

  simpleDevDeploy: function(guid, cb) {
    var self = this;
    if (!guid) {
      guid = $fw.data.get('app').guid;
    }
    var url = Constants.DEPLOY_APP_URL;
    var params = {
      guid: guid
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.simpleDeployStart(res.cacheKey, cb);
      } else {
        console.log('dev Deploy failed:' + res);
      }
    }, null, true);
  },

  simpleDeployStart: function(cache_key, cb) {
    var self = this;
    console.log('deploying.deployStarted: [' + cache_key + ']');

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

  updateProgress: function(value) {
    var progress_el = $('#cloud_deploy_progress .progress');
    var bar = $('.bar', progress_el);
    bar.css('width', value + '%');
  },

  resetProgress: function() {
    var progress_el = $('#cloud_deploy_progress .progress');
    var progress_log_el = $('#cloud_deploy_progress textarea');
    var bar = $('.bar', progress_el);

    progress_log_el.val('');
    bar.css('width', '0%');
  },

  updateProgressLog: function(log) {
    // allow for string or array of strings
    log = 'string' === typeof log ? [log] : log;
    var progress_log_el = $('#cloud_deploy_progress textarea');

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
    var self = this;
    setTimeout(function() {
      $('.progress', self.views.deploying_container).slideUp();
    }, 2000);
  },

  deployCompleteFailed: function() {
    console.log('Deploy complete - failed.');
    var self = this;
    setTimeout(function() {
      $('.progress', self.views.deploying_container).slideUp();
    }, 2000);
  }

});