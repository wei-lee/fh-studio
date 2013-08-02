var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.View = Cloudenvironments.View || {};

Cloudenvironments.ResourceTypes = {
  "memory": Cloudenvironments.Model.MemoryResource,
  "cpu": Cloudenvironments.Model.CpuResource,
  "disk": Cloudenvironments.Model.DiskResource
};

Cloudenvironments.View.EnvLineChartView = Backbone.View.extend({

  initialize: function(options){
    this.resource = options.resource;
    this.resourceModel = new Cloudenvironments.ResourceTypes[options.resource]();
    this.collection.on("add", function(model){
      this.addData(model);
    }, this);
    this.chartCollection = new Backbone.Collection();
  },

  getSeriesFromCollection: function(){
    var ret = [];
    var series = this.resourceModel.getSeries();
    var resource = this.resource;
    for(var k=0;k<series.length;k++){
      var obj = {name: js_util.capitalise(series[k]), index: k};
      var data = [];
      var models = this.collection.models;
      for(var i=0;i<models.length;i++){
        var m = models[i].toJSON();
        data.push({x:m.ts, y:m["resources"][resource][series[k]]});
      }
      obj.data = data;
      ret.push(obj);
    }
    
    this.chartCollection.set(ret);
    return this.chartCollection;
  },

  addData: function(model){
    if(this.collection.length === 1){
      //first data added, render the chart
      this.render();
    } else {
      var series = this.resourceModel.getSeries();
      var resource = this.resource;
      for(var k=0;k<series.length;k++){
        var obj = {name: series[k], index: k};
        var m = model.toJSON();
        var data = {x:m.ts, y:m["resources"][resource][series[k]]};
        obj.data = data;
        this.chartCollection.add(obj);
      }
    }
  },

  render: function(){
    var self = this;
    this.chartView = new App.View.LineChart({
      collection: self.getSeriesFromCollection(),
      el: self.el,
      dynamic: true,
      xAxis: {
        type:'datetime',
        tickPixelInterval: 100
      },
      title: {text:self.resourceModel.getTitle()},
      tooltip:{
        valueSuffix: self.resourceModel.getUnit()
      }
    });
    if(this.$el.is(":visible")){
      if(this.collection.length === 0){
        this.chartView.render(true); //no data arrived yet, render loading view
      } else {
        this.chartView.render();
      }
    }
  }
});

Cloudenvironments.View.AppLineChartView = Backbone.View.extend({

  initialize: function(options){
    this.resource = options.resource;
    this.appGuid = options.guid + "";
    this.resourceModel = new Cloudenvironments.ResourceTypes[options.resource]();
    this.collection.on("add", function(model){
      this.addData(model);
    }, this);
    this.chartCollection = new Backbone.Collection();
  },

  getSeriesFromCollection: function(){
    var ret = [];
    var series = this.resource;
    var obj = {name: js_util.capitalise(series), index: 0};
    var data = [];
    var models = this.collection.models;
    for(var i=0;i<models.length;i++){
      var m = models[i].toJSON();
      var apps = m.apps;
      for(var k=0;k<apps.length;k++){
        if(apps[k].guid === this.appGuid){
          data.push({x:m.ts, y:apps[k][series]});
          break;
        }
      }
    }
    obj.data = data;
    ret.push(obj);
    
    this.chartCollection.set(ret);
    return this.chartCollection;
  },

  addData: function(model){
    if(this.collection.length === 1){
      //first data added, render the chart
      this.render();
    } else {
      var series = this.resource;
      var obj = {name: series, index: 0};
      var m = model.toJSON();
      var apps = m.apps;
      for(var i=0;i<apps.length;i++){
        if(apps[i].guid === this.appGuid){
          var data = {x:m.ts, y:apps[i][series]};
          obj.data = data;
          break;
        }
      }
      
      this.chartCollection.add(obj);
    }
  },

  render: function(){
    var self = this;
    this.chartView = new App.View.LineChart({
      collection: self.getSeriesFromCollection(),
      el: self.el,
      dynamic: true,
      legend: false,
      xAxis: {
        type:'datetime',
        tickPixelInterval: 100
      },
      title: {text:self.resourceModel.getTitle()},
      tooltip:{
        valueSuffix: self.resourceModel.getUnit()
      }
    });
    if(this.$el.is(":visible")){
      if(this.collection.length === 0){
        this.chartView.render(true); //no data arrived yet, render loading view
      } else {
        this.chartView.render();
      }
    }
  }
});

