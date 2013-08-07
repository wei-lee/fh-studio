var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.View = Cloudenvironments.View || {};

Cloudenvironments.View.CacheResourcesView = Backbone.View.extend({

  events: {
    "click button.flush_cache_btn": "flushEnvCache",
    "click button.set_cache_btn" : "setEnvCache"
  },

  initialize: function(options){
    this.$el.html(new App.View.Spinner().render().el);
    this.temp = Handlebars.compile($('#cloudenvironments-cache-content-view-template').html());
    this.collection = this.model.getResourceCollection();
    if(this.collection.length === 0){
      this.model.startPooling();
    } else {
      this.setCacheModel();
    }
    this.collection.on("add", function(){
      this.setCacheModel();
    }, this);
  },

  setCacheModel: function(){
    var resourceData = this.collection.at(this.collection.length - 1);
    if(resourceData){
      var cacheData = resourceData.get("resources")["cache"];
      cacheData.env = this.model.id;
      cacheData.memory = resourceData.get("resources")["memory"]["total"];
      if(this.cacheModel){
        this.cacheModel.set(cacheData);
      } else {
        this.cacheModel = new Cloudenvironments.Model.CacheResource({env: this.model.id});
        this.cacheModel.on("change", function(){
          this.render();
        }, this);
        this.cacheModel.on("sync", function(){
          this.model.loadResourceDetails();
        },this);
        this.cacheModel.set(cacheData);
      }
    }
  },

  render: function(){
    var cacheUsage = {
      cache_percent: this.cacheModel.getPercentage(),
      cache_used: this.cacheModel.get("used"),
      cache_total: this.cacheModel.get("total"),
      max_cache_percentage: this.cacheModel.getMaxPercentage()
    };
    this.$el.html(this.temp(cacheUsage));
  },

  flushEnvCache: function(e){
    e.preventDefault();
    this.cacheModel.flush();
  },

  setEnvCache: function(e){
    e.preventDefault();
    var el = this.$el.find("input:radio[name=cache_value]:checked input:text");
    this.cacheModel.setCache(el.data("cacheType"), el.val());
  }


});