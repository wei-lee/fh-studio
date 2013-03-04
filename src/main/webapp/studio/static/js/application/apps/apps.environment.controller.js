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

  subviews: {
    all : ".subview.row-fluid",

    list: '.env_var_list',

    edit: ".env_var_edit",
    edit_name: "input.env_var.name",
    edit_value: "input.env_var.value",
    edit_guid: "input.env_var.guid"

  },
  env: null,
  guid: null,

  $container: null,
  $sub_container: null,
  $env_table: [],

  init: function() {
    this._super(this.views.environment_container);
    this.$container = $(this.views.environment_container);
    this.$devlive = $(this.devlive, this.$container);

    this.subviews.$list = $(this.subviews.list, this.$container);
    this.subviews.$edit = $(this.subviews.edit, this.$container);
    this.subviews.$edit_name = $(this.subviews.edit_name,this.subviews.$edit);
    this.subviews.$edit_value = $(this.subviews.edit_value,this.subviews.$edit);
    this.subviews.$edit_guid = $(this.subviews.edit_guid,this.subviews.$edit);

    this.$subviews = $(this.subviews.all, this.$container);

    this.controls = $(".row-controls" , this.$container).html();

    // use with zip to get object later
    this.names = _.collect(this.models.environment.field_config, function(v){return v.field_name;});
    this.initFn = _.once(this.initBindings);
    this.initFn();

  },

  initBindings: function() {
    _.bindAll(this);
    this.populateTable("dev", {aaData: [],aoColumns:this.models.environment.field_config});

    this.subviews.$edit.hide();
    this.$devlive.hide();
    this.subviews.$list.show();
  },

  show: function() {
    this._super(this.views.environment_container);

    this.initFn();
    this.env = $fw.data.get('cloud_environment');
    this.app = $fw.data.get('inst').guid;

    return this.showEnvironment();
  },
  // type: error|success|info
  showAlert: function (alert) {
    var type = alert.type;
    var message = alert.msg;
    var to = alert.timeout || this.alert_timeout || 5000;

    var $alerts_area = this.$container.find('.alerts');
    var $alert = $('<div>').addClass('alert fade in alert-' + type).html(message);
    var $close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    $alert.append($close_button);
    $alerts_area.append($alert);

    // only automatically hide alert if it's not an error
    if ('error' !== type) {
      setTimeout(function() {
        $alert.slideUp(function () {
          $alert.remove();
        });
      }, to);
    }
  },

  handleError: function(alert) {
    this.resetButtons($("button", this.$container));
    this.showAlert(alert);
  },

  showEnvironment: function(alert) {
    if(alert) {
      this.showAlert(alert);
    }
    this.$container.show();
    this.$subviews.hide();
    this.subviews.$list.show();


    // create a partial function
    var bindTableForEnv = _.bind(this.bindTable,this, this.env);
    var handleGetEnvError = _.bind(this.handleError,this, {type:"error", msg:"Unexpected Error getting '" + this.env + "' env list"});
    this.models.environment.list(this.app, this.env, bindTableForEnv, handleGetEnvError, true);
  },

  addControls: function(res) {
    // Add control column
    res.aoColumns.push({
      sTitle: "Controls",
      "bSortable": false,
      "sClass": "controls"
    });

    var controls = this.controls;
    $.each(res.aaData, function(i, row) {row.push(controls);});
    return res;
  },


  populateTable: function(env,data){//} aaData, aoColumns) {
    this.$env_table = $('#env_vars_table', this.$container);
    this.$env_table.dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData ,
      "aoColumns": data.aoColumns // model.field_config
    });

    // Inject Import and Create button
    var create_button = $('<button>').addClass('btn btn-primary pull-right').text('Create').click(this.showCreateEnv);
    $('.span12:first', this.$container).append(create_button);
    this.bindControls();
  },

  bindTable: function(env, res) {
    var data = this.addControls(res);
    this.populateTable(env,data)
  },

  handleEdit: function(e) {
    var row = $(this).parent().parent();
    var data = this.dataForRow($(e.target).closest('tr').get(0));
    this.showEnvVarUpdate(e, row, data);
    return false;
  } ,

  handleDelete: function(e) {
    var controls = $(e.target).parent().find("button");
    controls.button('loading');

    var data = this.dataForRow($(e.target).closest('tr').get(0));
    this.deleteEnvVar(e, _.object(this.names, data));
    return false;
  } ,

  disableButtons: function(buttons) {
    buttons.button('loading');
  } ,

  resetButtons: function(buttons) {
    buttons.button('reset');
  } ,

  bindControls: function() {
    $('tr td .edit_env_var, tr td:not(.controls,.dataTables_empty)', this.views.environment_container).unbind().click(this.handleEdit);
    $('tr td .delete_env_var', this.views.users).unbind().click(this.handleDelete);
  } ,

  dataForRow: function(el) {
    return this.$env_table.fnGetData(el);
  },

  handleCreate: function(e){
    this.disableButtons($(e.target).parent().find("button"));
    var name = this.subviews.$edit_name.val();
    var value = this.subviews.$edit_value.val();

    var handleError = _.bind(this.handleError,this, {type:"error", msg:"Unexpected Error creating '" + name + "'"});
    var handleSuccess = _.bind(this.showEnvironment,this, {type:"success",msg: "'" + name + "' created" });

    this.models.environment.create(this.app , this.env , name, value,  handleSuccess, handleError);
    return false;
  },

  handleUpdate: function(){
    var id = this.subviews.$edit_guid.val();
    var name = this.subviews.$edit_name.val();
    var value = this.subviews.$edit_value.val();

    var handleError = _.bind(this.handleError,this, {type:"error", msg:"Unexpected Error updating '" + name + "'"});
    var handleSuccess = _.bind(this.showEnvironment,this, {type:"success",msg: "'" + name + "' updated"});
    this.models.environment.update(this.app , id, name, value,  handleSuccess, handleError);
    return false;
  },

  handleCancel: function(){
    this.showEnvironment({type:"warn", msg: 'action cancelled'});
    return false;
  },

  bindButtons: function(saveOrUpdate,label) {
    var $save = $('.save_env_var_btn', this.subviews.$edit);
    $save.unbind().click(saveOrUpdate).text(label);
    $('.cancel_env_var_btn', this.subviews.$edit).unbind().click(this.handleCancel);
  },

  showCreateEnv: function(e) {
    this.populateEnvVar(e, null, this.handleCreate, "Create");
  },

  showEnvVarUpdate: function(e, row, data) {
    var o  = _.object(this.names, data)
    var handleUpdate= _.bind(this.handleUpdate , this, o);
    this.populateEnvVar(e, _.object(this.names, data), handleUpdate, "Update");

  },

  populateEnvVar: function(e, o, handler, lable) {
    var buttons = $("button", this.subviews.$edit);
    this.resetButtons(buttons);

    this.$subviews.hide();
    this.subviews.$edit.show();

    var $action =  $(".crud_action",this.subviews.$edit);
    this.bindButtons(handler,lable);
    $action.text(lable.toLowerCase());

    this.subviews.$edit_name.val(o ? o.name : "");
    this.subviews.$edit_value.val(o ? o.value : "");
    this.subviews.$edit_guid.val(o ? o.guid : "");
  },

  deleteEnvVar: function(button, o) {
    if(o) {
      var handleError = _.bind(this.handleError,this, {type:"error", msg:"Unexpected Error deleting '" + o.name + "'"});
      var handleSuccess = _.bind(this.showEnvironment,this, {type:"success",msg: "'" + o.name + "' successfully deleted"});
      this.models.environment.remove(this.app ,o.guid,  handleSuccess, handleError)
    }
    return false;
  }

});
