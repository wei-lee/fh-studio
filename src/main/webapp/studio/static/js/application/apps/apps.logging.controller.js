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

  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
    var self = this;
    self.activeStdoutLog = null;
    self.activeStderrLog = null;
    self.streamRecords = {};
    self.LOG_INTERVAL = 2000;
    self.openedFiles = {};
  },

  /*
   * Initialise any UI components required for logging.
   * Once-off initialisation
   */
  initBindings: function() {
    var self = this;
    var container = $(this.views.debug_logging_container);

    $fw.client.lang.insertLangForContainer(container);
    $('#log_archive_accordion').on("hide", function() {
      $(this).find("i.icon-chevron-down").removeClass('icon-chevron-down').addClass('icon-chevron-right');
    }).on('show', function() {
      $(this).find("i.icon-chevron-right").removeClass('icon-chevron-right').addClass('icon-chevron-down');
    });
  },

  show: function() {
    var self = this;
    this._super(this.views.debug_logging_container);
    this.initFn();
    $('#log_loading').show();
    $('#debug_logging_list').hide();
    $('#log_contents_form').addClass('hidden');
    self.streamRecords = {};
    self.openedFiles = {};
    if ($fw.client.tab.apps.manageapps.isNodeJsApp()) {
      this.pingCloud(this.currentEnv(), function(res) {
        self.showLogging();
        self.loadLogList(true);
      }, function(res) {
        self.showLogging();
        self.loadLogList(false);
      });
    } else {
      self.showLogging();
      self.loadLog("Log.txt", "Log.txt", true, false, false, null, true);
    }
    $(this.container).show();
  },

  loadLogList: function(is_running) {
    $(this.container).find('#debug_logging_list').hide();
    if ($fw.client.tab.apps.manageapps.isNodeJsApp()) {
      var self = this;
      var instGuid = $fw.data.get('inst').guid;
      var cloudEnv = $fw.data.get('cloud_environment');
      this.model.log.list(function(res) {
        $(self.container).find('#debug_logging_list').show();
        if (is_running && res.aaData.length > 0) {
          self.activeStderrLog = res.aaData[0][0].indexOf("stdout") === -1 ? res.aaData[0] : res.aaData[1];
          self.activeStdoutLog = res.aaData[1][0].indexOf("stderr") === -1 ? res.aaData[1] : res.aaData[0];
          //remove the current active logs
          //res.aaData = res.aaData.slice(2);
        }
        var data = self.addControls(res);
        self.renderLogList($(self.container).find('#debug_logging_list_table'), data, is_running);
      }, function(error) {
        console.log("Failed to get log list. Error: " + error);
        $('#log_contents_form').removeClass("hidden");
        self.loadLog("Stdout.log", "Stdout.log", true, true, false, "Error loading Cloud App Stdout Logs. Is your App Staged for this environment?");
        self.loadLog("Stderr.log", "Stderr.log", false, true, false, "Error loading Cloud App Stderr Logs. Is your App Staged for this environment?");
      }, true, instGuid, cloudEnv);
    } else {
      $(this.container).find('#debug_logging_list').hide();
      this.refreshLog();
    }
  },

  addControls: function(res) {
    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls",
      "sWidth": "160px"
    });

    $.each(res.aaData, function(i, row) {
      var controls = [];
      var button = '<button class="btn btn-info download_log">Download</button> <button class="btn btn-danger delete_log">Delete</button>';

      if (i < 2) {
        // Current logs - don't allow deletion
        button = '<button class="btn btn-info download_log">Download</button>';
      }

      controls.push(button);
      row.push(controls.join(""));
    });
    return res;
  },

  renderLogList: function(tableContainer, data, is_running) {
    var self = this;
    this.logTable = $(tableContainer).show().dataTable({
      "iDisplayLength": 5,
      "aaSorting": [[1, 'desc']],
      "bDestroy": true,
      "bAutoWidth": true,
      "bFilter": false,
      "sPaginationType": "bootstrap",
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData);
      }
    });
    if (!self.resizeBound) {
      $(window).bind('resize', function() {
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
    }

    $('#debug_logging_list').show();

    if (is_running) {
      self.loadLog(self.activeStdoutLog[0], self.activeStdoutLog[0], true, true);
      self.loadLog(self.activeStderrLog[0], self.activeStderrLog[0], false, true);
    } else {
      $('#log_contents_form').removeClass("hidden");
      self.loadLog("Stdout.log", "Stdout.log", true, true, false, "App is not running, no live logs available.");
      self.loadLog("Stderr.log", "Stderr.log", false, true, false, "App is not running, no live logs available.");
    }

  },

  rowRender: function(nRow, aData) {
    var self = this;
    self.renderDate(nRow, aData);
    $(nRow).find('td:not(.controls, .dataTables_empty)').css('cursor', 'pointer').unbind().bind('click', function() {
      self.loadLog(aData[0], aData[0], true, false, true);
      $('.dataTable:visible tr.info').removeClass('info').addClass($(this).data('oriCls'));
      var rowCls = $(nRow).attr('class');
      $(nRow).data('orCls', rowCls).removeClass(rowCls).addClass('info');
    });
    $('.delete_log', nRow).unbind().bind('click', function() {
      self.deleteLog(nRow, aData);
    });
    $('.download_log', nRow).unbind().bind('click', function() {
      self.downloadLog(nRow, aData);
    });
  },

  renderDate: function(row, data) {
    var dateStr = data[1];
    try {
      if (dateStr !== "") {
        var date = new Date(dateStr);
        dateStr = date.getFullYear() + "-" + this.parseNumber(date.getMonth() + 1) + "-" + this.parseNumber(date.getDate()) + " " + this.parseNumber(date.getHours()) + ":" + this.parseNumber(date.getMinutes()) + ":" + this.parseNumber(date.getSeconds());
      } else {
        dateStr = "N/A";
      }
    } catch (e) {
      console.log("Failed to render date for " + dateStr);
      dateStr = 'N/A';
    }
    $('td:eq(1)', row).html(dateStr);
  },

  parseNumber: function(num) {
    if (num.toString().length === 1) {
      return "0" + num.toString();
    }
    return num;
  },

  showLogging: function() {
    console.log('showLogging');
    $('#log_loading').hide();
    $('#debug_logging_clear_button').hide();
    $('#debug_logging_tabs').empty();
    $('#debug_logging_contents').empty();
  },

  loadLog: function(tabname, logfile, active, streamable, removable, error, legacy_mode) {
    console.log(logfile);
    var self = this;
    var validname = logfile.replace(/\./g, "_");
    var instGuid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');
    if (self.openedFiles[validname]) {
      return $(self.openedFiles[validname]).find("a").trigger("click");
    }
    var tab_id = validname + "_tab";
    var li = $('<li>', {
      id: tab_id
    });
    self.openedFiles[validname] = "#" + tab_id;
    li.append($('<a>', {
      href: '#' + validname + "_pane",
      text: tabname
    }));
    if (removable) {
      var icon = $('<i>', {
        "class": 'icon-remove'
      });
      li.find('a').append(icon);
      icon.click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var next = li.next();
        if (next.length === 0) {
          next = li.prev();
        }
        li.remove();
        tabPane.remove();
        next.find("a").trigger("click");
      });
    }
    $('#debug_logging_tabs').append(li);
    var tabPane = $('.tab-pane-template').find('.tab-pane').clone();
    tabPane.attr("id", validname + '_pane');
    $('#debug_logging_contents').append(tabPane);
    if (active) {
      $('#debug_logging_tabs li.active').removeClass("active");
      $('#debug_logging_contents .tab-pane.active').removeClass("active");
      li.addClass("active");
      tabPane.addClass("active");
    }
    li.find('a').click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).tab('show');
      var targetPane = $(this).attr("href");
      self.scrollToBottom($(targetPane));
    });
    if (error) {
      tabPane.find('.debug_logging_text').html(error);
      tabPane.find(".log_controls").remove();
    } else {
      if (legacy_mode) {
        return self.loadRhinoLog(tabPane, instGuid, cloudEnv, logfile);
      } else {
        var default_lines = 1000;
        self.loadLogChunk(default_lines, tabPane, instGuid, cloudEnv, logfile);
      }
    }
    if (streamable) {
      tabPane.find('.log_stream_check').show().change(function() {
        if ($(this).is(":checked")) {
          var lastLines = tabPane.find('.log_lines').val();
          var isValidNumber = self.checkLineNumbers(lastLines);
          if (isValidNumber) {
            self.streamLog(instGuid, cloudEnv, logfile, lastLines, tabPane);
            tabPane.find('#debug_logging_refresh_button').addClass("disabled");
          }
        } else {
          self.stopStreamLog(logfile, tabPane);
          tabPane.find('#debug_logging_refresh_button').removeClass("disabled");
        }
      });
    } else {
      tabPane.find(".stream_conf").remove();
    }
    tabPane.find("#debug_logging_refresh_button").click(function(e) {
      e.preventDefault();
      e.stopPropagation();
      var lastLines = tabPane.find('.log_lines').val();
      var isValidNumber = self.checkLineNumbers(lastLines);
      if (isValidNumber) {
        self.loadLogChunk(lastLines, tabPane, instGuid, cloudEnv, logfile);
      }
    });
  },

  loadLogChunk: function(lines, tabPane, instGuid, cloudEnv, logfile) {
    var self = this;
    this.model.log.chunk(lines, -1, function(res) {
      $('#log_contents_form').removeClass("hidden");
      if (res.status === "ok") {
        tabPane.find('.debug_logging_text').html('').html(res.msg.data.join("<p>").replace(/\\n/g, "\n"));
        self.scrollToBottom(tabPane);
      } else {
        tabPane.find('.debug_logging_text').html('Error loading Cloud App Logs. Is your App Staged for this environment?');
      }
    }, function(error) {
      tabPane.find('.debug_logging_text').html('').html('Error loading Cloud App Logs. Is your App Staged for this environment?');
    }, instGuid, cloudEnv, logfile);
  },

  checkLineNumbers: function(lines) {
    var isValidNumber = true;
    try {
      lines = parseInt(lines, 10);
    } catch (e) {
      isValidNumber = false;
      self.showAlert('error', "Please enter an integer for the number of lines");
    }
    return isValidNumber;
  },

  scrollToBottom: function(tabPane) {
    tabPane.find('.debug_logging_text').scrollTop(tabPane.find('.debug_logging_text')[0].scrollHeight);
  },

  streamLog: function(instGuid, cloudEnv, logfile, lastLines, tabPane) {
    var self = this;
    self.streamRecords[logfile] = true;
    self.model.log.chunk(lastLines, -1, function(res) {
      if (res.status === "ok") {
        tabPane.find('.debug_logging_text').html(res.msg.data.join("<p>").replace(/\\n/g, "\n"));
        var spinner = $('.hidden_template.loading_icon', ".tab-pane-template").find('img').clone();
        spinner.addClass('log_loading_spinner').css('display', 'block');
        tabPane.find('.debug_logging_text').append(spinner);
        self.scrollToBottom(tabPane);
        var offset = res.msg.offset;
        self.loadLogOffset(instGuid, cloudEnv, logfile, offset, tabPane);
      }
    }, function(error) {

    }, instGuid, cloudEnv, logfile);
  },

  loadLogOffset: function(instGuid, cloudEnv, logfile, offset, tabPane) {
    var self = this;
    self.model.log.chunk(-1, offset, function(res) {
      if (res.status === "ok") {
        offset = res.msg.offset;
        if (res.msg.data.length > 0) {
          var offsetLogs = res.msg.data.join("\n").replace(/\\n/g, '\n');
          tabPane.find('.debug_logging_text').find('.log_loading_spinner').before("\n" + offsetLogs);
          self.scrollToBottom(tabPane);
        }
        //make sure logs is currently used
        if ($("#debug_logging_container").css("display") !== "block") {
          self.streamRecords = {};
        }
        if (self.streamRecords[logfile]) {
          setTimeout(function() {
            self.loadLogOffset(instGuid, cloudEnv, logfile, offset, tabPane);
          }, self.LOG_INTERVAL);
        }
      }
    }, function(err) {

    }, instGuid, cloudEnv, logfile);
  },

  stopStreamLog: function(logfile, tabPane) {
    var self = this;
    self.streamRecords[logfile] = undefined;
    tabPane.find('.log_loading_spinner').remove();
    self.scrollToBottom(tabPane);
  },

  deleteLog: function(row, data) {
    var self = this;
    var logname = data[0];
    self.showBooleanModal("Are you sure you want to delete this log file (" + logname + ")?", function() {
      var instGuid = $fw.data.get('inst').guid;
      var cloudEnv = $fw.data.get('cloud_environment');
      self.model.log["delete"](function(res) {
        self.showAlert('success', '<strong> Log file deleted (' + logname + ')');
        if (logname === self.currentLogFile) {
          //the current log file being displayed is deleted, we will find the closest available log file and show it
          var nextRow = $(row).next();
          if (nextRow.length === 0) {
            nextRow = $(row).prev();
          }
          self.logTable.fnDeleteRow(row);
          nextRow.find('td:first').trigger('click');
        } else {
          //another log file other than the current log file is deleted, make sure the current file is still selected
          var currentRow = $('.dataTable:visible tr.info');
          self.logTable.fnDeleteRow(row);
          if (currentRow && currentRow.length > 0) {
            currentRow.find('td:first').trigger('click');
          }
        }
      }, function(err) {
        self.showAlert('error', '<strong> Failed to delete log file (' + logname + '):' + err);
      }, instGuid, cloudEnv, logname);
    });
  },

  downloadLog: function(row, data) {
    var self = this;
    var logname = data[0];
    var instGuid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');
    var url = Constants.LOGSTREAM_URL + "?guid=" + instGuid + "&deploytarget=" + cloudEnv + "&action=download&logname=" + logname;
    document.location = url;
  },

  loadRhinoLog: function(tabPane, instGuid, cloudEnv, logfile) {
    var self = this;
    $('#log_contents_form').removeClass("hidden");
    tabPane.find(".stream_opts").hide();
    tabPane.find("#debug_logging_clear_button").show();
    var readLog = function(tabPane, instGuid, cloudEnv) {
      self.model.log.read(function(res) {
        tabPane.find('.debug_logging_text').html("====> fhlog START <====\n" + res.log.fhlog + "====> fhlog END <====");
      }, function(err) {
        tabPane.find('.debug_logging_text').html("Failed to load log messages.");
      }, instGuid, cloudEnv);
    };
    readLog(tabPane, instGuid, cloudEnv);
    tabPane.find('#debug_logging_refresh_button').unbind().bind("click", function() {
      readLog(tabPane, instGuid, cloudEnv);
    });
    tabPane.find('#debug_logging_clear_button').unbind().bind("click", function() {
      var url = Constants.LOGS_URL;
      var params = {
        "guid": instGuid,
        "action": "delete"
      };

      $fw.server.post(url, params, function(res) {
        if ('ok' === res.status) {
          tabPane.find('.debug_logging_text').html('');
        } else {
          $fw.client.dialog.error("Error clearing logs: " + res.error);
        }
      }, function(error) {
        $fw.client.dialog.error($fw.client.lang.getLangString('clear_log_error'));
      }, true);
    });
  }
});