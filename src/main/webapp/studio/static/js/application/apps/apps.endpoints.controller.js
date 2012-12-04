var Apps = Apps || {};

Apps.Endpoints = Apps.Endpoints || {};

Apps.Endpoints.Controller = Apps.Cloud.Controller.extend({

  model: {

  },

  views: {
    endpoints_container: "#endpoints_container"
  },

  container: null,
  endpoints_table: null,

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

    $fw.client.lang.insertLangForContainer(container);    
  },

  show: function(){
    this._super(this.views.endpoints_container);
    
    this.initFn();
    this.renderEndpointsTable();

    $(this.container).show();
  },
  
  renderEndpointsTable: function(data) {
    var self = this;
    data = {"aaData": [["getConfig", "HTTPS", "dberesford@feedhenry.com", "5/12/20012 12:01:56"], ["login", "App Api Key", "mmurphy@feedhenry.com", "4/12/2012 10:10:23"]],
         "aoColumns": [ {"sTitle": "Endpoint"}, {"sTitle": "Security"}, {"sTitle": "Updated By"}, {"sTitle" : "Date"}]};

    this.endpoints_table = $('#endpoints_endpoints_table').dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "bFilter" : false,
      "bPaginate": false,
      //"sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "sDom": "",
      "sPaginationType": "bootstrap",
      "bLengthChange": false,
      "aaData": data.aaData,
      "aoColumns": data.aoColumns
    });
  }
});