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

  container: null,
  endpoints_table: null, // TODO - this need to be held as a variable?
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
  
  /*
   * Initialise any UI components required for logging.
   * Once-off initialisation
   */
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
      // TODO - ok to hold state here???
      self.appSecureEndpoints = secure_endpoints_res; 

      if(secure_endpoints_res["default"] === APP_ENDPOINTS_HTTPS) {
        $('#app_security_https_option').prop('checked', true);
        $('#app_security_app_api_key_option').prop('checked', false);
      }else {
        $('#app_security_app_api_key_option').prop('checked', true);
        $('#app_security_https_option').prop('checked', false);
      }

      self.bind();
      self.renderEndpointsTable(secure_endpoints_res);
      self._super(self.views.endpoints_container);
      self.initFn();
      $(self.container).show();
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
      self.renderEndpointsTable(res);
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
      var cols = [{"sTitle": "Endpoint"}, {"sTitle": "Security"}, {"sTitle": "Updated By"}, {"sTitle" : "Date"}];
      var rows = [];

      // transform millicore data into table format.. 
      // TODO - need to show warning for when endpoint missing
      for (var i in secure_endpoints_res.overrides) {
        var override = secure_endpoints_res.overrides[i];
        rows.push([i, override.security, override.updatedBy, override.date]);
      }

      this.endpoints_table = $('#endpoints_endpoints_table').dataTable({
        "bDestroy": true,
        "bAutoWidth": false,
        "bFilter" : false,
        "bPaginate": false,
        //"sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
        "sDom": "",
        "sPaginationType": "bootstrap",
        "bLengthChange": false,
        //"aaData": data.aaData,
        "aaData": rows,
        "aoColumns": cols
      });
    }, function() {
      self.showAlert('error', "Error loading App Endpoints");
    });
  }
});