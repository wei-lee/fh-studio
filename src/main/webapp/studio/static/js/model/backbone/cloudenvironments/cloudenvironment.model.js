var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.Model = Cloudenvironments.Model || {};
Cloudenvironments.Collection = Cloudenvironments.Collection || {};

Cloudenvironments.Model.MemoryResource = Backbone.Model.extend({
  getSeries: function(){
    return ["apps", "system", "cache"];
  },

  getUnit: function(){
    return "MB";
  },

  getTitle: function(){
    return "Memory";
  },

  getColors: function(){
    return ["#2f7ed8","#0d233a","#1aadce", "#8bbc21"];
  }
});

Cloudenvironments.Model.CpuResource = Backbone.Model.extend({
  getSeries: function(){
    return ["apps", "used"];
  },

  getUnit: function(){
    return "%";
  },

  getTitle: function(){
    return "CPU";
  },

  getColors: function(){
    return ["#2f7ed8","#0d233a", "#8bbc21"];
  }
});

Cloudenvironments.Model.DiskResource = Backbone.Model.extend({
  getSeries: function(){
    return ["apps", "system"];
  },

  getUnit: function(){
    return "MB";
  },

  getTitle: function(){
    return "Disk";
  },

  getColors: function(){
    return ["#2f7ed8","#0d233a","#8bbc21"];
  }
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
    this.set("interval", 0);
    this.resourceCollection = new Cloudenvironments.Collection.EnvResource();
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
    data.used = this.get("resources")[resource]["used"] ||this.get("resources")[resource]["running"];
    data.name = resource;
    data.ts = new Date().getTime();
    return new Cloudenvironments.Model.ResourceSummary(data);
  },

  getResourceText: function(resource){
    return js_util.capitalise(resource);
  },

  countToNextLoad: function(){
    var self = this;
    this.set("interval", parseInt($fw.getClientProp("studio.ui.environments.refreshInterval") || 10, 10));
    this.poolingInterval = setInterval(function(){
      self.set("interval", self.get("interval") - 1 );
      if(self.get("interval") === 0){
        clearTimeout(self.poolingInterval);
        self.loadResourceDetails();
      }
    }, 1000);
  },

  startPooling: function(){
    if(!this.isPooling){
      this.isPooling = true;
      this.loadResourceDetails();
    }
  },

  stopPooling: function(){
    if(this.poolingInterval){
      clearTimeout(this.poolingInterval);
      this.isPooling = false;
    }
  },

  loadResourceDetails: function(){
    var envResource = new Cloudenvironments.Model.EnvironmentResource({
      env: this.id
    });
    envResource.on("sync", function(model, resp, options){
      this.countToNextLoad();
      this.updateResourceCollection(model);
      this.trigger("sync");
    }, this);
    envResource.fetch();
  },

  updateResourceCollection: function(model){
    model.set("ts", new Date().getTime());
    this.resourceCollection.add(model);
  },

  getResourceCollection: function(){
    return this.resourceCollection;
  },

  getAppResources: function(){
    return this.resourceCollection.at(this.resourceCollection.length - 1).get("apps");
  }
});

Cloudenvironments.Model.EnvironmentResource = Backbone.Model.extend({

  initialize: function(options){
    this.env = options.env;
    this.url = function(){
      return '/studio/static/js/model/backbone/mocks/environments/'+this.env+'_resource.json';
    };
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
  model: Cloudenvironments.Model.EnvironmentResource
});

Cloudenvironments.Model.CacheResource = Backbone.Model.extend({

  initialize: function(options){
    this.env = options.env;
  },

  getPercentage: function(){
    return Math.round(parseInt(this.get("used"), 10)/parseInt(this.get("total"), 10)*100);
  },

  getMaxPercentage: function(){
    return Math.round(parseInt(this.get("total"), 10)/parseInt(this.get("memory"), 10)*100);
  }
});
