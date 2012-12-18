var Apps = Apps || {};

Apps.Logging = Apps.Logging || {};

Apps.Logging.Controller = Apps.Cloud.Controller.extend({

  model: {
    //device: new model.Device()
    log: new model.CloudLog()
  },

  views: {
    debug_logging_container: "#debug_logging_container"
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
    var container = $(this.views.debug_logging_container);

    $fw.client.lang.insertLangForContainer(container);
    
    // init any buttons and callbacks
    container.find('#debug_logging_refresh_button').bind('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.showLogging();
      self.loadLogList();
    });
    container.find('#debug_logging_clear_button').bind('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.clearLog();
    });
  },

  show: function(){
    this._super(this.views.debug_logging_container);
    this.initFn();
    this.showLogging();
    this.loadLogList();

    $(this.container).show();
  },

  loadLogList: function(){
    $(this.container).find('#debug_logging_list').hide();
    if($fw.client.tab.apps.manageapps.isNodeJsApp()){
      var self = this;
      var instGuid = $fw.data.get('inst').guid;
      var cloudEnv = $fw.data.get('cloud_environment');
      this.model.log.list(function(res){
        $(self.container).find('#debug_logging_list').show();
        var data = self.addControls(res);
        self.renderLogList($(self.container).find('#debug_logging_list_table'), data);
      }, function(error){
        console.log("Failed to get log list. Error: " + error);
      }, true, instGuid, cloudEnv);
    } else {
      $(this.container).find('#debug_logging_list').hide();
    }
  },

  addControls: function(res){
    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls",
      "sWidth": "62px"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      // TODO: Move to clonable hidden_template
      var button = '<button class="btn btn-danger delete_log">Delete</button>';
      controls.push(button);


      row.push(controls.join(""));

    });
    return res;
  },

  renderLogList: function(tableContainer, data){
    var self = this;
    this.logTable = $(tableContainer).show().dataTable({
      "aaSorting": [[1, 'desc']],
      "bDestroy": true,
      "bAutoWidth": true,
      "bFilter": false,
      "bScrollAutoCss": true,
      "sPaginationType": "bootstrap",
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns,
      "sScrollY": "200px",
      "bScrollCollapse": true,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData);
      }
    });
    if(!self.resizeBound){
      $(window).bind('resize', function(){
        self.logTable.fnAdjustColumnSizing();
      });
      self.resizeBound = true;
    }
    if (data.aaData.length === 0) {
      // Adjust colspan based on visible columns for new colspan
      var visible_columns = $('.dataTable:visible th:visible').length;
      var no_data_td = $('.dataTable:visible tbody td');
      no_data_td.attr('colspan', visible_columns);
      no_data_td.text(Lang.no_logs);
      $('#debug_logging_text').val('No log files available.');
    } else {
      $('.dataTable:visible td:first').trigger('click');
    }
  },

  rowRender: function(nRow, aData){
    var self = this;
    self.renderDate(nRow, aData);
    $(nRow).find('td:not(.controls, .dataTables_empty)').css('cursor', 'pointer').unbind().bind('click', function(){
      self.refreshLog(aData[0]);
      $('.dataTable:visible tr.info').removeClass('info').addClass($(this).data('oriCls'));
      var rowCls = $(nRow).attr('class');
      $(nRow).data('orCls', rowCls).removeClass(rowCls).addClass('info');
    });
    $('.delete_log', nRow).unbind().bind('click', function(){
      self.deleteLog(nRow, aData);
    });
  },

  renderDate: function(row, data){
    var dateStr = data[1];
    try{
      var date = new Date(dateStr);
      dateStr = date.getFullYear() + "-" + this.parseNumber(date.getMonth()) + "-" + this.parseNumber(date.getDate()) + " " + this.parseNumber(date.getHours()) + ":" + this.parseNumber(date.getMinutes()) + ":" + this.parseNumber(date.getSeconds());
    } catch(e){
      console.log("Failed to render date for " + dateStr);
      dateStr = 'N/A';
    }
    $('td:eq(1)', row).html(dateStr);
  },

  parseNumber: function(num){
    if(num.toString().length === 1){
      return "0" + num.toString();
    }
    return num;
  },

  showLogging: function () {
    console.log('showLogging');
    $('#debug_logging_text').val('loading...');

    // Cannot currently clear log files for node apps
    //  /deletelog endpoint not in fh-proxy yet
    if ($fw.client.tab.apps.manageapps.isNodeJsApp()) {
      $('#debug_logging_clear_button').hide();
    } else {
      $('#debug_logging_clear_button').show();
    }

    //this.refreshLog();
  },
  
  refreshLog: function (logname) {
    var self = this;
    $('#debug_logging_text').val('loading...');
    var instGuid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');

    this.model.log.read(function(res){
      if ("ok" === res.status) {
        self.currentLogFile = logname;
        var logText = '';
        for (var log in res.log) {
          if(log !== "name"){
            logText += '====> ' + log + ' START <====\n' + res.log[log] + '====> ' + log + ' END <====\n';
          }
        }
        if (logText.length < 1) {
          logText = 'n/a';
        }
        $('#debug_logging_text').val('').val(logText);
      } else {
        $('#debug_logging_text').val('Error loading Cloud App Logs. Is your App Staged for this environment?');
      }
    }, function(error){
      $('#debug_logging_text').val('Error loading Cloud App Logs. Is your App Staged for this environment?');
    }, instGuid, cloudEnv, logname);
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
  },

  deleteLog: function(row, data){
    var self = this;
    var logname = data[0];
    self.showBooleanModal("Are you sure you want to delete this log file (" + logname + ")?", function(){
      var instGuid = $fw.data.get('inst').guid;
      var cloudEnv = $fw.data.get('cloud_environment');
      self.model.log["delete"](function(res){
        self.showAlert('success', '<strong> Log file deleted (' + logname + ')');
        if(logname === self.currentLogFile){
          //the current log file being displayed is deleted, we will find the closest available log file and show it
          var nextRow = $(row).next();
          if(nextRow.length === 0){
            nextRow = $(row).prev();
          }
          self.logTable.fnDeleteRow(row);
          nextRow.find('td:first').trigger('click');
        } else {
          //another log file other than the current log file is deleted, make sure the current file is still selected
          var currentRow = $('.dataTable:visible tr.info');
          self.logTable.fnDeleteRow(row);
          if(currentRow && currentRow.length > 0){
            currentRow.find('td:first').trigger('click');
          }
        }
      }, function(err){
        self.showAlert('error', '<strong> Failed to delete log file (' + logname + ') ' + err);
      }, instGuid, cloudEnv, logname);
    });
  }

});