var Apps = Apps || {};

Apps.Endpoints = Apps.Endpoints || {};

var APP_ENDPOINTS_HTTPS = "https";
var APP_ENDPOINTS_APP_API_KEY = "appapikey";

Apps.Endpoints.Controller = Apps.Cloud.Controller.extend({

  models: {
    secure_endpoints: new model.SecureEndpoints()
  },

  alert_timeout: 3000,

  views: {
    endpoints_container: "#endpoints_container"
  },

  filterFields :{
    endpoints : "select#endpointsAuditLogEndpoints",
    security : "select#endpointsAuditlogSecurity",
    users : "select#endpointsAuditlogUsers",
    logLimit: "select#auditlogLimit"
  },

  optionTemplate : function (type, args){
    if(type === "option"){
        return "<option value="+args.val+">"+args.text+"</option>";
    }
  },  

  container: null,
  endpoints_table: null, // TODO - this need to be held as a variable?
  audit_log_table: null, // TODO - ditto
  appSecureEndpoints: null, // TODO - revisit, may be a better way of doing this.. 

  // type: error|success|info
  showAlert: function(type, message) {
    var self = this;
    var alerts_area = $(this.views.endpoints_container).find('.alerts');
    var alert = $('<div>').addClass('alert fade in alert-' + type).html(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    alerts_area.append(alert);
    // only automatically hide alert if it's not an error
    if ('error' !== type) {
      setTimeout(function() {
        alert.slideUp(function() {
          alert.remove();
        });
      }, self.alert_timeout);
    }
  },

  init: function () {
    this._super();
    this.initFn = _.once(this.initBindings);
  },
  
  initBindings: function () {
    var self = this;
    var container = $(this.views.endpoints_container);

    // TODO - sort out language stuff..
    $fw.client.lang.insertLangForContainer(container);    
  },

  show: function(){
    this.hideAlerts();
    var self = this;
    var guid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');
    
    
    self.models.secure_endpoints.readSecureEndpoints(guid, cloudEnv, function(secure_endpoints_res) {
      self.appSecureEndpoints = secure_endpoints_res; 

      if(secure_endpoints_res["default"] === APP_ENDPOINTS_HTTPS) {
        $('#app_security_https_option').prop('checked', true);
        $('#app_security_app_api_key_option').prop('checked', false);
      }else {
        $('#app_security_app_api_key_option').prop('checked', true);
        $('#app_security_https_option').prop('checked', false);
      }

      // TODO - find out which tab selected and only render one tab..
      self.models.secure_endpoints.readAuditLog(guid, cloudEnv, null, function(audit_log_res) {
        self.renderEndpointsTable(secure_endpoints_res);
        self.renderAuditLogTable(audit_log_res);
        self.bind();
        self._super(self.views.endpoints_container);
        self.initFn();
        $(self.container).show();
      });
    }, function() {
      self.showAlert('error', "Error loading App Secure Endpoints");
    });
  },

  bind: function() {
    var self = this;
    $('#update_app_security_btn').unbind().click(function(e) {
      self.setDefaultSecureEndpoint();
      return false;
    });

    $('#update_endpoint_override_btn').attr("disabled", true);
    $('#update_endpoint_override_btn').unbind().click(function(e) {
      self.setEndpointOverride();
      return false;
    });

    $('#app_endpoints_select').unbind().change(function(e) {
      var type = $('#app_endpoints_select').val();
      var override = self.appSecureEndpoints.overrides[type];

      $('#app_endpoint_override_app_api_key_option').prop('checked', false);
      $('#app_endpoint_override_https_option').prop('checked', false);

      // uncheck old values
      if (override) {
        if (override.security === APP_ENDPOINTS_HTTPS) {
          $('#app_endpoint_override_app_api_key_option').prop('checked', false);
          $('#app_endpoint_override_https_option').prop('checked', true);               
        }else {
          $('#app_endpoint_override_app_api_key_option').prop('checked', true);
          $('#app_endpoint_override_https_option').prop('checked', false);               
        }
      }

      // enable the update button
      $('#update_endpoint_override_btn').attr("disabled", false);

    });

    // bind filter button
    var filterButton = $('button#endpoints_audit_log_filter');
    // TODO filterButton.text($fw.client.lang.getLangString("endpoints_audit_log_filter"));
    filterButton.unbind().click(function(e){
      return self.doFilter();
    });

    // reset button..
    var resetButton = $('button#endpoints_audit_log_reset');
    // TODO resetButton.text($fw.client.lang.getLangString("endpoints_audit_log_reset"));
    resetButton.unbind().bind("click",function (e){
      e.preventDefault();
      $.each(self.filterFields, function(name, target){
        $(target).val($(target + " option:first").val());
      });
      var guid = $fw.data.get('inst').guid;
      var cloudEnv = $fw.data.get('cloud_environment');
      self.models.secure_endpoints.readAuditLog(guid, cloudEnv, null, function(audit_log_res) {
        self.renderAuditLogTable(audit_log_res);
      }, function(err) {
        self.showAlert('error', err);
      }, true); 
    });

    // delete override button
    $('tr td .delete_override').unbind().click(function() {
      var row = $(this).parent().parent();
      var data = endpoints_table.fnGetData($(this).parent().parent().get(0));
      self.deleteOverride(this, row, data);
      return false;
    });
  },

  deleteOverride: function(button, row, data) {
    var self = this;
    self.showBooleanModal('Are you sure you want to delete this Endpoint Override?', function () {
      var endpoint = data[0];
      var guid = $fw.data.get('inst').guid;
      var cloudEnv = $fw.data.get('cloud_environment');
      self.showAlert('info', '<strong>Deleting Endpoint</strong> (' + endpoint + ')');
      self.models.secure_endpoints.removeEndpointOverride(guid, cloudEnv, endpoint, function(res) {
        self.showAlert('success', '<strong>Endpoint Override Successfully Deleted</strong> (' + endpoint + ')');
        endpoints_table.fnDeleteRow(row[0]);
        self.show(); // TODO - bit OTT to do a full show() here..
      }, function(e) {
        self.showAlert('error', '<strong>Error Deleting Endpoint Override</strong> (' + endpoint + ') ' + e);
      });
    });
  },

  doFilter : function (){
     var self = this;
     var guid = $fw.data.get('inst').guid;
     var cloudEnv = $fw.data.get('cloud_environment');
     var endpoints = $(self.filterFields.endpoints).val();
     var security = $(self.filterFields.security).val();
     var users = $(self.filterFields.users).val();
     var limit = $(self.filterFields.logLimit).val();
     var params = {
     };
     if(endpoints && endpoints !=="all") params.endpoints = endpoints;
     if(security && security !=="all")params.security = security;
     if(users && users !== "all") params.users = users;
     
     // TODO - how to filter limit??
     self.models.secure_endpoints.readAuditLog(guid, cloudEnv, params, function(audit_log_res) {
       self.renderAuditLogTable(audit_log_res);
     }, function(err) {
       self.showAlert('error', err);
     }, true);
      
     return false;
  },

  setDefaultSecureEndpoint: function() {
    var self = this;
    var guid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');
    var isHttp = $('#app_security_https_option').is(':checked');
    var def = isHttp ? APP_ENDPOINTS_HTTPS : APP_ENDPOINTS_APP_API_KEY;
    
    this.models.secure_endpoints.setDefaultSecureEndpoint(guid, cloudEnv, def, function(res) {
      self.showAlert('success', "App Security updated successfully");
    }, function(err) {
      self.showAlert('error', err);
    }, true);
  },

  setEndpointOverride: function() {
    var self = this;
    var guid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');
    var isHttp = $('#app_endpoint_override_https_option').is(':checked');
    var val = isHttp ? APP_ENDPOINTS_HTTPS : APP_ENDPOINTS_APP_API_KEY;
    var endpoints = $('#app_endpoints_select').val();
    this.models.secure_endpoints.setEndpointOverride(guid, cloudEnv, endpoints, val, function(res) {
      self.showAlert('success', "Security Endpoints set successfully");
      self.show(); // TODO - bit OTT to do a full show() here..
    }, function(err) {
      self.showAlert('error', err);
    }, true);
  },

  renderEndpointsTable: function(secure_endpoints_res) {
    var self = this;
    var guid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');

    // TODO - this may flicker on refresh, maybe best move the appEndpoints outside this
    self.models.secure_endpoints.readAppEndpoints(guid, cloudEnv, function(app_endpoints_res) {
      // populate the list of endpoints 
      $('#app_endpoints_select').empty();
      for (var i=0; i<app_endpoints_res.endpoints.length; i++) {
        var endpoint = app_endpoints_res.endpoints[i];
        var opt = '<option value="' + endpoint + '">' + endpoint + "</option>"; 
        $('#app_endpoints_select').append(opt);
      }

      // populate the endpoint overrides table.. 
      // TODO - need to add 'delete' button
      var cols = [{"sTitle": "Endpoint"}, {"sTitle": "Security"}, {"sTitle": "Updated By"}, {"sTitle" : "Date"}, {"sTitle" : "Controls", bSortable: false, sClass: "controls"}];
      var rows = [];

      // transform millicore data into table format.. 
      // TODO - need to show warning for when endpoint missing
      for (var i in secure_endpoints_res.overrides) {
        var override = secure_endpoints_res.overrides[i];
        var btn = '<button class="btn btn-danger delete_override">Delete</button>';
        rows.push([i, override.security, override.updatedBy, override.date, btn]);
      }

      this.endpoints_table = $('#endpoints_endpoints_table').dataTable({
        "bDestroy": true,
        "bAutoWidth": false,
        "bFilter" : false,
        "bPaginate": false,
        "sDom": "",
        "sPaginationType": "bootstrap",
        "bLengthChange": false,
        "aaData": rows,
        "aoColumns": cols
      });
    }, function() {
      self.showAlert('error', "Error loading App Endpoints");
    });
  },

  // helper function to get an array of field values for all auditlog entries
  getFieldsFromAuditLog: function(audit_log_res, field) {
    var fields = [];
    for (var i=0; i<audit_log_res.auditlog.length; i++) {
      var entry = audit_log_res.auditlog[i];
      if (fields.indexOf(entry[field]) === -1) fields.push(entry[field]);
    }
    return fields;
  },

  renderAuditLogTable: function(audit_log_res) {
    var self = this;
    var guid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');

    // populate the endpoint overrides table.. 
    var cols = [{"sTitle": "Endpoint"}, {"sTitle": "Security"}, {"sTitle": "Updated By"}, {"sTitle" : "Date"}];
    var rows = [];

    // transform millicore data into table format.. 
    for (var i=0; i<audit_log_res.auditlog.length; i++) {
      var entry = audit_log_res.auditlog[i];
      rows.push([entry.endpoint, entry.security, entry.updatedBy, entry.date]);
    }

    this.auditlog_table = $('#endpoints_audit_logs_list_table').dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "bFilter" : false,
      "bPaginate": false,
      "sDom": "",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": rows,
      "aoColumns": cols
    });

    // render the filters
    var limits = [10,100,1000];
    $('.selectfixedWidth').css("width","200px");
    $(this.filterFields.logLimit + ' option:not(:first)').remove();
    for(var i=0; i<limits.length; i++){
       $(self.filterFields.logLimit).append(self.optionTemplate("option",{val:limits[i], text:limits[i]}));
    }

    var endpoints = self.getFieldsFromAuditLog(audit_log_res, 'endpoint');
    $(this.filterFields.endpoints + ' option:not(:first)').remove();
    for(var i=0; i< endpoints.length; i++){
       $(self.filterFields.endpoints).append(self.optionTemplate("option",{val:endpoints[i], text:endpoints[i]}));
    }

    var securities = self.getFieldsFromAuditLog(audit_log_res, 'security');
    $(this.filterFields.security + ' option:not(:first)').remove();
    for(var i=0; i< securities.length; i++){
       $(self.filterFields.security).append(self.optionTemplate("option",{val:securities[i], text:securities[i]}));
    }

    var users = self.getFieldsFromAuditLog(audit_log_res, 'updatedBy');
    $(this.filterFields.users + ' option:not(:first)').remove();
    for(var i=0; i< users.length; i++){
       $(self.filterFields.users).append(self.optionTemplate("option",{val:users[i], text:users[i]}));
    }

  }
});