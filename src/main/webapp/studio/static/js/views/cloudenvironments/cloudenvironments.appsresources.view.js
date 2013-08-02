var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.View = Cloudenvironments.View || {};

Cloudenvironments.View.AppsResourcesView = Backbone.View.extend({

  events: {
    'click table tbody tr': 'showAppResourceDetails'
  },

  initialize: function(){
    this.$el.html(new App.View.Spinner().render().el);
    this.temp = Handlebars.compile($('#cloudenvironments-apps-resource-view-template').html());
    this.collection = this.model.getResourceCollection();
    if(this.collection.length === 0){
      this.model.startPooling();
      this.collection.once("add", function(){
        this.render();
      }, this);
    } else {
      this.render();
    }
  },

  render: function(){
    this.$el.html(this.temp());
    var tableView = new Cloudenvironments.View.AppsResourceTableView({
      model: this.model,
      resource: "all",
      el: this.$el.find('.apps_resource_list_view')[0]
    });
    tableView.render();
  },

  showAppResourceDetails: function(e){
    e.preventDefault();
    var guid = $(e.currentTarget).closest('tr').data('guid');
    var detailsView = new Cloudenvironments.View.AppResourceDetailsView({
      model: this.model,
      appGuid: guid,
      el: this.$el.find('.apps_resource_details_view')[0]
    });
    this.$el.find('.apps_resource_child_view').hide();
    this.$el.find('.apps_resource_details_view').show();
    detailsView.render();
  }
});

Cloudenvironments.View.AppResourceDetailsView = Backbone.View.extend({
  events: {
    "button.startButton":"startApp",
    "button.restartButton":"restartApp",
    "button.suspendButton":"suspendApp",
    "button.stopButton":"stopApp",
    "button.undeployButton":"undeployApp"
  },

  initialize: function(options){
    this.appGuid = options.appGuid + "";
    this.temp = Handlebars.compile($('#cloudenvironments-per-app-resource-view-template').html());
    var appResources = this.model.getAppResources();
    for(var i=0;i<appResources.length; i++){
      if(appResources[i].guid === this.appGuid){
        this.appData = appResources[i];
        break;
      }
    }
  },

  render: function(){
    var form1data = [];
    form1data.push({id: "title", label: "App Title", value: this.appData["title"]});
    form1data.push({id: "type", label: "App Type", value: this.appData["type"]});
    form1data.push({id: "guid", label: "App Guid", value: this.appData["guid"]});
    form1data.push({id: "status", label: "App Status", value: this.appData["status"]});
    form1data.push({id: "url", label: "App URL", value: this.appData["url"]});
    var form2data = [];
    form2data.push({id: "deployed", label: "Last Deployed", value: this.appData["lastDeployed"]});
    form2data.push({id: "accessed", label: "Last Accessed", value: this.appData["lastAccessed"]});
    form2data.push({id: "memory", label: "Current Memory", value: this.appData["memory"] + "MB"});
    form2data.push({id: "cpu", label: "Current CPU", value: this.appData["cpu"] + "%"});
    form2data.push({id: "disk", label: "Current Disk", value: this.appData["disk"] + "MB"});
    this.$el.html(this.temp({forms:[{fields: form1data}, {fields:form2data}]}));
    this.renderCharts();
  },

  renderCharts: function(){
    var self = this;
    var resources = {"memory": "Memory", "cpu": "CPU", "disk": "Disk"};
    var temp = Handlebars.compile($("#cloudenvironments-resource-dashboard-view-template").html());
    this.$el.find('.resource_charts').html(temp({resources: resources}));
    _.each(resources, function(val, key){
      self.renderChart(key, self.$el.find('.resource_charts').find('.' + key + "_chart_view"));
    });
  },

  renderChart: function(resource, el){
    var self = this;
    var chartView = new Cloudenvironments.View.AppLineChartView({
      collection: this.model.getResourceCollection(),
      resource: resource,
      el: el[0],
      guid: self.appGuid
    });
    chartView.render();
  }
});