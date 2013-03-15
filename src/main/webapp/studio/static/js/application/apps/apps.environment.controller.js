var Apps = Apps || {};

Apps.Environment = Apps.Environment || {};

Apps.Environment.Controller = Apps.Cloud.Controller.extend({

  models: {
    environment: new model.Environment()
  },

  views: {
    environment_container: "#environment_container",
    devlive: '.environment_devlive_container'
  },

  templates: {
    controls :".row-controls",
    confirmAction:".confirm-action",
    confirmActionMultiple:".confirm-action-multiple",
    confirmPush:".confirm-push",
    alert:".alert",
    actionWait:".create-wait-msg",
    actionError:".create-error-msg",
    actionComplete:".create-complete-msg",
    cancelled:".cancelled-msg",
    editModal:".env-var-edit-edit-modal-template",
    buttonBar:".button-bar-template"

  },
  subviews: {
    all : ".subview.row-fluid",

    list: '.env_var_list',

    edit: ".env_var_edit",
    edit_name: "input.env_var.name",
    edit_dev_value: "input.dev_env_var.value",
    edit_live_value: "input.live_env_var.value",
    edit_guid: "input.env_var.guid",
    edit_dup : "input.env_var_dup",

    alerts_area: ".alerts",

    allLocks: ".lock",
    liveLock: ".live-lock.lock",
    loadingView: "#env_var_loading_view"
  },
//  var $save = $('.save_env_var_btn', this.subviews.$edit);
  controls :{
    save : '.save_env_var_btn',
    cancel : '.cancel_env_var_btn'
  },
  guid: null,

  $container: null,
  $sub_container: null,
  $current_env_table: null,
  $deployed_user_env_table: null,
  $sys_env_table: null,

  /**
   * init this object
   */
  init: function() {
    _.bindAll(this);

    this._super(this.views.environment_container);
    this.$container = $(this.views.environment_container);
    this.$devlive = $(this.devlive, this.$container);

    this.subviews.$list = $(this.subviews.list, this.$container);
    this.subviews.$edit = $(this.subviews.edit, this.$container);
    this.subviews.$edit_name = $(this.subviews.edit_name,this.subviews.$edit);
    this.subviews.$edit_live_value = $(this.subviews.edit_live_value,this.subviews.$edit);
    this.subviews.$edit_dev_value = $(this.subviews.edit_dev_value,this.subviews.$edit);
    this.subviews.$edit_guid = $(this.subviews.edit_guid,this.subviews.$edit);
    this.subviews.$edit_dup = $(this.subviews.edit_dup,this.subviews.$edit);
    this.subviews.$loading_view = $(this.subviews.loadingView, this.$container);

    this.subviews.$alerts_area = $(this.subviews.alerts_area, this.$container);
    this.subviews.$allLocks = $(this.subviews.allLocks, this.$container);
    this.subviews.$liveLock = $(this.subviews.liveLock, this.$container);

    this.$subviews = $(this.subviews.all, this.$container);

    this.controls.$save = $(this.controls.save, this.$container);
    this.controls.$cancel = $(this.controls.cancel, this.$container);

    this.templates.$controls       = this.compile(this.templates.controls);
    this.templates.$confirmAction  = this.compile(this.templates.confirmAction);
    this.templates.$confirmActionMultiple = this.compile(this.templates.confirmActionMultiple);
    this.templates.$confirmPush    = this.compile(this.templates.confirmPush);
    this.templates.$alert          = this.compile(this.templates.alert);
    this.templates.$actionWait     = this.compile(this.templates.actionWait);
    this.templates.$actionError    = this.compile(this.templates.actionError);
    this.templates.$actionComplete = this.compile(this.templates.actionComplete);
    this.templates.$cancelled      = this.compile(this.templates.cancelled);
    this.templates.$editModal      = this.compile(this.templates.editModal);
    this.templates.$buttonBar      = this.compile(this.templates.buttonBar);

    // use with zip to get object later
    this.names = _.collect(this.models.environment.field_config, function(v){return v.field_name;});

    this.$current_env_table = $('#current_env_vars_table', this.$container);
    this.$deployed_user_env_table = $('#deployed_user_env_vars_table', this.$container);
    this.$sys_env_table = $('#sys_env_vars_table', this.$container);
    this.clearPeriodicStatusCheck();

    this.subviews.$edit.hide();
    this.$devlive.hide();
    this.subviews.$list.show();

    this.subviews.$allLocks.click(this.toggleLock);
    $("[rel=popover]", this.$container).popover({template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><div class="popover-content"><p></p></div></div></div>'});


    this.$container.on("click" ,".add-env", this.showCreateEnv);
    this.$container.on("click" ,".unset-env", this.handleUnset);
    this.$container.on("click" ,".delete-env", this.handleDelete);
    this.$container.on("click" ,".push-env", this.handlePush);
  },

  switchedEnv: function(env) {
    this.env = env;
    if(this.subviews.$edit.is(":visible")) {
      var name = this.subviews.$edit_name.val();
      this.showEnvVar(name);
    } else {
      this.show();
    }
  },

  /**
   * compile a template
   * @param template the selector for the template
   * @return {*}
   */
  compile: function(template) {
    return _.template($(template, this.$container).html());
  },

  /**
   * get the app guid and show the env
   * @return {*}
   */
  show: function() {
    this.initCloudFn();
    this.app = $fw.data.get('inst').guid;
    this.subviews.$list.hide();
    this.subviews.$loading_view.show();
    return this.showEnvironment();
  },

  /**
   * show an alert
   * @param alert an object with the following fields :
   *        type :error|success|info
   *        msg : your message
   *        timeout : *optional* timeout value
   */
  showAlert: function (alert) {
    var type = '.alert-' + alert.type;
    var to = alert.timeout || this.alert_timeout || 5000;

    if ('.alert-error' === type) {
      $(type,this.subviews.$alerts_area).remove();
    }

    var $alert = $(this.templates.$alert(alert));
    this.subviews.$alerts_area.append($alert);

    // only automatically hide alert if it's not an error
    if ('.alert-error' !== type) {
        $alert.delay(to).slideUp('slow',_.bind($alert.remove,$alert));
    }
  },

  /**
   * handle an error
   * @param alert the alert to show
   * @param $buttons the buttons to reset, if null then reset all
   * @param msg the error message from the millicore, if this is an object then don't show it to end user
   * as it will probably be too technical
   */
  handleError: function(alert, $buttons, msg) {
    if($buttons){
      this.resetButtons($buttons ? $buttons : $("button", this.$container));
    }
    if(msg && _.isString(msg) && !msg.match(/^FHCore error/)) {
      alert.msg = alert.msg + " : <b>" + msg + "</b>";
    }
    this.showAlert(alert);
  },

  /**
   * show the environment, display the alert first if there is one
   * @param alert optional alert to display
   */
  showEnvironment: function(alert) {
    if(alert) {
      this.showAlert(alert);
    }
    var self = this;
    this.$container.show();

    // create a partial function
    var handleGetEnvError = _.bind(this.handleError,this, {type:"error", msg:"Unexpected Error getting environment list"} , null);

    var loadDeployedDev = _.bind(this.models.environment.listDeployed, this,this.app, "dev");
    var loadDeployedLive  = _.bind(this.models.environment.listDeployed, this,this.app, "live");
    var loadEnvList  = _.bind(this.models.environment.list, this,this.app);

    var bindCurrentTable = _.bind(this.bindCurrentTable, this);
    var bindDeployedTable  = _.bind(this.bindDeployedTable,this);
    var allEnvResults = {
      devDeployed: {envvars: {}},
      liveDeployed: {envvars: {}}
    };
    async.series([
      function(callback){
        loadDeployedDev(function success(res){
          allEnvResults.devDeployed = res;
          callback(null);
        },function(err){
          console.log("Error when listing dev deployed environment variables. Error: " + err);
          callback();
        });
      },
      function(callback){
        loadDeployedLive(function success(res){
          allEnvResults.liveDeployed = res;
          callback(null);
        },function(err){
          console.log("Error when listing live deployed environment variables. Error: " + err);
          callback();
        });
      },
      function(callback){
        loadEnvList(function success(res){
          allEnvResults.envList = res.list;
          callback(null);
        },function(err){
          console.log("Error when listing current environment variables. Error: " + err);
          callback();
        });
      }
    ],
    function(err, results){
      self.subviews.$loading_view.hide();
      self.subviews.$list.show();
      if(err) {
        console.log("err " + err);
      }

      var list = allEnvResults.envList;
      var currentEnvVarPair = {};
      _.each(list, function(el){
        currentEnvVarPair[el.fields.name] = {"devValue": el.fields.devValue, "liveValue": el.fields.liveValue};
      });
      var deployedEnvs = self.processDeployedEnvs(allEnvResults.devDeployed, allEnvResults.liveDeployed);
      bindDeployedTable.apply(null, [deployedEnvs.sysEnvs, deployedEnvs.userEnvs, currentEnvVarPair]);
      bindCurrentTable(list, deployedEnvs.userEnvs);
    });

  },

  /**
   * add controls to each table row
   * @param res the processed env var list
   * @return {*}
   */
  addControls: function(res) {
    var self = this;
    $("div").on("click", "input.toggle-all"  , function toggleAll(e){
      var $c = $(e.target);
      var $table = $c.closest('.dataTables_scroll');
      $(".row-control", $table).prop("checked" , $c.is(":checked") );
    });
    $("div").on("click", "input[type=checkbox]", function(e){
      var $c = $(e.target);
      var $table = $c.closest('.dataTables_scroll');
      if($table.find("input:checked").length > 0){
        $table.parent().find(".btn-toolbar").find(".btn.hidden").removeClass("hidden");
      } else {
        $table.parent().find(".btn-toolbar").find(".unset-env, .delete-env").addClass("hidden");
      }
    });
    res.aoColumns.unshift({
      sTitle: "<div><input type='checkbox' class='toggle-all'/></div>",
      "bSortable": false,
      "sClass": "controls",
      "sWidth": "2%"

    });

    var controls = this.templates.$controls();
    $.each(res.aaData, function(i, row) {row.unshift(controls);});
    return res;
  },


  /**
   * populate the jquery table with the data
   * @param data the data to show
   * @param $env_table the table to populate
   * @param $button_bar the button bar to add
   */
  populateTable: function(data, $env_table, $button_bar, comparison, allowEdit){
    var self = this;
    var cloudEnv = this.currentEnv();
    var sortCol = 0;
    _.each(data.aoColumns, function(el, index){
      if(el.sTitle == "Environment Variable"){
        sortCol = index;
      }
    });
    var sDom = "<'row-fluid'r>t<'row-fluid'>";
    if($button_bar){
      sDom = "<'row-fluid'<'span12'f>r>t<'row-fluid'>";
    }
    $env_table.dataTable({
      "aaSorting": [[sortCol, 'asc']],
      "bScrollAutoCss": true,
      "bScrollCollapse": true,
      "sScrollY": "250px",
      "bSortClasses": false,
      "bFilter": false,
      "bDestroy": true,
      "bAutoWidth": true,
      "sDom": sDom,
      "bLengthChange": false,
      "aaData": data.aaData ,
      "aoColumns": data.aoColumns,  // model.field_config,
      fnInitComplete : function(){
        if ( $env_table.length > 0 ) {
          $env_table.fnAdjustColumnSizing();
        }
      },
      fnRowCallback: function(nRow, aData, iDisplayIndex) {
        self.rowRender(nRow, aData, iDisplayIndex, comparison, cloudEnv);
      }
    });
    $(window).bind("resize", function(){
      //a hack to force dataTable to resize when sScrollY is enabled
      $(".dataTables_scrollHeadInner, .dataTables_scrollHeadInner, table", self.$container).css({ width: "100%"});
      $env_table.fnAdjustColumnSizing();
    });
    if($button_bar && $button_bar.length) {
      $('.span12:first', this.$container).html($button_bar).css("margin-bottom", "1em");
    }
    this.bindControls();
    if(allowEdit){
      self.enableInlineEdit($env_table, cloudEnv);
    }
  },

  enableInlineEdit: function(table, cloudEnv){
    var self = this;
    var editIndex = cloudEnv == "live"? 3: 2;
    table.find("tr").find('td:eq('+editIndex+')').editable(function(value, settings){
      var that = this;
      $(this).tooltip("hide");
      var row = $(this).parent();
      var envVarData = self.dataForRow(row[0]);
      var devValue = cloudEnv == "live" ? null: value;
      var liveValue = cloudEnv == "live" ? value: null;
      var oldValue = cloudEnv == "live" ? envVarData[3]: envVarData[2];
      var envName = envVarData[1];
      var handleError = _.bind(self.handleError,self, {type:"error", msg: self.templates.$actionError({env:{name: envName}, action : "Updating"})});
      var handleSuccess = _.bind(self.showEnvironment,self, {type:"success",msg: self.templates.$actionComplete({env:{name: envName}, action : "updated"})});
      self.models.environment.update(self.app, envVarData[envVarData.length-1], envVarData[1], devValue, liveValue, function(res){
        handleSuccess();
      }, function(err){
        $(that).text(oldValue);
        handleError();
      });
      return value;
    }, {
      "tooltip": ""
    });
    table.find("tr").find('td:eq('+editIndex+')').attr("data-toggle", "tooltip").attr("data-original-title", "Click to edit");
    table.find("tr").find('td:eq('+editIndex+')').tooltip();
  },

  rowRender: function(nRow, aData, dIndex, comparison, env){
    var nameIndex = 0;
    var isLive = env === "live";
    var valueIndex = isLive?2:1;
    if(aData[0].indexOf("<input") > -1){
      nameIndex = nameIndex + 1;
      valueIndex = valueIndex+1;
    }
    var name = aData[nameIndex];
    var compareValueKey = isLive?"liveValue":"devValue";

    var value = aData[valueIndex];
    var isDirty = false;
    if(comparison){
      if(typeof comparison[name] === "undefined" || comparison[name][compareValueKey] != value){
        isDirty = true;
      }
    }
    if(isDirty){
      $("td:eq("+valueIndex+")", nRow).addClass("dirty");
    } else {
      if(comparison){
        $("td:eq("+valueIndex+")", nRow).addClass("ok");
      }
    }
    var disabledIndex = isLive?valueIndex - 1 : valueIndex + 1;
    $("td:eq("+disabledIndex+")", nRow).addClass("disabled");
  },

  /**
   * process deployed dev and deployed live value and figure out the deployed user env vars
   * @param dev the dev deployed env
   * @param live the live deployed env
   * @return the current deployed user & sys vars
   */
   processDeployedEnvs: function(dev, live){
     var keys = _.keys(dev.envvars, live.envvars);
     _.union(_.keys(dev.envvars),_.keys(live.envvars));
     keys = _.uniq(keys);
     var sys= [];
     var user = [];
     _.each(keys, function(name){
      var lvalue = live.envvars[name];
      var dvalue = dev.envvars[name];
      var val = {name:name};
      if(lvalue){
        val.liveValue = lvalue.value;
        val.isSystemEnv = lvalue.isSystemEnv;
      }
      if(dvalue){
        val.devValue = dvalue.value;
        val.isSystemEnv = dvalue.isSystemEnv;
      }
      if(val.isSystemEnv) {
        sys.push(val);
      } else {
        user.push(val);
      }
    });
    return {sysEnvs: sys, userEnvs: user};
  },

  /**
   * bind the current table data
   * @param res the table data
   * @param liveUser the live user data
   */
  bindCurrentTable: function(res, liveUser) {
    res = this.models.environment.postProcessList({status:"ok", list: res}, this.models.environment, this.models.environment.recent_field_config);
    var data = this.addControls(res);
    var deployedUserVarPair = {};
    _.each(liveUser, function(el){
      deployedUserVarPair[el.name] = el;
    })
    this.populateTable(data, this.$current_env_table, this.templates.$buttonBar(), deployedUserVarPair, true);
  },


  /**
   * bind the deployed table
   * @param dev the dev deployed env
   * @param live the live deployed env
   * @return the current deployed user vars
   */
  bindDeployedTable: function(sys,user, currentUser) {
    var res = this.models.environment.postProcessList({status:"ok", list:sys}, this.models.environment, this.models.environment.recent_field_config);
    this.bindSysTable(res);

    res = this.models.environment.postProcessList({status:"ok", list:user}, this.models.environment, this.models.environment.recent_field_config);
    this.bindUserTable(res, currentUser);
  },

  /**
   * bind the deployed table
   * @param res the response
   */
  bindUserTable: function(res, currentUser) {
    this.populateTable(res, this.$deployed_user_env_table, undefined, currentUser);
  },

/**
   * bind the sys env var table
   * @param res the response
   */
  bindSysTable: function(res) {
    this.populateTable(res, this.$sys_env_table);
  },

  /**
   * handle a click event and display the equivalent row for edit
   * @param e the event (either a click on the row or the edit button)
   * @return {Boolean}
   */
  handleEdit: function(e) {
    var $row = $(e.target).closest('tr');
    var data = this.dataForRow($row.get(0));
    this.showEnvVarUpdate(e, $row, data);
    return false;
  } ,

  /**
   * handle a delete click event
   * @param e the event
   * @return {Boolean}
   */
  handleDelete: function(e) {
    e.preventDefault();
    var self = this;
    var $rows = this.getSelectedRows();
    if($rows.length == 0){
      this.showAlert({type:"error", msg:"No environment variables are selected"});
      return;
    }
    var envVarIds = [];
    _.each($rows, function(el){
      var data = self.dataForRow(el[0]);
      envVarIds.push(data[data.length - 1]);
    });

    var deleteEnvVar = _.bind(this.deleteEnvVar, this, e, envVarIds);

    this.showBooleanModal(this.templates.$confirmActionMultiple({action: "delete"}), deleteEnvVar);
    return false;
  } ,

  /**
   * handle an unset click event
   * @param e the event
   * @return {Boolean}
   */
  handleUnset: function(e) {
    e.preventDefault();
    var self = this;
    var $rows = this.getSelectedRows();
    if($rows.length == 0){
      this.showAlert({type:"error", msg:"No environment variables are selected"});
      return;
    }
    var envVarIds = [];
    _.each($rows, function(el){
      var data = self.dataForRow(el[0]);
      envVarIds.push(data[data.length - 1]);
    });

    var unsetEnvVar = _.bind(this.unsetEnvVar, this, e, envVarIds);

    this.showBooleanModal(this.templates.$confirmActionMultiple({action: "unset"}), unsetEnvVar);
    return false;
  },

  getSelectedRows: function(){
    var rows = [];
    var selected = $('#current_env_vars_table').find("tr > td > input:checked");
    _.each(selected, function(el){
      if(el){
        rows.push($(el).closest("tr"));
      }
    });
    return rows;
  },

  /**
   * disable the buttons while processing a request
   * @param buttons the buttons to disable
   */
  disableButtons: function(buttons) {
    if(buttons){
      buttons.button('loading');
    }
  } ,

  /**
   * reset the buttons after processing a request
   * @param buttons the buttons to reset
   */
  resetButtons: function(buttons) {
    if(buttons){
      buttons.button('reset');
    }
  } ,

  /**
   * bind table events (row click and button events)
   */
  bindControls: function() {
//    $('tr td .edit_env_var, tr td:not(.controls,.dataTables_empty)', this.views.environment_container).unbind().click(this.handleEdit);
//    $('tr td .delete_env_var', this.views.users).unbind().click(this.handleDelete);
  } ,

  /**
   * get the raw table data for a row
   * @param el the element to get the data for
   * @return {*}
   */
  dataForRow: function(el) {
    return this.$current_env_table.fnGetData(el);
  },

  /**
   * confirm create on live var, just do it for dev.
   * @param e the triggering event
   * @return {Boolean}
   */
  handleCreate: function(e){
    var createEnvVar = _.bind(this.createEnvVar, this, e);
    if(this.subviews.$liveLock.hasClass("icon-unlock")) {
      var name = this.subviews.$edit_name.val();
      this.showBooleanModal(this.templates.$confirmAction({action: "create", env:{name:name}}), createEnvVar);
    } else {
      createEnvVar();
    }
    return false;
  },

  /**
   * create a new variable, if not duplicating then the other (i.e. dev for live and vice versa)var will be set to ''.
   * @param $modal the dialog
   * @param e the triggering event
   * @return {Boolean}
   */
  createEnvVar: function($modal,e){
    var name = $(this.subviews.edit_name, $modal).val();
    if(name == ""){
      $modal.find(".control-group:first").addClass("error").find(".help-inline").show();
      $modal.find(".control-group:first").find("input").bind("keydown", function(){
        $(this).closest(".control-group.error").removeClass("error");
        $(this).next(".help-inline").hide();
      });
      return false;
    }
    var devValue = undefined;
    if($(this.subviews.edit_dev_value, $modal).hasClass("modified")){
      devValue = $(this.subviews.edit_dev_value, $modal).val();
    }
    
    var liveValue = undefined;
    if($(this.subviews.edit_live_value, $modal).hasClass("modified")){
      liveValue = $(this.subviews.edit_live_value, $modal).val();
    }
    
    var env = {name:name, devValue:devValue, liveValue:liveValue};
    this.showAlert({type:'info', msg: this.templates.$actionWait({env:env, action : "Creating"})});

    var handleError = _.bind(this.handleError,this, {type:"error", msg: this.templates.$actionError({env:env, action : "creating"})});
    var handleSuccess = _.bind(this.showEnvironment,this, {type:"success",msg: this.templates.$actionComplete({env:env, action : "created"})});

    this.models.environment.create(this.app , name, devValue,  liveValue,  handleSuccess, handleError);

    $modal.modal('hide');
    return false;
  },

  /**
   * ask the user to confirm update and do it if ok
   * @param o the original var value
   * @param e the click event
   * @return {Boolean}
   */
  handleUpdate: function(o ,e){
    var updateEnvVar = _.bind(this.updateEnvVar, this,o, e);
    if(this.subviews.$liveLock.hasClass("icon-unlock")) {
      this.showBooleanModal(this.templates.$confirmAction({action: "update", env:o}), updateEnvVar);
    } else {
      updateEnvVar();
    }
    return false;
  },

  /**
   * actually do the update
   * @param o the object
   * @param e the event
   * @return {Boolean}
   */
  updateEnvVar: function(o ,e){
    var $buttons = $(e.target).siblings("button").andSelf();
    this.disableButtons($buttons);

    var id = this.subviews.$edit_guid.val();
    var name = this.subviews.$edit_name.val();
    var liveValue = this.subviews.$edit_live_value.val();
    var devValue = this.subviews.$edit_dev_value.val();
    var guid = this.subviews.$edit_guid.val();
    var env = {name:name, guid:guid, devValue:devValue, liveValue:liveValue};

    this.showAlert({type:'info', msg: this.templates.$actionWait({env:env, action : "Updating"})});

    var handleError = _.bind(this.handleError,this, {type:"error", msg: this.templates.$actionError({env:env,action:"updating"})}, $buttons);
    var handleSuccess = _.bind(this.showEnvironment,this, {type:"success",msg: this.templates.$actionComplete({env:env,action:"updated"})});

    this.models.environment.update(this.app , id, name, devValue, liveValue,  handleSuccess, handleError);
    return false;
  },

  /**
   * handle an edit/create cancel event
   * @param env the var being process
   * @param action
   * @return {Boolean}
   */
  handleCancel: function(env,action){
    this.showEnvironment({type:"warn", msg: this.templates.$cancelled({env:env,action:action||"action"})});
    return false;
  },

  /**
   * bind the update/create button event handlers
   * @param saveOrUpdate the save handler function
   * @param env the original value of the env var
   * @param action textual description of the action (i.e. "Create" or "Update")
   */
  bindButtons: function(saveOrUpdate,env, action) {
    this.controls.$save.unbind().click(saveOrUpdate).text(action);
    // ugh bootstrap defers its button.reset so we have to as well
    var disable = _.bind(this.controls.$save.attr,this.controls.$save,'disabled', 'disabled');
    _.delay(disable,0);
    var handleCancel = _.bind(this.handleCancel,this, env, action);
    this.controls.$cancel.unbind().click(handleCancel);
  },

  /**
   * config the edit div for var creation and this populate and show it
   * @param e the original event
   * @param name the var name
   */
  showCreateEnv: function(e, name) {
    e.preventDefault();
    var $modal = $(this.templates.$editModal({env:{name : name}}));
    var createEnvVar = _.bind(this.createEnvVar, this, $modal);
    $('.btn-success', $modal).on('click', createEnvVar);
    $modal.find("i").popover();
    $modal.find("i.lock").bind("click", this.toggleLock);
    $modal.modal();
  },

  /**
   * config the edit div for updating an existing var and this populate and show it
   * @param e the original event
   * @param row the row clicked
   * @param data the row data
   */
  showEnvVarUpdate: function(e, row, data) {
    var o  = _.object(this.names, data);
    var handleUpdate= _.bind(this.handleUpdate , this, o);
    this.populateEnvVar(e, o, handleUpdate , "Update");

  },

  /**
   * toggle lock buttons on edit div and enable/disable inputs
   * @param e the originating event
   */
  toggleLock: function(e) {
    var $target = $(e.target);
    $target.toggleClass("icon-lock").toggleClass("icon-unlock");
    var $input = $target.prev("input");
    $input.addClass("modified");
    if ($input.attr('disabled')) {
      $input.removeAttr('disabled');
    } else  {
      $input.attr('disabled', 'disabled');
    }
    if(this.subviews.$edit_dev_value.attr('disabled') && this.subviews.$edit_live_value.attr('disabled')) {
      this.controls.$save.attr('disabled', 'disabled');
    } else {
      this.controls.$save.removeAttr('disabled');
    }
  },

  /**
   * setup the edit view.
   *
   * @param e the event
   * @param o the initial value of the env var
   * @param handler to save or update the value
   * @param action textual description , either Create or Update
   *
   * @see initBindings for where the lock/unlock function setup
   */
  populateEnvVar: function(e, o, handler, action) {
    this.resetButtons($("button", this.subviews.$edit));
    this.subviews.$edit_dup.attr({"checked" : false});

    this.$subviews.hide();
    this.subviews.$edit.show();

    this.subviews.$allLocks.addClass("icon-lock").removeClass("icon-unlock");
    this.subviews.$edit_dev_value.attr("disabled", "disabled").parents(".control-group");
    this.subviews.$edit_live_value.attr("disabled", "disabled").parents(".control-group");

    this.bindButtons(handler,o, action);

    this.subviews.$edit_name.val(o ? o.name : "");
    this.subviews.$edit_live_value.val(o ? o.liveValue : "");
    this.subviews.$edit_dev_value.val(o ? o.devValue  : "");
    this.subviews.$edit_guid.val(o ? o.guid : "");
  },

  /**
   * handle a push env click event
   * @param e the event
   * @return {Boolean}
   */
  handlePush: function(e) {
    e.preventDefault();
    var env = this.currentEnv();
    var pushEnv = _.bind(this.pushEnv, this, env,e);
    this.showBooleanModal(this.templates.$confirmPush({env: env}), pushEnv);
    return false;
  } ,

  /**
   * push the current env var
   * @param e the originating event
   * @param env the original data as an object
   * @return {Boolean}
   */
  pushEnv: function(env, e) {
    var $buttons = $(e.target).siblings("button").andSelf();
    this.disableButtons($buttons);

    var handleError = _.bind(this.handleError,this, {type:"error", msg:this.templates.$actionError({env:env,action:"Pushing"})},$buttons);
    var handleSuccess = _.bind(this.showEnvironment,this, {type:"success",msg: this.templates.$actionComplete({env:{name:env},action:"pushed"})});

    this.showAlert({type:'info',msg: this.templates.$actionWait({env:{name:env}, action : "Pushing"})});

    this.models.environment.push(this.app ,env,  handleSuccess, handleError);
    return false;
  },

  /**
   * delete the env var
   * @param e the originating event
   * @param $row the table row
   * @param data the raw data
   * @param env the original data as an object
   * @return {Boolean}
   */
  deleteEnvVar: function(e,data,env) {
    var $buttons = $(e.target).siblings("button").andSelf();
    this.disableButtons($buttons);

    var handleError = _.bind(this.handleError,this, {type:"error", msg:this.templates.$actionError({env:{name:"variables"},action:"Deleting"})},$buttons);
    var handleSuccess = _.bind(this.showEnvironment,this, {type:"success",msg: this.templates.$actionComplete({env:{name:"variables"},action:"deleted"})});

    this.showAlert({type:'info',msg: this.templates.$actionWait({env:{name:"variables"}, action : "Deleting"})});

    this.models.environment.remove(this.app, data, handleSuccess, handleError);
    return false;
  },

  unsetEnvVar: function(e, envVarIds){
    var $buttons = $(e.target).siblings("button").andSelf();
    this.disableButtons($buttons);
    var cloudEnv = this.currentEnv();
    var handleError = _.bind(this.handleError,this, {type:"error", msg:this.templates.$actionError({env:{name:"variables"},action:"Unsetting"})}, $buttons);
    var handleSuccess = _.bind(this.showEnvironment,this, {type:"success",msg: this.templates.$actionComplete({env:{name:"variables"},action:"unset"})});

    this.showAlert({type:'info',msg: this.templates.$actionWait({env:{name:""}, action : "Unsetting"})});
    this.models.environment.unset(this.app, cloudEnv, envVarIds,  handleSuccess, handleError);
    return false;

  },

  // TODO come back to this
  refreshSingleStatus: function(){}

});
