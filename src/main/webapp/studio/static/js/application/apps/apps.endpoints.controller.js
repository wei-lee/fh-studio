var Apps = Apps || {};

Apps.Endpoints = Apps.Endpoints || {};

Apps.Endpoints.Controller = Apps.Cloud.Controller.extend({

  model: {

  },

  views: {
    endpoints_container: "#endpoints_container"
  },

  container: null,

  init: function () {
    this._super();
    this.initFn = _.once(this.initBindings);
  },
  
  /*
   * Initialise any UI components required for logging.
   * Once-off initialisation
   */
  initBindings: function () {
    var self = this;
    var container = $(this.views.endpoints_container);

    $fw.client.lang.insertLangForContainer(container);
    
    // init any buttons and callbacks
    container.find('#debug_logging_refresh_button').bind('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.refreshLog();
    });
    container.find('#debug_logging_clear_button').bind('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.clearLog();
    });
  },

  show: function(){
    this._super(this.views.endpoints_container);
    
    this.initFn();
    this.showLogging();

    $(this.container).show();
  },
  
  showLogging: function () {
    console.log('showLogging');

    // Cannot currently clear log files for node apps
    //  /deletelog endpoint not in fh-proxy yet
    if ($fw.client.tab.apps.manageapps.isNodeJsApp()) {
      $('#debug_logging_clear_button').hide();
    } else {
      $('#debug_logging_clear_button').show();
    }

    this.refreshLog();
  },
  
  refreshLog: function () {
    $('#debug_logging_text').val('loading...');

    var instGuid = $fw.data.get('inst').guid;
    var url = Constants.LOGS_URL;
    var cloudEnv = $fw.data.get('cloud_environment');
    
    var params = {
      "guid": instGuid,
      "action": "get",
      "deploytarget": cloudEnv
    };

    $fw.server.post(url, params, function (res) {
      if ("ok" === res.status) {
        var logText = '';
        for (var log in res.log) {
          logText += '====> ' + log + ' START <====\n' + res.log[log] + '====> ' + log + ' END <====\n';
        }
        if (logText.length < 1) {
          logText = 'n/a';
        }
        $('#debug_logging_text').val('').val(logText);
      } else {
        $('#debug_logging_text').val('Error loading Cloud App Logs. Is your App Staged for this environment?');
      }
    }, function (error) {
      $('#debug_logging_text').val('Error loading Cloud App Logs. Is your App Staged for this environment?');
    }, true);
  },
  
  // TODO: move this 'model' stuff out of here
  clearLog: function () {
    var self = this, instGuid, url, params;
    
    instGuid = $fw.data.get('inst').guid;
    url = Constants.LOGS_URL;
    params = {
      "guid": instGuid,
      "action": "delete"
    };
    
    $fw.server.post(url, params, function (res) {
      if ('ok' === res.status) {
        $('#debug_logging_text').val('');
      }
      else {
        $fw.client.dialog.error("Error clearing logs: " + res.error);
      }
    }, function (error) {
      $fw.client.dialog.error($fw.client.lang.getLangString('clear_log_error'));
    }, true);
  }

});