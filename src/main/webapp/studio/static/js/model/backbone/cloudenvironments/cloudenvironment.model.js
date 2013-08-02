var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.Model = Cloudenvironments.Model || {};
Cloudenvironments.Collection = Cloudenvironments.Collection || {};

Cloudenvironments.Model.EnvironmentResource = Backbone.Model.extend({
  
});

Cloudenvironments.Model.ResourceSummary = Backbone.Model.extend({

  getPercentage: function(){
    return Math.round(this.get("used")/this.get("total")*100);
  },

  getPercentageStr: function(){
    return this.getPercentage() + "%";
  }
});

Cloudenvironments.Model.Environment = Backbone.Model.extend({
  idAttribute: "environment",

  initialize: function(){
    this.lineSeriesCollections = {};
    this.stackSeries = {};
    this.triggerFlags = {};
    this.resourceDetails = new Cloudenvironments.Model.EnvironmentResource();
    this.isPooling = false;
    this.url = function(){
      return '/studio/static/js/model/backbone/mocks/environments/'+this.id+'.json';
    };
  },

  getEnvName: function(){
    return js_util.capitalise(this.get("environment"));
  },

  getResourceSummary: function(resource){
    var self = this;
    var data = this.get("resources")[resource];
    data.used = this.get("resources")[resource]["used"] ||this.get("resources")[resource]["running"]
    data.name = resource;
    data.ts = new Date().getTime();
    return new Cloudenvironments.Model.ResourceSummary(data);
  },

  getResourceText: function(resource){
    return js_util.capitalise(resource);
  },

  startPooling: function(){
    if(!this.isPooling){
      var self = this;
      this.url = function(){
        return '/studio/static/js/model/backbone/mocks/environments/'+self.id+'_resource.json';
      };
      this.on("sync", function(){
        this.updateSeriesCollections();
      }, this);
      var interval = parseInt($fw.getClientProp("studio.ui.environments.refreshInterval") || 10000, 10);
      this.poolingInterval = setInterval(function(){
        self.fetch();
      }, interval);
      this.isPooling = true;
      _.each(self.lineSeriesCollections, function(series){
        series.trigger("beforeFetch");
      });
      self.fetch();
    }
  },

  stopPooling: function(){
    if(this.poolingInterval){
      clearTimeout(this.poolingInterval);
      this.isPooling = false;
      this.off("sync", function(){
        this.updateSeriesCollections();
      }, this);
    }
  },

  getResourceLineSeries: function(resource){
    if(!this.lineSeriesCollections["memory"]){
      this.lineSeriesCollections["memory"] = new Cloudenvironments.Collection.MemoryLineSeries();
    }
    if(!this.lineSeriesCollections["cpu"]){
      this.lineSeriesCollections["cpu"] = new Cloudenvironments.Collection.CpuLineSeries();
    }
    if(!this.lineSeriesCollections["disk"]){
      this.lineSeriesCollections["disk"] = new Cloudenvironments.Collection.DiskLineSeries();
    }
    return this.lineSeriesCollections[resource];
  },

  getStackSeries: function(resource){
    if(!this.stackSeries["memory"]){
      this.stackSeries["memory"] = new Cloudenvironments.Model.MemoryStackSeries(this.getResourceSummary("memory").toJSON());
    }
    if(!this.stackSeries["cpu"]){
      this.stackSeries["cpu"] = new Cloudenvironments.Model.CpuStackSeries(this.getResourceSummary("cpu").toJSON());
    }
    if(!this.stackSeries["disk"]){
      this.stackSeries["disk"] = new Cloudenvironments.Model.DiskStackSeries(this.getResourceSummary("disk").toJSON());
    }
    return this.stackSeries[resource];
  },

  updateSeriesCollections: function(){
    var self = this;
    $.each(['memory', 'cpu', 'disk'], function(index, resource){
      var summary = self.getResourceSummary(resource);
      self.lineSeriesCollections[resource].add(summary);
      if(!self.triggerFlags[resource]){
        self.lineSeriesCollections[resource].trigger("sync");
        self.triggerFlags[resource] = true;
      }
      if(self.stackSeries[resource]){
        self.stackSeries[resource].set(summary.toJSON());
      }
    });
  },

  getAppPieSeries: function(resource){
    var data = [];
    var appsResource = this.get("apps");
    for(var i=0;i<appsResource.length; i++){
      var item = [appsResource[i].title, appsResource[i][resource]];
      data.push(item);
    }
    return new Backbone.Collection([{
      type:'pie',
      name: resource,
      data: data
    }]);
  }

});



