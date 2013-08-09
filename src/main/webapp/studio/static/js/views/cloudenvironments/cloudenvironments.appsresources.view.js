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

  toggleView: function(guid, appName){
    if(typeof guid === "undefined"){
      this.$el.find('.apps_resource_details_view').hide();
      this.$el.find('.app_resource_table_view').show();
    } else {
      if(this.detailsView){
        this.detailsView.remove();
        this.$el.find('.apps_resource_view_container').append($('<div>', {'class': 'apps_resource_details_view apps_resource_child_view well'}));
      }
      this.detailsView = new Cloudenvironments.View.AppResourceDetailsView({
        model: this.model,
        appGuid: guid,
        appName: appName,
        el: this.$el.find('.apps_resource_details_view')[0],
        parentView: this
      });
      this.$el.find('.apps_resource_child_view').hide();
      this.$el.find('.apps_resource_details_view').show();
      this.detailsView.render();
    }
  },

  showAppResourceDetails: function(e){
    e.preventDefault();
    var guid = $(e.currentTarget).closest('tr').data('guid');
    var appName = $(e.currentTarget).closest('tr').data('appName');
    this.toggleView(guid, appName);
  }
});

Cloudenvironments.View.AppResourceDetailsView = Backbone.View.extend({
  events: {
    "click button.startButton":"startApp",
    "click button.restartButton":"restartApp",
    "click button.suspendButton":"suspendApp",
    "click button.stopButton":"stopApp",
    "click button.undeployButton":"undeployApp",
    "click button.back_btn": "toggleView"
  },

  initialize: function(options){
    this.parentView = options.parentView;
    this.env = this.model.id;
    this.appGuid = options.appGuid + "";
    this.appName = options.appName;
    this.appModel = new Cloudenvironments.Model.CloudApp({
      env: this.env,
      guid: this.appGuid,
      appName: this.appName
    });
    //when an action is invoked against the app, load resource immediately
    this.appModel.on("sync", function(){
      this.model.loadResourceDetails();
    }, this);
    var self = this;
    //once there is new data, re-set appdata
    this.listenTo(this.model.getResourceCollection(), "add", function(){
      this.setAppData();
    });
    this.temp = Handlebars.compile($('#cloudenvironments-per-app-resource-view-template').html());
    this.appData = new Backbone.Model();
    this.setAppData();
    this.appData.on("change", function(){
      self.renderAppDetails();
    }, this);
  },

  setAppData: function(){
    var appResources = this.model.getAppResources();
    for(var i=0;i<appResources.length; i++){
      if(appResources[i].name === this.appName){
        if(this.appData){
          this.appData.set(appResources[i]);
        }
        break;
      }
    }
  },

  toggleView: function(){
    this.parentView.toggleView();
  },

  render: function(){
    this.$el.html(this.temp());
    this.renderAppDetails();
    this.renderCharts();
  },

  renderAppDetails: function(){
    this.setAppData();
    var form1data = [];
    form1data.push({id: "title", label: "App Title", value: this.appData.get("title")});
    form1data.push({id: "type", label: "App Type", value: this.appData.get("type")});
    form1data.push({id: "guid", label: "App Guid", value: this.appData.get("guid")});
    form1data.push({id: "status", label: "App Status", value: this.appData.get("state")});
    var form2data = [];
    form2data.push({id: "modified", label: "Last Modified", value: moment(this.appData.get("lastModified")).utc().format("YYYY-MM-DD HH:mm:ss")});
    form2data.push({id: "memory", label: "Current Memory", value: this.appData.get("memory") + "MB"});
    form2data.push({id: "cpu", label: "Current CPU", value: this.appData.get("cpu") + "%"});
    form2data.push({id: "disk", label: "Current Disk", value: this.appData.get("disk") + "MB"});
    var temp = Handlebars.compile($('#cloudenvironments-per-app-resource-details-template').html());
    this.$el.find('.app_details_container').html(temp({forms:[{fields: form1data}, {fields:form2data}]}));
    this.$el.find('.control-btns .btn').each(function(idx, el){
      if($(el).find('.loading_spinner').length === 0 && $(el).is(":disabled")){
        $(el).removeAttr("disabled");
      }
    });
    var currentState = this.appData.get("state").toLowerCase();
    if( currentState.indexOf("run") > -1){
      this.$el.find('.control-btns .startButton').attr("disabled", "disabled");
    } else if(currentState.indexOf("stop") > -1) {
      this.$el.find('.control-btns .stopButton').attr("disabled", "disabled");
    } else if(currentState.indexOf("suspend") > -1) {
      this.$el.find('.control-btns .suspendButton').attr("disabled", "disabled");
    }
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
      guid: self.appGuid,
      appName: this.appName
    });
    chartView.render();
  },

  startApp: function(e){
    e.preventDefault();
    var self = this;
    this.startLoading(e.target);
    this.appModel.start(function(){
      self.stopLoading(e.target);
    }, function(){
      self.stopLoading(e.target);
    });
  },

  restartApp: function(e){
    e.preventDefault();
    var self = this;
    this.startLoading(e.target);
    this.appModel.restart(function(){
      self.stopLoading(e.target);
    }, function(){
      self.stopLoading(e.target);
    });
  },

  suspendApp: function(e){
    e.preventDefault();
    var self = this;
    this.startLoading(e.target);
    this.appModel.suspend(function(){
      self.stopLoading(e.target);
    }, function(){
      self.stopLoading(e.target);
    });
  },

  stopApp: function(e){
    e.preventDefault();
    var self = this;
    this.startLoading(e.target);
    this.appModel.stop(function(){
      self.stopLoading(e.target);
    }, function(){
      self.stopLoading(e.target);
    });
  },

  undeployApp: function(e){
    e.preventDefault();
    var self = this;
    this.startLoading(e.target);
    this.appModel.undeploy(function(){
      self.stopLoading(e.target);
      self.toggleView();
    }, function(){
      self.stopLoading(e.target);
    });
  },

  startLoading: function(btn){
    $(btn).attr("disabled", "disabled").append(new App.View.Spinner({text:""}).render().el);
  },

  stopLoading: function(btn){
    $(btn).removeAttr("disabled").find('.loading_spinner').remove();
  }
});