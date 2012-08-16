var Apps = Apps || {};

Apps.Logging = Apps.Logging || {};

Apps.Logging.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    debug_logging_container: "#debug_logging_container"
    // device_list: "#admin_devices_list",
    // device_update: "#admin_devices_update"
  },

  container: null,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },
  
  /*
   * Initialise any UI components required for logging.
   * Once-off initialisation
   */
  initBindings: function () {
    var self = this;
    var container = $(this.views.debug_logging_container);

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
    this._super();
    
    this.hide();
    this.container = this.views.debug_logging_container;

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