var Apps = Apps || {};

Apps.Plugins = Apps.Plugins || {};

Apps.Plugins.Controller = Apps.Cloud.Controller.extend({

  model: {
    //device: new model.Device()
    log: new model.CloudLog()
  },

  views: {
    cloudplugins_container: "#cloudplugins_container"
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
    var container = $(this.views.cloudplugins_container);

  },

  show: function(){
    var self = this;
    this._super(this.views.cloudplugins_container);
    this.initFn();
    self.loadPluginList();
    $(this.container).show();
  },

  loadPluginList: function(){
    var self = this;
    var instGuid = $fw.data.get('inst').guid;

    // TODO: Call out to the model this.model.plugins.list()
    var data = {
      plugins: [
        {
          name: 'Plugin Name',
          desc: 'Plugin Desc'
        }
      ]
    }
  },
  renderPluginList: function(tableContainer, data, is_running){
    var self = this;
    this.pluginTable = $(tableContainer).show().dataTable({
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
        self.pluginTable.fnAdjustColumnSizing();
      });
      self.resizeBound = true;
    }
    if (data.aaData.length === 0) {
      // Adjust colspan based on visible columns for new colspan
      var visible_columns = $('.dataTable:visible th:visible').length;
      var no_data_td = $('.dataTable:visible tbody td');
      no_data_td.attr('colspan', visible_columns);
      no_data_td.text(Lang.no_logs);
      $('#debug_logging_text').val('No plugins are configured.');
    }

  },

  rowRender: function(nRow, aData){
  }
});