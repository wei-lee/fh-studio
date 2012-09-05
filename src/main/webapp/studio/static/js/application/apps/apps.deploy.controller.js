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
    deploying_container: "#deploying_container",
    deploy_targets: '#deploy_targets',
    progress_area: '#cloud_deploy_progress'
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

    $('.deploy_action', self.views.deploying_container).removeClass('hidden').addClass('hidden');
    this.hideProgressArea();

    var cloud_env = $fw.data.get('cloud_environment');
    var app_guid = $fw.data.get('inst').guid;

    this.model.deploy.list(app_guid, cloud_env, function(targets) {
      self.renderTargets(targets.list);
      $(self.container).show();
    }, function() {
      // List failed
    });
  },

  showProgressArea: function() {
    $('#cloud_deploy_progress').show();
    $('#cloud_deploy_progress .progresslog').show();
    $('#cloud_deploy_progress textarea').show();
    this.resetProgress();
  },

  hideProgressArea: function() {
    $('#cloud_deploy_progress').hide();
    $('#cloud_deploy_progress .progresslog').hide();
    $('#cloud_deploy_progress textarea').hide();
    this.resetProgress();
  },

  initBindings: function() {
    var self = this;
    var container = $(this.views.deploying_container);

    $fw.client.lang.insertLangForContainer(container);

    $('#deploy_cloud_app').unbind().click(function(e) {
      e.preventDefault();
      self.deploy();
    });

    $('.create_new_deploy_target', container).unbind().click(function() {
      $('#admin_tab').trigger('click');
      $('.nav-list .deploy_targets').trigger('click');
    });
  },

  deploy: function() {
    this.showProgressArea();
    var env = $fw.data.get('cloud_environment');

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
        if (!$('.deploy_action', self.views.deploying_container).is(':visible')) {
          $('.deploy_action', self.views.deploying_container).removeClass('hidden');
        }

        self.resetProgress();
      });

      // Trigger switch to default target
      if (current_target_button) {
        current_target_button.trigger('click');
      }
    });
  },

  getTargetData: function() {
    var selected_button = $('a.active', this.views.deploy_targets);
    var target = selected_button.data() || null;
    return target;
  },

  liveDeploy: function(guid) {
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
        self.deployStarted(res.cacheKey);
      } else {
        console.log('live Deploy failed:' + res);
      }
    }, null, true);
  },

  devDeploy: function(guid) {
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
        progress += 2;

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
      $(self.views.progress_area).slideUp();
      self.showAlert('success', 'Your Cloud App has been deployed successfully.');
    }, 2000);
  },

  deployCompleteFailed: function() {
    console.log('Deploy complete - failed.');
    var self = this;
    setTimeout(function() {
      $(self.views.progress_area).slideUp();
      self.showAlert('error', 'An error occured while deploying your Cloud App');
    }, 2000);
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