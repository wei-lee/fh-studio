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
    this.resourceDetails = new Cloudenvironments.Model.EnvironmentResource();
    this.resourceDetails.url = '/studio/static/js/model/backbone/mocks/environments/'+this.id+'_resource.json';
    this.resourceDetails.on("sync", this.detailsLoaded);
  },

  url: function(){
    return '/studio/static/js/model/backbone/mocks/environments/'+this.id+'.json';
  },

  getEnvName: function(){
    return js_util.capitalise(this.get("environment"));
  },

  getResourceSummary: function(resource){
    var self = this;
    return new Cloudenvironments.Model.ResourceSummary({
      name: resource,
      used: parseInt(self.get("resources")[resource]["used"] || self.get("resources")[resource]["running"], 10),
      total: parseInt(self.get("resources")[resource]["total"], 10)
    });
  },

  getDetails: function(){
    this.resourceDetails.fetch();
  },

  detailsLoaded: function(){
    this.trigger("detailsLoaded");
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