var Apps = Apps || {};

Apps.Deploy = Apps.Deploy || {};

Apps.Deploy.Controller = Apps.Cloud.Controller.extend({

  model: {
    deploy: new model.Deploy()
  },

  target_map: {
    FEEDHENRY: 'FeedHenry',
    CLOUDFOUNDRY: 'Cloud Foundry',
    STACKATO: 'ActiveState Stackato',
    APPFOG: 'App Fog',
    IRONFOUNDRY: 'Iron Foundry'
  },

  views: {
    deploying_container: "#deploying_container"
  },

  subviews: {
    deploy_targets: '.deploy_targets'
  },

  container: null,
  active_async_task: null,

  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  },

  show: function() {
    this._super(this.views.deploying_container);
    var self = this;

    this.container = this.views.deploying_container;
    this.initFn();
    var cloud_env = $fw.data.get('cloud_environment');

    this.sub_container = $('#deploy_' + cloud_env + '_container', this.container);

    $('.deploy_devlive_container', this.container).hide();
    this.sub_container.show();

    if (this.sub_container.data('deploy')) {
      $(this.container).show();
    } else {
      $(this.subviews.deploy_targets, this.sub_container).hide();
      $('.deploy_action', this.sub_container).removeClass('hidden').addClass('hidden');

      var app_guid = $fw.data.get('inst').guid;

      $(this.container).show();

      this.model.deploy.list(app_guid, cloud_env, function(targets) {
        self.renderTargets(targets.list);
      }, function() {
        // List failed
      });
    }
  },

  disableDeployButton: function(sub_container) {
    $('.deploy_cloud_app', sub_container).attr('disabled', 'disabled');
    $('.abort_cloud_app_deploy', sub_container).removeClass('hidden').show();
  },

  enableDeployButton: function(sub_container) {
    $('.deploy_cloud_app', sub_container).removeAttr('disabled');
    $('.abort_cloud_app_deploy', sub_container).hide();
  },

  initBindings: function() {
    var self = this;
    var container = $(this.views.deploying_container);

    $fw.client.lang.insertLangForContainer(container);

    $('.deploy_cloud_app', this.sub_container).unbind().click(function(e) {
      e.preventDefault();
      self.disableDeployButton($(this).closest('.deploy_devlive_container'));
      self.deploy();
    });

    $('.create_new_deploy_target', this.sub_container).unbind().click(function() {
      $('#admin_tab').trigger('click');
      $('.nav-list .deploy_targets', this.sub_container).trigger('click');
    });

    $('.abort_cloud_app_deploy', this.sub_container).unbind().click(function() {
      self.abort();
    });
  },

  abort: function() {
    this.active_async_task.cancel();
    this.enableDeployButton();
    this.resetProgress(this.sub_container);
  },

  deploy: function() {
    this.makeProgressStriped(this.sub_container);
    var env = $fw.data.get('cloud_environment');

    if (env === 'live') {
      this.liveDeploy();
    } else {
      this.devDeploy();
    }
  },

  renderTargets: function(targets) {
    var self = this;
    var targets_area = $(this.subviews.deploy_targets, this.sub_container).show();
    targets_area.empty();
    var current_target_button;
    var row;

    $.each(targets, function(i, target) {
      // 3 targets per row
      if (i === 0 || i % 3 === 0) {
        // Create a new row
        var row_el = $('<div>').addClass('target_row fluid-row');
        targets_area.append(row_el);
      }

      // Use last row
      row = targets_area.find('div.target_row:last');

      var target_name = target.fields.target;
      var label_name = target.fields.name;

      var button = $('<a>').addClass('btn');
      var icon = $('<img>').attr('src', '/studio/static/themes/default/img/cloud_target_' + target_name.toLowerCase() + '.png');
      button.addClass('span4');
      button.append(icon);

      var label = $('<div>').addClass('cloud_target_label');
      if (target.fields.id !== 'default') {
        label.text(label_name);
      } else {
        label.text(self.target_map[target.fields.target]);
      }
      button.append(label);
      row.append(button);

      button.data(target);

      // Is this target the previously used target?
      if (target.fields.selected) {
        current_target_button = button;
      }

      button.click(function(e) {
        e.preventDefault();
        var target = $(this).data();
        $(this).parent().parent().find('a').removeClass('active');
        $(this).addClass('active');

        // Show the deploy button
        if (!$('.deploy_action', this.sub_container).is(':visible')) {
          $('.deploy_action', this.sub_container).removeClass('hidden');
        }

        //self.resetProgress();
      });

      // Trigger switch to default target
      if (current_target_button) {
        current_target_button.trigger('click');
      }
    });
  },

  getTargetData: function() {
    var selected_button = $(this.subviews.deploy_targets + ' a.active', this.sub_container);
    var target = selected_button.data() || null;
    return target;
  },

  liveDeploy: function(guid) {
    this.sub_container.data('deploy', true);

    var target = this.getTargetData();
    var self = this;
    if (!guid) {
      guid = $fw.data.get('inst').guid;
    }
    var url = Constants.RELEASE_DEPLOY_APP_URL;
    var params = {
      guid: guid,
      target_id: target.fields.id
    };
    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.deployStarted(res.cacheKey, self.sub_container);
      } else {
        console.log('live Deploy failed:' + res);
        self.sub_container.data('deploy', false);
      }
    }, null, true);
  },

  devDeploy: function(guid) {
    this.sub_container.data('deploy', true);

    var target = this.getTargetData();
    var self = this;
    if (!guid) {
      guid = $fw.data.get('inst').guid;
    }
    var url = Constants.DEPLOY_APP_URL;
    var params = {
      guid: guid,
      target_id: target.fields.id
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.deployStarted(res.cacheKey, self.sub_container);
      } else {
        console.log('dev Deploy failed:' + res);
        self.sub_container.data('deploy', false);
      }
    }, null, true);
  },

  deployStarted: function(cache_key, sub_container) {
    var self = this;
    this.resetProgress(sub_container);
    console.log('deploying.deployStarted: [' + cache_key + ']');
    var progress = 0;

    this.active_async_task = new ASyncServerTask({
      cacheKey: cache_key
    }, {
      updateInterval: Properties.cache_lookup_interval,
      maxTime: Properties.cache_lookup_timeout,
      // 5 minutes
      maxRetries: Properties.cache_lookup_retries,
      timeout: function(res) {
        console.log('deploying timeout error > ' + JSON.stringify(res));
        self.updateProgressLog("Deploy request timed out.", sub_container);
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed(sub_container);
        }
        self.updateProgress(100, sub_container);
      },
      update: function(res) {
        console.log('deploying update > ' + JSON.stringify(res));
        for (var i = 0; i < res.log.length; i++) {
          console.log(res.log[i]);
        }
        if(res.progress){
          progress = res.progress;
        } else {
          progress += 2;
        }

        self.updateProgressLog(res.log, sub_container);
        self.updateProgress(progress, sub_container);
      },
      complete: function(res) {
        console.log('Deploy successful > ' + JSON.stringify(res));
        if ($.isFunction(self.deployCompleteSuccess)) {
          self.deployCompleteSuccess(sub_container);
        }
        self.updateProgress(100, sub_container);
      },
      error: function(res) {
        console.log('Deploy error > ' + JSON.stringify(res));
        self.updateProgressLog(res.error);
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed(sub_container);
        }
        self.updateProgress(100, sub_container);
      },
      retriesLimit: function() {
        console.log('Deploy retriesLimit exceeded: ' + Properties.cache_lookup_retries);
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed(sub_container);
        }
        self.updateProgress(100, sub_container);
      },
      end: function() {
        sub_container.data('deploy', false);
      }
    });
    this.active_async_task.run();
  },

  updateProgress: function(value, sub_container) {
    var progress_el = $('.cloud_deploy_progress .progress', sub_container);
    var bar = $('.bar', progress_el);
    bar.css('width', value + '%');
  },

  resetProgress: function(sub_container) {
    var progress_el = $('.cloud_deploy_progress .progress', sub_container);
    var progress_log_el = $('.cloud_deploy_progress textarea', sub_container);
    var bar = $('.bar', progress_el);

    progress_log_el.val('');

    bar.css('width', '0%');
    setTimeout(function() {
      bar.css('width', '0%');
    }, 500);
  },

  updateProgressLog: function(log, sub_container) {
    // allow for string or array of strings
    log = 'string' === typeof log ? [log] : log;
    var progress_log_el = $('.cloud_deploy_progress textarea', sub_container);

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

  makeProgressGreen: function(sub_container) {
    $('.cloud_deploy_progress .progress', sub_container).removeClass('progress-striped').addClass('progress-success');
  },

  makeProgressRed: function(sub_container) {
    $('.cloud_deploy_progress .progress', sub_container).removeClass('progress-striped').addClass('progress-danger');
  },

  makeProgressStriped: function(sub_container) {
    $('.cloud_deploy_progress .progress', sub_container).removeClass('progress-danger progress-success').addClass('progress-striped');
  },

  deployCompleteSuccess: function(sub_container) {
    console.log('Deploy complete - success.');
    this.enableDeployButton(sub_container);
    this.makeProgressGreen(sub_container);
  },

  deployCompleteFailed: function(sub_container) {
    console.log('Deploy complete - failed.');
    this.enableDeployButton(sub_container);
    this.makeProgressRed(sub_container);
  },

  /*
   * Simple Deploys don't do any UI updating, and simply
   * callback when a cacheKey for a Deploy has completed.
   * It doesn't track progress.
   */
  simpleLiveDeploy: function(guid, target_id, cb) {
    var self = this;
    if (!guid) {
      guid = $fw.data.get('inst').guid;
    }
    var url = Constants.RELEASE_DEPLOY_APP_URL;
    var params = {
      guid: guid,
      target_id: target_id || 'default'
    };

    $fw.server.post(url, params, function(res) {
      if (res.status === "ok") {
        self.simpleDeployStart(res.cacheKey, cb);
      } else {
        console.log('live Deploy failed:' + res);
      }
    }, null, true);
  },

  simpleDevDeploy: function(guid, target_id, cb) {
    var self = this;
    if (!guid) {
      guid = $fw.data.get('inst').guid;
    }
    var url = Constants.DEPLOY_APP_URL;
    var params = {
      guid: guid,
      target_id: target_id || 'default'
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
  }

});