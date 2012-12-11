var Apps = Apps || {};

Apps.Endpoints = Apps.Endpoints || {};

var APP_ENDPOINTS_HTTPS = "https";
var APP_ENDPOINTS_APP_API_KEY = "appapikey";
var APP_ENDPOINTS_HTTPS_DISPLAY = "HTTPS";
var APP_ENDPOINTS_APP_API_KEY_DISPLAY = "App Api Key";

Apps.Endpoints.Controller = Apps.Cloud.Controller.extend({

  models: {
    secure_endpoints: new model.SecureEndpoints()
  },

  alert_timeout: 3000,

  views: {
    endpoints_container: "#endpoints_container"
  },

  filterFields :{
    events : "select#endpointsAuditLogEvents",
    endpoints : "select#endpointsAuditLogEndpoints",
    security : "select#endpointsAuditLogSecurity",
    users : "select#endpointsAuditLogUsers",
    logLimit: "select#endpointsAuditLogLimit"
  },

  optionTemplate : function (type, args){
    var val = args.val;
    if (typeof val === 'string'){
      val = args.val.replace(' ', '_');  
    }
    if(type === "option"){
        return "<option value="+val+">"+args.text+"</option>";
    }
  },  

  container: null,
  endpoints_table: null, 
  audit_log_table: null, 
  appSecureEndpoints: null, 

  // type: error|success|info
  showAlert: function(type, message, id) {
    var self = this;
    var alerts_area = $('#endpoints-alerts');
    var alert = $('<div>').addClass('alert fade in alert-' + type).html(message);
    var close_button = $('<button>').addClass('close').attr("data-dismiss", "alert").text("x");
    alert.append(close_button);
    
    if(id) alert.attr("id", id);
    alerts_area.append(alert);
    // only automatically hide alert if it's not an error
    if ('error' !== type && 'info' !== type) {
      setTimeout(function() {
        alert.slideUp(function() {
          alert.remove();
        });
      }, self.alert_timeout);
    }
  },

 showNoEndpointAlert: function(type, message) {
    var self = this;
    var alerts_area = $('#endpoint_override_alerts');
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

  show: function(options){
    var self = this;
    self._super(self.views.endpoints_container);
    self.initFn();

    if (options && options.hideAlerts === false){
      // don't hide the alerts.. 
    }else {
      this.hideAlerts();      
    }

    var guid = $fw.data.get('inst').guid;
    // TODO - this is sometimes undefined, need to investigate why!
    var cloudEnv = $fw.data.get('cloud_environment') || 'dev';
    
    // load millicore data in parallel
    self.showAlert('info', '<strong>Loading Secure Endpoints data.. </strong> ', "showLoadingInfoAlert");
    async.parallel([function(cb){
      self.models.secure_endpoints.readSecureEndpoints(guid, cloudEnv, function(res){
        return cb(null, res);        
      }, function(e) {
        return cb(e);
      });
    }, function(cb){
      self.models.secure_endpoints.readAuditLog(guid, cloudEnv, null, function(res){
        return cb(null, res);        
      }, function(e) {
        return cb(e);
      });
    }, function(cb){
      self.models.secure_endpoints.readAppEndpoints(guid, cloudEnv, function(res){
        return cb(null, res);        
      }, function(e) {
        return cb(e);
      });
    }], function(err, results){
      $('#showLoadingInfoAlert').slideUp(function() { 
        $('#showLoadingInfoAlert').remove();
      });
      if (err) return self.showAlert('error', err);
      var secure_endpoints_res = results[0];
      var audit_log_res = results[1];
      var app_endpoints_res = results[2];

      self.appSecureEndpoints = secure_endpoints_res; 
      self.renderEndpointOverrides(secure_endpoints_res, app_endpoints_res);
      self.renderAuditLog(audit_log_res);

      self.bind();
      $(self.container).show();
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
      var type = $('#app_endpoints_select').val()[0];
      var override = { security: APP_ENDPOINTS_HTTPS};
      if(self.appSecureEndpoints.overrides && self.appSecureEndpoints.overrides[type]) {
        override = self.appSecureEndpoints.overrides[type];
      }

      // uncheck old values
      $('#app_endpoint_override_app_api_key_option').prop('checked', false);
      $('#app_endpoint_override_https_option').prop('checked', false);

      // set new values
      if (override.security === APP_ENDPOINTS_HTTPS) {
        $('#app_endpoint_override_app_api_key_option').prop('checked', false);
        $('#app_endpoint_override_https_option').prop('checked', true);               
      }else {
        $('#app_endpoint_override_app_api_key_option').prop('checked', true);
        $('#app_endpoint_override_https_option').prop('checked', false);               
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
        self.renderAuditLog(audit_log_res);
      }, function(err) {
        self.showAlert('error', err);
      }, true); 
    });

    // add the delete override button
    $('tr td .delete_override').unbind().click(function() {
      var row = $(this).parent().parent();
      var data = self.endpoints_table.fnGetData($(this).parent().parent().get(0));
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
      self.showAlert('info', '<strong>Deleting Endpoint Override:</strong> ' + endpoint);
      self.models.secure_endpoints.removeEndpointOverride(guid, cloudEnv, endpoint, function(res) {
        self.hideAlerts();
        self.showAlert('success', '<strong>Endpoint Override Successfully Deleted:</strong> ' + endpoint);
        self.endpoints_table.fnDeleteRow(row[0]);
        self.show({hideAlerts: false}); 
      }, function(e) {
        self.hideAlerts();
        self.showAlert('error', '<strong>Error Deleting Endpoint Override</strong> (' + endpoint + ') ' + e);
      });
    });
  },

  doFilter : function (){
     var self = this;
     var guid = $fw.data.get('inst').guid;
     var cloudEnv = $fw.data.get('cloud_environment');
     var event = $(self.filterFields.events).val();
     var endpoint = $(self.filterFields.endpoints).val();
     var security = $(self.filterFields.security).val();
     var user = $(self.filterFields.users).val();
     var limit = $(self.filterFields.logLimit).val();
     var filter = {};

     if(event && event !=="all") {
       filter.event = event.replace('_', ' ');
     }
     if(endpoint && endpoint !=="all") filter.endpoint = endpoint;
     if(security && security !=="all") filter.security = security;
     if(user && user !== "all") filter.user = user;
     if(limit && limit !== "all") filter.limit = limit;     
     var isFilter = filter.event || filter.endpoint || filter.security || filter.user || filter.limit || false;

     self.models.secure_endpoints.readAuditLog(guid, cloudEnv, filter, function(audit_log_res) {       
       self.renderAuditLog(audit_log_res, {isFilter : isFilter});
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
    self.showAlert('info', '<strong>Setting Default App Security..</strong> ');    
    this.models.secure_endpoints.setDefaultSecureEndpoint(guid, cloudEnv, def, function(res) {
      self.hideAlerts();
      self.showAlert('success', "Default App Security updated successfully");
    }, function(err) {
      self.hideAlerts();
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
    self.showAlert('info', '<strong>Setting Endpoint Override..</strong> ');      
    this.models.secure_endpoints.setEndpointOverride(guid, cloudEnv, endpoints, val, function(res) {
      self.hideAlerts();
      self.showAlert('success', "Endpoint Override set successfully");
      self.show({hideAlerts: false}); 
    }, function(err) {
      self.hideAlerts();
      self.showAlert('error', err);
    }, true);
  },

  // render endpoint override parts of the view
  renderEndpointOverrides: function(secure_endpoints_res, app_endpoints_res) {
    var self = this;

    // Default App security radio buttons
    if(secure_endpoints_res["default"] === APP_ENDPOINTS_HTTPS) {
      $('#app_security_https_option').prop('checked', true);
      $('#app_security_app_api_key_option').prop('checked', false);
    }else {
      $('#app_security_app_api_key_option').prop('checked', true);
      $('#app_security_https_option').prop('checked', false);
    }

    // populate the list of app endpoints, empty out old ones and clear check boxes
    $('#app_endpoints_select').empty();
    $('#app_endpoint_override_app_api_key_option').prop('checked', false);
    $('#app_endpoint_override_https_option').prop('checked', false);

    if (app_endpoints_res.endpoints) {          
      for (var i=0; i<app_endpoints_res.endpoints.length; i++) {
        var endpoint = app_endpoints_res.endpoints[i];
        var opt = '<option value="' + endpoint + '">' + endpoint + "</option>"; 
        $('#app_endpoints_select').append(opt);
      }
    }else {
      self.showAlert("error", "No Endpoints found, please re-stage App.");
    }

    // populate the endpoint overrides table.. 
    var cols = [{"sTitle": "Endpoint"}, {"sTitle": "Security"}, {"sTitle": "Updated By"}, {"sTitle" : "Date"}, {"sTitle" : "Controls", bSortable: false, sClass: "controls"}];
    var rows = [];

    // transform millicore data into table format.. 
    // TODO - need to show warning for when endpoint missing
    for (var j in secure_endpoints_res.overrides) {
      var override = secure_endpoints_res.overrides[j];
      var btn = '<button class="btn btn-danger delete_override">Delete</button>';
      var security = override.security === APP_ENDPOINTS_HTTPS ? APP_ENDPOINTS_HTTPS_DISPLAY :
                                                                 APP_ENDPOINTS_APP_API_KEY_DISPLAY;
      rows.push([j, security, override.updatedBy, override.updatedWhen, btn]);
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

    // show red table row for any missing endpoints
    var tr = this.endpoints_table.fnGetNodes();
    for (var k=0; k<tr.length; k++) {
      var ep = $(tr[k].cells[0]).text();
      if (app_endpoints_res.endpoints.indexOf(ep) === -1) $(tr[k]).addClass("endpoint_error");
    }

    // show the error alerts for any missing endpoints
    var errors = [];
    for (var over_ride in secure_endpoints_res.overrides) {
      if (app_endpoints_res.endpoints.indexOf(over_ride) === -1) errors.push(over_ride);
    }
    
    if (errors.length !== 0) {
      if(errors.length === 1) this.showNoEndpointAlert("error", "Missing Endpoint: " + errors[0]);
      else this.showNoEndpointAlert("error", "Missing Endpoints: " + errors.join(' '));
    }
  },

  // helper function to get an array of field values for all auditlog entries
  getFieldsFromAuditLog: function(audit_log_res, field) {
    var fields = [];
    for (var i=0; i<audit_log_res.list.length; i++) {
      var entry = audit_log_res.list[i];
      if (fields.indexOf(entry[field]) === -1) fields.push(entry[field]);
    }
    return fields;
  },

  // render our AuditLog
  renderAuditLog: function(audit_log_res, options) {
    var self = this;
    var guid = $fw.data.get('inst').guid;
    var cloudEnv = $fw.data.get('cloud_environment');

    // populate the endpoint overrides table.. 
    var cols = [{"sTitle": "Event"}, {"sTitle": "Endpoint"}, {"sTitle": "Security"}, {"sTitle": "Updated By"}, {"sTitle" : "Updated When"}];
    var rows = [];

    // transform millicore data into table format.. 
    var i = 0;
    for (i=0; i<audit_log_res.list.length; i++) {
      var entry = audit_log_res.list[i];
      var security = entry.security === APP_ENDPOINTS_HTTPS ? APP_ENDPOINTS_HTTPS_DISPLAY :
                                        APP_ENDPOINTS_APP_API_KEY_DISPLAY;

      rows.push([entry.event, entry.endpoint, security, entry.updatedBy, entry.updatedWhen]);
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

    this.auditlog_table.fnSort([[4,'desc']]);

    if (options && options.isFilter && options.isFilter !== false) {
      // if we're displaying filtered data, don't re-render the filters as we loose all the fields
      console.log("Not rendering filters");
    } else {
      // render the filters
      var limits = [10,100,1000];
      $('.selectfixedWidth').css("width","200px");
      $(this.filterFields.logLimit + ' option:not(:first)').remove();
      for(i=0; i<limits.length; i++){
        $(self.filterFields.logLimit).append(self.optionTemplate("option",{val:limits[i], text:limits[i]}));
      }
  
      var events = self.getFieldsFromAuditLog(audit_log_res, 'event');
      $(this.filterFields.events + ' option:not(:first)').remove();
      for(i=0; i< events.length; i++){
        $(self.filterFields.events).append(self.optionTemplate("option",{val:events[i], text:events[i]}));
      }
  
      var endpoints = self.getFieldsFromAuditLog(audit_log_res, 'endpoint');
      $(this.filterFields.endpoints + ' option:not(:first)').remove();
      for(i=0; i< endpoints.length; i++){
        if (endpoints[i] !== "") $(self.filterFields.endpoints).append(self.optionTemplate("option",{val:endpoints[i], text:endpoints[i]}));
      }
  
      var securities = self.getFieldsFromAuditLog(audit_log_res, 'security');
      $(this.filterFields.security + ' option:not(:first)').remove();
      for(i=0; i< securities.length; i++){
        var txt = securities[i] === APP_ENDPOINTS_HTTPS ? APP_ENDPOINTS_HTTPS_DISPLAY :
                                    APP_ENDPOINTS_APP_API_KEY_DISPLAY;

        if (securities[i] !== "") $(self.filterFields.security).append(self.optionTemplate("option",{val:securities[i], text:txt}));
      }
  
      var users = self.getFieldsFromAuditLog(audit_log_res, 'updatedBy');
      $(this.filterFields.users + ' option:not(:first)').remove();
      for(i=0; i< users.length; i++){
        $(self.filterFields.users).append(self.optionTemplate("option",{val:users[i], text:users[i]}));
      }
    }
  }
});