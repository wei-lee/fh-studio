var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.View = Cloudenvironments.View || {};

Cloudenvironments.View.AppsResourcesView = Backbone.View.extend({

  initialize: function(){
    this.$el.html(new App.View.Spinner().render().el);
    this.temp = Handlebars.compile($('#cloudenvironments-apps-resource-view-template').html());
    if(this.model.has("apps")){
      this.render();
    } 
    this.model.once("sync", function(){
      this.render();
    }, this);
    this.model.startPooling();
  },

  render: function(){
    var self = this;
    if(this.model.has("apps")){
      if(!this.tableView){
        this.tableView = new App.View.DataTable({
          aaData : self.model.get("apps"),
          "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
            // Append guid data
            $(nTr).attr('data-guid', sData.guid);
          },
          aoColumns: [{
            "sTitle": "Title",
            "mDataProp": "title"
          }, {
            "sTitle": "Type",
            "mDataProp": "type",
          }, {
            "sTitle": "Guid",
            "mDataProp": "guid"
          }, {
            "sTitle": "Status",
            "mDataProp": "status",
          }, {
            "sTitle": "Memory",
            "mDataProp": "memory"
          }, {
            "sTitle": "CPU",
            "mDataProp": "cpu"
          }, {
            "sTitle": "Disk",
            "mDataProp": "disk"
          }, {
            "sTitle": "Last Deployed",
            "mDataProp": "lastDeployed"
          }, {
            "sTitle": "Last Accessed",
            "mDataProp": "lastAccessed"
          }],
          "bAutoWidth": false,
          "sPaginationType": 'bootstrap',
          "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
          "bLengthChange": false,
          "iDisplayLength": 5,
          "bInfo": true
        });
        this.$el.html(self.temp());
        this.$el.find('.apps_resource_list_view').html(this.tableView.render().el);
      }
    }
  }
});