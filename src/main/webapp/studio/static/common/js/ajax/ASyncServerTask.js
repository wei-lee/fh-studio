/*
 * Class for performing an asynchronous server task e.g. importing an application
 * 
 * Expects a serverside cacheKey to be passed in the constructor params 
 */
/*global ASyncServerTask, $, server_constants, server_util, scheduler
 */
ASyncServerTask = function (params, opts) {
  var self = {
    tasks: {},
    opts: {},

    num_tries: 0,
    log_timeout: null,
    read_in_progress: false,

    run: function () {
      self.log_timeout = setInterval(function () {
        // If still waiting for a previous response, don't kick off another one
        if (!self.read_in_progress) {
          self.read_in_progress = true;
          var cacheKeys = [];
          for (var key in self.tasks) {
            var tempTask = self.tasks[key];
            if (!self.taskFinished(tempTask)) {
              cacheKeys.push({
                cacheKey: key,
                start: tempTask.log_start
              });
            }
          }
          var url = Constants.DAT_LOG_READ_URL + '?cacheKeys=' + JSON.stringify(cacheKeys);
          $.ajax({
            url: url,
            type: 'GET',
            success: function (results) {
              for (var ri = 0, rl = results.length; ri < rl; ri++) {
                var res = results[ri],
                    cacheKey = res.cacheKey,
                    task = self.tasks[cacheKey];
                if (res.log) {
                  if (res.log.length > 0) {
                    task.start_timestamp = new Date().getTime();
                    task.log_start += res.log.length;
                  }
                  self.execFn(self.opts.update, res);
                }
                if ("pending" === res.status) {
                  task.status = "pending";
                  var currentTime = new Date().getTime();
                  if (currentTime - task.start_timestamp >= self.opts.maxTime) {
                    task.status = "timeout";

                    // Check if all tasks have complete, and clear interval and execute timeout callbacks if they are
                    var allComplete = self.allTasksComplete();

                    if (allComplete) {
                      clearInterval(self.log_timeout);
                      self.execFn(self.opts.timeout, res);
                      self.execFn(self.opts.end);
                    }
                  }
                } else {
                  $.get(Constants.DAT_LOG_REMOVE_URL + '?cacheKey=' + cacheKey, $.noop);

                  // If there's an error, clear interval and execute error callback now rather than waiting for all tasks to complete
                  if ("error" === res.status) {
                    task.status = "error";
                    clearInterval(self.log_timeout);
                    self.execFn(self.opts.error, res);
                    self.execFn(self.opts.end);
                  } else {
                    task.status = "complete";
                    task.res = res;
                    // Check if all tasks have complete, and clear interval and execute callbacks if they are
                    var allComplete = self.allTasksComplete();

                    if (allComplete) {
                      clearInterval(self.log_timeout);
                      if ("complete" === res.status) {
                        self.execFn(self.opts.complete, res);
                        for (var key in self.tasks) {
                          var tempTask = self.tasks[key];
                          self.execFn(tempTask.complete, tempTask.res);
                        }
                        self.execFn(self.opts.end);
                      }
                    }
                  }
                }
              }
              self.read_in_progress = false;
            },
            error: function () {
              // check if the max retries has been reached
              if ((self.num_tries += 1) > self.opts.maxRetries) {
                // max reached, clear retry function
                clearInterval(self.log_timeout);
                // retries callback
                self.execFn(self.opts.retriesLimit);
                self.execFn(self.opts.end);
              }
            }
          });
        }
      }, self.opts.updateInterval);
    },

    initialise: function () {
      var defaultOpts = {
        updateInterval: Properties.cache_lookup_interval,
        maxTime: Properties.cache_lookup_timeout,
        // 5 minutes
        maxRetries: Properties.cache_lookup_retries
      };
      self.opts = $.extend({}, defaultOpts, opts);

      var taskOpts = {
        start_timestamp: new Date().getTime(),
        log_start: 0,
        status: 'none'
      };
      if ('undefined' !== typeof params) {
        var tasks = params;

        // Check if there are multiple tasks or a single task (array or object)
        if (!$.isArray(tasks)) {
          // Only one task, lets put this task in an array
          tasks = [params];
        }

        // Iterate over tasks adding to the tasks object
        for (var ti = 0, tl = tasks.length; ti < tl; ti++) {
          var tempParam = tasks[ti];
          var task = {};
          task = $.extend({}, taskOpts, tempParam);
          self.tasks[task.cacheKey] = task;
        }
      }
    },

    allTasksComplete: function () {
      var allComplete = true;

      for (var key in self.tasks) {
        var tempTask = self.tasks[key];
        if (!self.taskFinished(tempTask)) {
          allComplete = false;
        }
      }

      return allComplete;
    },

    execFn: function (fn, args) {
      if ($.isFunction(fn)) {
        fn(args);
      }
    },

    taskFinished: function (task) {
      var finished = false;

      finished = (('complete' === task.status) || ('error' === task.status));

      return finished;
    }
  };

  self.initialise();

  return {
    run: self.run
  };
};