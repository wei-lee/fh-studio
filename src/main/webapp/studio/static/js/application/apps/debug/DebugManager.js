application.DebugManager = Class.extend({
  
  init: function () {
  },
  
  show: function (action) {
    if ( 'log' === action ) {
      this.showLogging();
    }
  },
  
  showLogging: function () {
    Log.append('showLogging');
    
    if ( !this.showLoggingInitDone ) {
      this.showLoggingInit();
    }
    else {
      this.showLoggingReset();
    }

    // Cannot currently clear log files for node apps
    //  /deletelog endpoint not in fh-proxy yet
    if ($fw.client.app.isNodeJsApp()) {
      $('#debug_logging_clear_button').hide();
    } else {
      $('#debug_logging_clear_button').show();
    }

    this.refreshLog();
  },
  
  /*
   * Initialise any UI components required for logging.
   * Once-off initialisation
   */
  showLoggingInit: function () {
    var self = this;
    var container = $('#debug_logging_container');
    
    // init any buttons and callbacks
    container.find('#debug_logging_refresh_button').bind('click', function () {
      self.refreshLog();
    });
    container.find('#debug_logging_clear_button').bind('click', function () {
      self.clearLog();
    });
    
    self.showLoggingInitDone = true;
  },
  
  /*
   * Reset any UI components or variables required for logging
   */
  showLoggingReset: function () {
    
  },
  
  refreshLog: function () {
    $('#debug_logging_text').val('loading...');

    var instGuid = $fw_manager.data.get('inst').guid;
    var url = Constants.LOGS_URL;
    var params = {
      "guid": instGuid,
      "action": "get"
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
        $('#debug_logging_text').val('error loading...');
        $fw.client.dialog.error("Error getting logs: " + res.error);
      }
    }, function (error) {
      $('#debug_logging_text').val('error loading...');
      $fw.client.dialog.error($fw.client.lang.getLangString('read_log_error'));
    }, true);
  },
  
  clearLog: function () {
    var self = this, instGuid, url, params;
    
    instGuid = $fw_manager.data.get('inst').guid;
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