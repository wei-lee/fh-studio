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
    liveLock: ".live-lock.lock"

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

    this.subviews.$alerts_area = $(this.subviews.alerts_area, this.$container);
    this.subviews.$allLocks = $(this.subviews.allLocks, this.$container);
    this.subviews.$liveLock = $(this.subviews.liveLock, this.$container);

    this.$subviews = $(this.subviews.all, this.$container);

    this.controls.$save = $(this.controls.save, this.$container);
    this.controls.$cancel = $(this.controls.cancel, this.$container);

    this.templates.$controls       = this.compile(this.templates.controls);
    this.templates.$confirmAction  = this.compile(this.templates.confirmAction);
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
    this.resetButtons($buttons ? $buttons : $("button", this.$container));
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
    this.$container.show();
    this.$subviews.hide();
    this.subviews.$list.show();

    // create a partial function
    var handleGetEnvError = _.bind(this.handleError,this, {type:"error", msg:"Unexpected Error getting environment list"} , null);

    var loadDeployedDev = _.bind(this.models.environment.listDeployed, this,this.app, "dev");
    var loadDeployedLive  = _.bind(this.models.environment.listDeployed, this,this.app, "live");
    var loadEnvList  = _.bind(this.models.environment.list, this,this.app);

    var bindCurrentTable = _.bind(this.bindCurrentTable, this);
    var bindDeployedTable  = _.bind(this.bindDeployedTable,this);
    async.series([
      function(callback){
        loadDeployedDev(function success(res){callback(null,res);},callback);
      },
      function(callback){
        loadDeployedLive(function success(res){callback(null,res);},callback);
      },
      function(callback){
        loadEnvList(function success(res){
          callback(null,res);
        },callback,true);
      }
    ],
    function(err, results){
      if(err) {
        console.log("err " + err);
        return;
      }
      var list = results.pop();
      var liveUser = bindDeployedTable.apply(null,results);
      bindCurrentTable(list, liveUser);
    });

  },

  /**
   * add controls to each table row
   * @param res the processed env var list
   * @return {*}
   */
  addControls: function(res) {
    $("div").on("click", "input.toggle-all"  , function toggleAll(e){
      var $c = $(e.target);
      var $table = $c.closest('.dataTables_scroll');
      $(".row-control", $table).prop("checked" , $c.is(":checked") );
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
  populateTable: function(data, $env_table, $button_bar){
    $env_table.dataTable({
      "bScrollCollapse": true,
      "sScrollY": "100%",
      "sScrollYInner": "110%",
      "bScrollCollapse": true,
      "bSortClasses": false,
      "bScrollInfinite": true,
      "bFilter": false,
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData ,
      "aoColumns": data.aoColumns,  // model.field_config,
      fnInitComplete : function(){
        if ( $env_table.length > 0 ) {
          $env_table.fnAdjustColumnSizing();
        }
      }
    });
    if($button_bar && $button_bar.length) {
      $('.span12:first', this.$container).html($button_bar);//.css({padding:"0.5em"});
    }
    this.bindControls();
  },

  /**
   * bind the current table data
   * @param res the table data
   * @param liveUser the live user data
   */
  bindCurrentTable: function(res, liveUser) {
    var data = this.addControls(res);
    this.populateTable(data, this.$current_env_table, this.templates.$buttonBar());
  },


  /**
   * bind the deployed table
   * @param dev the dev deployed env
   * @param live the live deployed env
   * @return the current deployed user vars
   */
  bindDeployedTable: function(dev,live) {
    var keys = _.union(_.keys(dev.envvars),_.keys(dev.envvars));
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
    res = this.models.environment.postProcessList({status:"ok", list:sys}, this.models.environment, this.models.environment.recent_field_config);
    this.bindSysTable(res);

    res = this.models.environment.postProcessList({status:"ok", list:user}, this.models.environment, this.models.environment.recent_field_config);
    this.bindUserTable(res);
    return res;
  },

  /**
   * bind the deployed table
   * @param res the response
   */
  bindUserTable: function(res) {
    this.populateTable(res, this.$deployed_user_env_table);
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
    var $row = $(e.target).closest("tr");
    var data = this.dataForRow($row.get(0));
    var o =_.object(this.names, data);
    var deleteEnvVar = _.bind(this.deleteEnvVar, this, e,$row,data,o);

    this.showBooleanModal(this.templates.$confirmAction({action: "delete" , env:o}), deleteEnvVar);
    return false;
  } ,

  /**
   * handle an unset click event
   * @param e the event
   * @return {Boolean}
   */
  handleUnset: function(e) {
    var $row = $(e.target).closest("tr");
    var data = this.dataForRow($row.get(0));
    var o =_.object(this.names, data);
    var deleteEnvVar = _.bind(this.deleteEnvVar, this, e,$row,data,o);

    this.showBooleanModal(this.templates.$confirmAction({action: "unset" , env:o}), deleteEnvVar);
    return false;
  } ,

  /**
   * disable the buttons while processing a request
   * @param buttons the buttons to disable
   */
  disableButtons: function(buttons) {
    buttons.button('loading');
  } ,

  /**
   * reset the buttons after processing a request
   * @param buttons the buttons to reset
   */
  resetButtons: function(buttons) {
    buttons.button('reset');
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
    var devValue = $(this.subviews.edit_dev_value, $modal).val();
    var liveValue = $(this.subviews.edit_live_value, $modal).val();

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
    var $modal = $(this.templates.$editModal({env:{name : name}}));
    var createEnvVar = _.bind(this.createEnvVar, this, $modal);
    $('.btn-success', $modal).on('click', createEnvVar);
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
  deleteEnvVar: function(e, $row,data,env) {
    var $buttons = $(e.target).siblings("button").andSelf();
    this.disableButtons($buttons);

    var handleError = _.bind(this.handleError,this, {type:"error", msg:this.templates.$actionError({env:env,action:"Deleting"})},$buttons);
    var handleSuccess = _.bind(this.showEnvironment,this, {type:"success",msg: this.templates.$actionComplete({env:env,action:"deleted"})});

    this.showAlert({type:'info',msg: this.templates.$actionWait({env:env, action : "Deleting"})});

    this.models.environment.remove(this.app ,env.guid,  handleSuccess, handleError);
    return false;
  },

  // TODO come back to this
  refreshSingleStatus: function(){}

});
