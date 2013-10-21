var App = App || {};
App.View = App.View || {};

App.View.CMSEnable = App.View.CMSModalProgress.extend({
  op : 'Enable',
  buttonText : "Done!",
  initialize: function(options){
    this.templates = _.extend(this.constructor.__super__.templates, {
      'cms_enableModal' : '#cms_enableModal'
    });
    this.auditMessage = 'CMS Enabled';
    this.compileTemplates();
    this.constructor.__super__.initialize.apply(this, arguments);
    this.text = $(this.templates.$cms_enableModal());
  },
  render : function(){
    this.constructor.__super__.render.apply(this, arguments);
    return this;
  },
  doOperation : function(){
    this.$el.find('#modal-cancel').remove();
    this.$el.find('#modal-ok').html(this.buttonText).attr('disabled', true);
    this.$el.find('.progress').addClass('progress-striped');
    var self = this,
    mode = "dev", // TODO why doesnt $fw.data.get('cloud_environment') work
    params = {
    "serviceName":"cms",
    "env":mode,
    "appGuid":$fw.data.get('inst').guid,
    "restage":true
    };

    $.ajax({
      type: 'POST',
      url: Constants.CMS_ENABLE_URL,
      contentType : 'application/json',
      data: JSON.stringify(params),
      timeout: 20000,
      success: function(res){
        if (res.status === "ok") {
          self.enableStarted(res.result.cacheKey[mode]);
        } else {
          console.log('Enable failed:' + res);
        }
      },
      error : function(response, message, status){
        try{
          var msg = JSON.parse(response.responseText).message;
          self.updateProgressLog(msg);
        }catch(err){
        }
        self.enableFailed();
      }
    });
  },
  enableStarted : function(cache_key){
    var self = this,
    progress = 0;
    this.active_async_task = new ASyncServerTask({
      cacheKey: cache_key
    }, {
      updateInterval: Properties.cache_lookup_interval,
      maxTime: Properties.cache_lookup_timeout,
      // 5 minutes
      maxRetries: Properties.cache_lookup_retries,
      timeout: function (res) {
        console.log('enable timeout error > ' + JSON.stringify(res));
        self.updateProgressLog("Enable timed out.");
        if ($.isFunction(self.enableFailed)) {
          self.enableFailed();
        }
        self.updateProgress(100);
      },
      update: function (res) {
        console.log('enable update > ' + JSON.stringify(res));
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

        if (res.status === "COMPLETE"){
          return self.enableSuccess();
        }else if (res.status ==="ERROR"){
          self.updateProgress(100);
          return self.enableFailed();
        }


      },
      complete: function (res) {
        console.log('Migrate successful > ' + JSON.stringify(res));
        if ($.isFunction(self.enableSuccess)) {
          self.enableSuccess();
        }
      },
      error: function (res) {
        console.log('Migrate error > ' + JSON.stringify(res));
        self.updateProgressLog(res.error);
        if ($.isFunction(self.enableFailed)) {
          self.enableFailed();
        }
        self.updateProgress(100);
      },
      retriesLimit: function () {
        console.log('Migrate retriesLimit exceeded: ' + Properties.cache_lookup_retries);
        if ($.isFunction(self.enableFailed)) {
          self.enableFailed();
        }
        self.updateProgress(100);
      },
      end: function () {

      }
    });
    this.active_async_task.run();
  },
  updateProgressLog: function (log) {
    // allow for string or array of strings
    log = 'string' === typeof log ? [log] : log;
    var progress_log_el = this.$el.find('textarea');

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
    var progress_el = this.$el.find('.progress');
    var bar = this.$el.find('.bar', progress_el);
    bar.css('width', value + '%');
  },
  enableFailed : function(){
    this.$el.find('#modal-ok').html(this.buttonText).attr('disabled', false);
    this.$el.find('.progress').removeClass('progress-striped').addClass('progress-danger');
  },
  enableSuccess : function(){
    var self = this;
    // update inst now that enable is complete so it has the hasOwnDb property in millicore
    $fw.client.model.App.read($fw.data.get('inst').guid, function(result) {
      $fw.data.set('inst', result.inst);
      self.$el.find('.progress').removeClass('progress-striped').addClass('progress-success');
      self.updateProgress(100);
      self.updateProgressLog('Migration successful');
      self.$el.find('#modal-ok').html(this.buttonText).attr('disabled', false);
      self.done = true;
    }, function(err){
      self.updateProgressLog('Error updating app instance properties');
    });
  },
  ok : function(){
    this.constructor.__super__.ok.apply(this, arguments);
    if (this.done){
      this.trigger('enabled');
    }
  }
});