Cloudenvironments.View.StackChartView = Backbone.View.extend({

  initialize: function(options){
    this.resource = options.resource;
    this.resourceModel = new Cloudenvironments.ResourceTypes[options.resource]();
    this.collection.on("add", function(model){
      this.latestResource = model;
      this.render();
    }, this);
    this.latestResource = this.collection.at(this.collection.length - 1); //get the latest data
    this.chartCollection = new Backbone.Collection();
  },

  getSeriesFromCollection: function(){
    var series = this.resourceModel.getSeries();
    var colors = this.resourceModel.getColors();
    var resourceData = this.latestResource.toJSON()["resources"][this.resource];
    var ret = [];
    for(var i=0;i< series.length;i++){
      var seriesName = series[i];
      var seriesValue = parseInt(resourceData[seriesName], 10);
      var obj = {name: js_util.capitalise(seriesName), data: [seriesValue], color: colors[i]};
      ret.push(obj);
    }
    ret.push({name:"free", data:[this.getFreeValue()], color: colors[i]});
    this.chartCollection.set(ret.reverse());
    return this.chartCollection;
  },

  getPercentage: function(type){
    var currentResource = this.latestResource.toJSON()["resources"][this.resource];
    if(type === "free"){
      return Math.round(this.getFreeValue() / currentResource["total"] * 100) + "%";
    } else {
      return Math.round(currentResource[type] / currentResource["total"] * 100) + "%";
    }
  },

  getFreeValue: function(){
    var currentResource = this.latestResource.toJSON()["resources"][this.resource];
    if(currentResource.free){
      return currentResource.free;
    } else {
      var series = this.resourceModel.getSeries();
      var usedTotal = 0;
      for(var i=0;i< series.length;i++){
        var seriesName = series[i];
        var seriesValue = parseInt(currentResource[seriesName], 10);
        usedTotal += seriesValue;
      }
      return currentResource["total"] - usedTotal;
    }
  },

  render: function(){
    var opts = {
      chart: {
        type: "bar",
        backgroundColor: "transparent"
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      legend: false,
      title: false,
      xAxis: {
        lineWidth: 0,
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        labels: {
          enabled: false
        },
        minorTickLength: 0,
        tickLength: 0,
        categories: [this.resource]     
      }, 
      yAxis: {
        min: 0,
        title: false,
        lineWidth: 0,
        gridLineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        labels: {
          enabled: false
        },
        minorTickLength: 0,
        tickLength: 0   
      },
      plotOptions: {
        series: {
          stacking: 'normal'
        }
      },
      collection: this.getSeriesFromCollection(),
      el: this.$el.find('.stack_chart_view_chart')[0]
    };
    var chartView = new App.View.BarChart(opts);
    if(this.$el.is(":visible")){
      chartView.render();
      this.renderLegends();
    }
  },

  renderLegends: function(){
    var temp = Handlebars.compile($('#cloudenvironments-resource-stack-chart-legend-template').html());
    var legends = [];
    var series = this.resourceModel.getSeries();
    var colors = this.resourceModel.getColors();
    series.push("free");
    for(var i=0;i<series.length; i++){
      var className = "span" + (12/series.length);
      legends.push({text: series[i], color: colors[i], percentage: this.getPercentage(series[i]), className: className});
    }
    this.$el.find('.stack_chart_view_legend').html(temp({legends: legends}));
  }

});

Cloudenvironments.View.AppResourcePieChartView = Backbone.View.extend({
  initialize: function(options){
    this.resource = options.resource;
    this.collection.on("add", function(model){
      this.latestResource = model.toJSON().apps;
      this.render();
    }, this);
    this.chartCollection = new Backbone.Collection();
    this.latestResource = this.collection.at(this.collection.length - 1).get("apps");
  },

  getSeriesFromCollection: function(){
    var data = [];
    var appsResource = this.latestResource;
    for(var i=0;i<appsResource.length; i++){
      var item = [appsResource[i].title, appsResource[i][this.resource]];
      data.push(item);
    }
    this.chartCollection.set([{
      type:'pie',
      name: this.resource,
      data: data
    }]);
    return this.chartCollection;
  },

  render: function(){
    var opts = {
      el: this.el,
      collection : this.getSeriesFromCollection(),
      title: false
    };
    var chartView = new App.View.PieChart(opts);
    if(this.$el.is(":visible")){
      chartView.render();
    }
  }
});

Cloudenvironments.View.AppsResourceTableView = Backbone.View.extend({
  initialize: function(options){
    this.resource = options.resource;
    this.collection = this.model.getResourceCollection();
    this.collection.on("add", function(){
      this.resetTableData();
    }, this);
    this.columns = [];
    if(this.resource !== "all"){
      var self = this;
      this.resourceModel = new Cloudenvironments.ResourceTypes[this.resource]();
      this.columns = [
        {
          "sTitle": "Title",
          "mDataProp": function(source){
            return "<a href='#'> " + source.title + "</a>";
          }
        }, 
        {
          "sTitle": "Type",
          "mDataProp": "type"
        }, 
        {
          "sTitle": "Status",
          "mDataProp": "status"
        }, 
        {
          "sTitle": js_util.capitalise(this.resource),
          "mDataProp": function(source){
            return source[self.resource] + self.resourceModel.getUnit();
          }
        }];
    } else {
      this.columns = [{
        "sTitle": "Title",
        "mDataProp": function(source){
          return "<a href='#'> " + source.title + "</a>";
        }
      }, {
        "sTitle": "Type",
        "mDataProp": "type"
      }, {
        "sTitle": "Guid",
        "mDataProp": "guid"
      }, {
        "sTitle": "Status",
        "mDataProp": "status"
      }, {
        "sTitle": "Memory",
        "mDataProp": function(source){
          return source.memory + "MB";
        }
      }, {
        "sTitle": "CPU",
        "mDataProp": function(source){
          return source.cpu + "%";
        }
      }, {
        "sTitle": "Disk",
        "mDataProp": function(source){
          return source.disk + "MB";
        }
      }, {
        "sTitle": "Last Deployed",
        "mDataProp": "lastDeployed"
      }, {
        "sTitle": "Last Accessed",
        "mDataProp": "lastAccessed"
      }];
    }
  },

  render: function(){
    if(!this.tableView){
      var sDom = this.resource === "all"? "<'row-fluid'<'span3 pull-right'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>" : "<'row-fluid'<'span4'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>";
      this.tableView = new App.View.DataTable({
        aaData : this.model.getAppResources(),
        "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
          // Append guid data
          $(nTr).attr('data-guid', sData.guid);
        },
        "aoColumns": this.columns,
        "bAutoWidth": false,
        "sPaginationType": 'bootstrap',
        "sDom": sDom,
        "bLengthChange": false,
        "iDisplayLength": 5,
        "bInfo": true
      });
      this.$el.html(this.tableView.render().el);
    }
  },

  resetTableData: function(){
    if(this.tableView && this.tableView.table){
      this.tableView.table.fnClearTable();
      this.tableView.table.fnAddData(this.model.getAppResources());
    }
  }
});