Cloudenvironments.Collection.Environments = Backbone.Collection.extend({
  model: Cloudenvironments.Model.Environment,
  url: '/studio/static/js/model/backbone/mocks/environments/list.json',

  parse: function(response){
    var envs = response.environments;
    var ret = [];
    _.each(envs, function(env){
      ret.push({environment: env});
    });
    return ret;
  }
});

Cloudenvironments.Collection.EnvResource = Backbone.Collection.extend({

});

Cloudenvironments.Collection.LineSeries = Backbone.Collection.extend({
  toJSON: function(){
    var ret = [];
    var series = this.getSeries();
    for(var k=0;k<series.length;k++){
      var obj = {name: series[k], index: k};
      var data = [];
      for(var i=0;i<this.models.length;i++){
        var m = this.models[i].toJSON();
        data.push({x:m.ts, y:m[series[k]]});
      }
      obj.data = data;
      ret.push(obj);
    }
    
    return ret;
  },

  getOptions: function(){
    return {
      xAxis: {
        type:'datetime',
        tickPixelInterval: 100
      },
      title: {text:this.getTitle()},
      tooltip:{
        valueSuffix: this.getUnit()
      }
    }
  }
});

Cloudenvironments.Collection.MemoryLineSeries = Cloudenvironments.Collection.LineSeries.extend({
  getSeries: function(){
    return ["apps", "system", "cache"];
  },

  getUnit: function(){
    return "MB";
  },

  getTitle: function(){
    return "Memory";
  }
});

Cloudenvironments.Collection.CpuLineSeries = Cloudenvironments.Collection.LineSeries.extend({
  getSeries: function(){
    return ["apps", "used"];
  },

  getUnit: function(){
    return "%";
  },

  getTitle: function(){
    return "CPU";
  }
});

Cloudenvironments.Collection.DiskLineSeries = Cloudenvironments.Collection.LineSeries.extend({
  getSeries: function(){
    return ["apps", "system"];
  },

  getUnit: function(){
    return "MB";
  },

  getTitle: function(){
    return "Disk";
  }
});

Cloudenvironments.Model.StackSeries = Backbone.Model.extend({

  toJSON: function(){
    var series = this.getSeries();
    var colors = this.getColors();
    var ret = [];
    for(var i=0;i< series.length;i++){
      var seriesName = series[i];
      var seriesValue = parseInt(this.get(seriesName), 10);
      var obj = {name: seriesName, data: [seriesValue], color: colors[i]};
      ret.push(obj);
    }
    ret.push({name:"free", data:[this.getFreeValue()], color: colors[i]});
    return {"series":ret.reverse()};
  },

  getPercentage: function(type){
    if(type === "free"){
      return Math.round(this.getFreeValue() / this.get("total") * 100) + "%";
    } else {
      return Math.round(this.get(type) / this.get("total") * 100) + "%";
    }
  },

  getFreeValue: function(){
    if(this.has("free")){
      return this.get("free");
    } else {
      var series = this.getSeries();
      var usedTotal = 0;
      for(var i=0;i< series.length;i++){
        var seriesName = series[i];
        var seriesValue = parseInt(this.get(seriesName), 10);
        usedTotal += seriesValue;
      }
      return this.get("total") - usedTotal;
    }
  }

});

Cloudenvironments.Model.MemoryStackSeries = Cloudenvironments.Model.StackSeries.extend({
  getSeries: function(){
    return ["apps", "system", "cache"];
  },

  getColors: function(){
    return ["#2f7ed8","#0d233a","#1aadce", "#8bbc21"];
  }
});


Cloudenvironments.Model.CpuStackSeries = Cloudenvironments.Model.StackSeries.extend({
  getSeries: function(){
    return ["apps", "used"];
  },

  getColors: function(){
    return ["#2f7ed8","#0d233a", "#8bbc21"];
  }
});


Cloudenvironments.Model.DiskStackSeries = Cloudenvironments.Model.StackSeries.extend({
  getSeries: function(){
    return ["apps", "system"];
  },

  getColors: function(){
    return ["#2f7ed8","#0d233a","#8bbc21"];
  }
});
