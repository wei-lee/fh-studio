var Apps = Apps || {};

Apps.Deploy = Apps.Deploy || {};

Apps.Deploy.Controller = Apps.Cloud.Controller.extend({

  model: {
    deploy: new model.Deploy(),
    app : new model.App()
  },

  views: {
    deploying_container: "#deploying_container"
  },

  subviews: {
    deploy_targets: '.deploy_targets'
  },

  container: null,
  active_async_task: null,

  init: function () {
    this._super();
    this.initFn = _.once(this.initBindings);
    this.target_map = $fw.getClientProp('deploy-target-map');
  },

  show: function () {
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

      this.model.deploy.list(app_guid, cloud_env, function (targets) {
        self.renderTargets(targets.list);
      }, function () {
        // List failed
      });
    }

  },

	setRuntimes : function (){
		var self = this;
		var env = $fw.data.get('cloud_environment');
		var guid = $fw.data.get('inst').guid;
		var targetInfo = self.getTargetData();
		var depTarget = targetInfo.fields.target;
		var controlDiv = $('div#nodevers');
		$('select.nodevers').hide();
		var select = $('select#'+env+'nodevers');
		var runtimesEnabled = $fw.getClientProp("nodejs.runtimes."+env+".show");
		if(!runtimesEnabled || runtimesEnabled === "false"){
			controlDiv.hide();
			return;
		}
		else{
			controlDiv.show();
		}
		var enabledTargets = $fw.getClientProp("nodejs.runtimes.supported");
		if(enabledTargets){
			if(enabledTargets.indexOf(depTarget) == -1){
				controlDiv.hide();
				return;
			}
		}
		select.show();
		async.waterfall([
			function (callback){
				var runtimes = $fw.data.get("runtimes");
				callback(null, runtimes);
			}, function (runtimes, callback){
				if(! runtimes){
					$fw.server.post(Constants.RUNTIMES_URL,{"platform":depTarget,"runtime":"nodejs","deploytarget":env}, function (data){
						if(data && data.status == "error"){
              return	callback(data);
						}
						$fw.data.set("runtimes",data);
						callback(undefined,data);
					}, function (err){
            callback(err);
					});
				}
				else callback(undefined, runtimes);
			},function (runtimes, callback){
				//should now have runtimes need to get a fresh read of the app as the app may have been staged from fhc and the runtime changed
				self.model.app.read(guid, function (app){
					callback(undefined,runtimes,app);
				},function (err){
          console.log(err);
				});
			}, function (runtimes, app, callback){

				var appConfig = app.inst.config;
				var runtime = (appConfig["nodejs"]) ? appConfig["nodejs"]["app"]["runtime"][env] :undefined;

				select.empty();
				if(runtimes && runtimes.result){
					for(var i = 0; i < runtimes.result.length; i++ ){
						var rtime = runtimes.result[i];
						var selected="";
						if(runtime && runtime === rtime.name)selected = "selected";
						else if(! runtime && rtime["default"])selected = "selected";

						select.append("<option "+selected+" value='"+rtime.name+"' >"+rtime.name+"</option>");
						callback();
					}
				}else {
					callback("error with runtimes");
				}

			}
		],function (err, ok){
			if(err){
				console.log("runtimes error", err);
				controlDiv.hide();
			}
		});
	},

  disableDeployButton: function (sub_container) {
    $('.deploy_cloud_app', sub_container).attr('disabled', 'disabled');
    $('.abort_cloud_app_deploy', sub_container).removeClass('hidden').show();
  },

  enableDeployButton: function (sub_container) {
    $('.deploy_cloud_app', sub_container).removeAttr('disabled');
    $('.abort_cloud_app_deploy', sub_container).hide();
  },

  initBindings: function () {
    var self = this;
    var container = $(this.views.deploying_container);

    $fw.client.lang.insertLangForContainer(container);

    $('.deploy_cloud_app', this.sub_container).unbind().click(function (e) {
      e.preventDefault();
      self.disableDeployButton($(this).closest('.deploy_devlive_container'));
      self.deploy();
    });

    $('.create_new_deploy_target', this.sub_container).unbind().click(function () {
      $('#admin_tab').trigger('click');
      $('.nav-list .deploy_targets', this.sub_container).trigger('click');
    });

    $('.abort_cloud_app_deploy', this.sub_container).unbind().click(function () {
      self.abort();
    });

  },

  abort: function () {
    if (this.active_async_task) {
      this.active_async_task.cancel();
    }
    this.enableDeployButton();
    this.resetProgress(this.sub_container);
  },

  deploy: function () {
    this.makeProgressStriped(this.sub_container);
    var env = $fw.data.get('cloud_environment');


    if (env === 'live') {
      if($fw.getClientProp('require-approver-for-live-stage') == 'true'){
        this.promptForApprover();
      } else {
        this.liveDeploy();
      }
    } else {
      this.devDeploy();
    }
  },
	validTarget: function(target){
		var depTargetsEnabled =  $fw.getClientProp("deployment-targets-enabled");
		if("FEEDHENRY" === target.toUpperCase())return true;

		else if("false" === depTargetsEnabled)
			return false;

		else{
			var validTargets = $fw.getClientProp('nodejsValidTargets');
			if(!validTargets) return false;

			validTargets = validTargets.split(",");
			return (validTargets.indexOf(target.toLowerCase()) !== -1);
		}




  },

  renderTargets: function (targets) {
    var self = this;

    var targets_area = $(this.subviews.deploy_targets, this.sub_container).show();
    targets_area.empty();
    var current_target_button;
    var row;

    $.each(targets, function (i, target) {
      var target_name = target.fields.target;
      var label_name = target.fields.name;

      if(! self.validTarget(target_name)) return;

      // 3 targets per row
      if (i === 0 || i % 3 === 0) {
        // Create a new row
        var row_el = $('<div>').addClass('target_row fluid-row');
        targets_area.append(row_el);
      }

      // Use last row
      row = targets_area.find('div.target_row:last');



      var button = $('<a>').addClass('btn');
      button.addClass('span4');

      // class name determines deploy target image, so whitelabel-able
      var label = $('<div>').addClass('cloud_target_label ' + target_name.toLowerCase());
      
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

      button.click(function (e) {
        e.preventDefault();

        var target = $(this).data();
        $(this).parent().parent().find('a').removeClass('active');
        $(this).addClass('active');

        // Show the deploy button
        if (!$('.deploy_action', this.sub_container).is(':visible')) {
          $('.deploy_action', this.sub_container).removeClass('hidden');
        }

        //self.resetProgress();
        self.setRuntimes();
      });

      // Trigger switch to default target
      if (current_target_button) {
        current_target_button.trigger('click');
      }
    });
  },

  getTargetData: function () {
    var selected_button = $(this.subviews.deploy_targets + ' a.active', this.sub_container);
    var target = selected_button.data() || null;
    return target;
  },

  promptForApprover: function (guid) {
    var self = this;
    var promptTemp = $(self.container).find('#deploy_approver_template').clone().removeClass("hidden");
    promptTemp.modal({
      keyboard: false,
      backdrop: 'static'
    }).find('.cancel-btn').unbind('click').click(function (e) {
      e.preventDefault();
      e.stopPropagation();
      promptTemp.modal("hide");
      self.enableDeployButton(self.sub_container);
      self.resetProgress(self.sub_container);
    }).end().find('.confirm-btn').unbind('click').click(function (e) {
      e.preventDefault();
      e.stopPropagation();
      var approverEmail = promptTemp.find('.approver_email').val();
      if (approverEmail === "") {
        promptTemp.find('.approver_email_control').addClass('error').find('.help-inline').removeClass('hidden');
        promptTemp.find('.approver_email_control').find('.approver_email').bind('keydown', function (e) {
          $(this).parents('.error').removeClass('error').end().siblings('.help-inline').addClass('hidden');
        });
      } else {
        if (!guid) {
          guid = $fw.data.get('inst').guid;
        }
        var comment = promptTemp.find('.approver_comment').val();
        promptTemp.modal("hide");
        self.liveDeploy(guid, approverEmail, comment);
      }
    });

  },

  liveDeploy: function (guid, approverEmail, comment) {
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
    if(approverEmail){
      params.approver = approverEmail;
    }
    if(comment && comment.length > 0){
      params.comment = comment;
    }
    var runtime = $('select.nodevers:visible option:selected').val();
    if(runtime){
      params.runtime = runtime;
    }
    $fw.server.post(url, params, function (res) {
      if (res.status === "ok") {
        self.deployStarted(res.cacheKey, self.sub_container, 'live');
      } else {
        console.log('live Deploy failed:' + res);
        self.sub_container.data('deploy', false);
      }
    }, null, true, 60000);
  },

  devDeploy: function (guid) {
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
    var runtime = $('select.nodevers:visible option:selected').val();
    if(runtime){
      params.runtime = runtime;
    }
    $fw.server.post(url, params, function (res) {
      if (res.status === "ok") {
        self.deployStarted(res.cacheKey, self.sub_container, 'dev');
      } else {
        console.log('dev Deploy failed:' + res);
        self.sub_container.data('deploy', false);
      }
    }, null, true, 60000);
  },

  deployStarted: function (cache_key, sub_container, env) {
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
      timeout: function (res) {
        console.log('deploying timeout error > ' + JSON.stringify(res));
        self.updateProgressLog("Deploy request timed out.", sub_container);
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed(sub_container);
        }
        self.updateProgress(100, sub_container);
      },
      update: function (res) {
        console.log('deploying update > ' + JSON.stringify(res));
        for (var i = 0; i < res.log.length; i++) {
          console.log(res.log[i]);
        }
        if (res.progress) {
          progress = res.progress;
        } else {
          progress += 2;
        }

        self.updateProgressLog(res.log, sub_container);
        self.updateProgress(progress, sub_container);
      },
      complete: function (res) {
        console.log('Deploy successful > ' + JSON.stringify(res));
        if ($.isFunction(self.deployCompleteSuccess)) {
          self.deployCompleteSuccess(sub_container, env);
        }
        self.updateProgress(100, sub_container);
      },
      error: function (res) {
        console.log('Deploy error > ' + JSON.stringify(res));
        self.updateProgressLog(res.error, sub_container);
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed(sub_container);
        }
        self.updateProgress(100, sub_container);
      },
      retriesLimit: function () {
        console.log('Deploy retriesLimit exceeded: ' + Properties.cache_lookup_retries);
        if ($.isFunction(self.deployCompleteFailed)) {
          self.deployCompleteFailed(sub_container);
        }
        self.updateProgress(100, sub_container);
      },
      end: function () {
        sub_container.data('deploy', false);
      }
    });
    this.active_async_task.run();
  },

  updateProgress: function (value, sub_container) {
    var progress_el = $('.cloud_deploy_progress .progress', sub_container);
    var bar = $('.bar', progress_el);
    bar.css('width', value + '%');
  },

  resetProgress: function (sub_container) {
    var progress_el = $('.cloud_deploy_progress .progress', sub_container);
    var progress_log_el = $('.cloud_deploy_progress textarea', sub_container);
    var bar = $('.bar', progress_el);

    progress_log_el.val('');

    bar.css('width', '0%');
    setTimeout(function () {
      bar.css('width', '0%');
    }, 500);
  },

  updateProgressLog: function (log, sub_container) {
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

  makeProgressGreen: function (sub_container) {
    $('.cloud_deploy_progress .progress', sub_container).removeClass('progress-striped').addClass('progress-success');
  },

  makeProgressRed: function (sub_container) {
    $('.cloud_deploy_progress .progress', sub_container).removeClass('progress-striped').addClass('progress-danger');
  },

  makeProgressStriped: function (sub_container) {
    $('.cloud_deploy_progress .progress', sub_container).removeClass('progress-danger progress-success').addClass('progress-striped');
  },

  deployCompleteSuccess: function (sub_container, env) {
    console.log('Deploy complete - success [' + env + ']');
    this.enableDeployButton(sub_container);
    this.makeProgressGreen(sub_container);
    $('.status_light.' + env).addClass('okay');
  },

  deployCompleteFailed: function (sub_container) {
    console.log('Deploy complete - failed.');
    this.enableDeployButton(sub_container);
    this.makeProgressRed(sub_container);
  },

  /*
   * Simple Deploys don't do any UI updating, and simply
   * callback when a cacheKey for a Deploy has completed.
   * It doesn't track progress.
   */
  simpleLiveDeploy: function (guid, target_id, cb) {
    var self = this;
    if (!guid) {
      guid = $fw.data.get('inst').guid;
    }
    var url = Constants.RELEASE_DEPLOY_APP_URL;
    var params = {
      guid: guid,
      target_id: target_id || 'default'
    };

    $fw.server.post(url, params, function (res) {
      if (res.status === "ok") {
        self.simpleDeployStart(res.cacheKey, cb);
      } else {
        console.log('live Deploy failed:' + res);
      }
    }, null, true);
  },

  simpleDevDeploy: function (guid, target_id, cb) {
    var self = this;
    if (!guid) {
      guid = $fw.data.get('inst').guid;
    }
    var url = Constants.DEPLOY_APP_URL;
    var params = {
      guid: guid,
      target_id: target_id || 'default'
    };

    $fw.server.post(url, params, function (res) {
      if (res.status === "ok") {
        self.simpleDeployStart(res.cacheKey, cb);
      } else {
        console.log('dev Deploy failed:' + res);
      }
    }, null, true);
  },

  simpleDeployStart: function (cache_key, cb) {
    var self = this;
    console.log('deploying.deployStarted: [' + cache_key + ']');

    var deploy_task = new ASyncServerTask({
      cacheKey: cache_key
    }, {
      updateInterval: Properties.cache_lookup_interval,
      maxTime: Properties.cache_lookup_timeout,
      // 5 minutes
      maxRetries: Properties.cache_lookup_retries,
      timeout: function (res) {
        cb(res);
      },
      update: function (res) {
        console.log('deploying update > ' + JSON.stringify(res));
      },
      complete: function (res) {
        cb(res);
      },
      error: function (res) {
        cb(res);
      },
      retriesLimit: function () {
        cb(res);
      },
      end: function () {}
    });
    deploy_task.run();
  }

});