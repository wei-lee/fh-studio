var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.View = Cloudenvironments.View || {};

Cloudenvironments.View.ResourceSummaryView = Backbone.View.extend({
  WARNING_THRESHHOLD : 50,
  DANGER_THRESHHOLD : 80,

  render: function(){
    var resourceText = {"apps": "Apps", "memory":"Memory", "cpu": "CPU", "disk":"Storage"};
    var params = {};
    params.name = resourceText[this.model.get("name")];
    params.used = this.model.get("used");
    params.total = this.model.get("total");
    params.percentage = this.model.getPercentageStr();
    if(this.model.get("name") === "apps"){
      params.app = true;
    } else if(this.model.get("name") === "cpu"){
      params.cpu = true;
    }
    var type = "success";
    if(this.model.getPercentage() >= this.WARNING_THRESHHOLD && this.model.getPercentage() <= this.DANGER_THRESHHOLD){
      type = "warning";
    } else if(this.model.getPercentage() >= this.DANGER_THRESHHOLD){
      type = "danger";
    }
    params.type = type;
    this.$el.addClass(type);
    var template = Handlebars.compile($("#cloudenvironments-resource-summary-template").html());
    this.$el.html(template(params));
  }
});

Cloudenvironments.View.EnvResourceOverview = Backbone.View.extend({

  className: "row-fluid",
  initialize: function(options){
    console.log("init EnvResourceOverview");
    var temp = Handlebars.compile($('#cloudenvironment-env-resource-overview-template').html());
    var html = temp({envName: this.model.getEnvName()});
    this.$el.html(html);
    this.$el.find('div.env_resource_summary_view').html(new App.View.Spinner().render().$el);
    this.model.bind("sync", function(){
      this.render();
    }, this);
    this.model.fetch();
  },

  render: function(){
    var self = this;
    this.$el.find('div.env_resource_summary_view').empty();
    var resources = ['apps', 'memory', 'cpu', 'disk'];
    _.each(resources, function(resource){
      var resourceModel = self.model.getResourceSummary(resource);
      var summaryView = new Cloudenvironments.View.ResourceSummaryView({
        model: resourceModel,
        className: 'span3'
      });
      summaryView.render();
      self.$el.find('div.env_resource_summary_view').append(summaryView.$el);
    });
  }
});

Cloudenvironments.View.EnvAccordionView = Backbone.View.extend({

  events: {
    'click .reload_button': 'reloadModel',
    'click .show_collapse_button': 'showCollapse',
    'click .hide_collapse_button': 'hideCollapse'
  },

  initialize: function(options){
    this.envName = this.model.get('environment');
    var temp = Handlebars.compile($('#cloudenvironments-env-resource-accordion-tempalte').html());
    var html = temp({name: this.envName, envName: this.model.getEnvName()});
    this.$el = $(html);
    this.model.on("change:interval", function(){
      this.renderCountDown();
    }, this);
  }, 

  render: function(){
    var self = this;
    var overview = new Cloudenvironments.View.EnvResourceOverview({
      model: self.model
    });
    var self = this;
    this.$el.find('.accordion-toggle').html(overview.$el);
    this.$el.find('.collapse').on('show', function(){
      self.$el.find('.show_collapse_button').addClass('hidden');
      self.$el.find('.hide_collapse_button').removeClass('hidden');
    });
    this.$el.find('.collapse').on('hide', function(){
      self.$el.find('.hide_collapse_button').addClass('hidden');
      self.$el.find('.show_collapse_button').removeClass('hidden');
    });
    this.$el.find('.collapse').on('shown', function(){
      if(self.$el.find('.nav li.active').length === 0){
        self.$el.find('.nav li:first a').tab('show');
      }
    });
    this.$el.find('a[data-toggle="pill"]').on('shown', function(e){
      var href = $(e.target).attr("href");
      if(href.indexOf("details_resources_cotent") > -1){
        self.showEnvResourceDetails(self.$(href));
      } else if(href.indexOf("details_apps_cotent") > -1) {
        self.showAppResouceDetails(self.$(href));
      } else {
        self.showCacheDetails(self.$(href));
      }
    });
    this.renderCountDown();
  },

  renderCountDown: function(){
    this.$el.find('.count_down_info').find("span").text(this.model.get("interval") === 0 ? "Loading..." : ("Next Refresh: " + this.model.get("interval") + " Seconds") );
  },

  reloadModel: function(e){
    e.preventDefault();
    this.model.fetch();
  },

  showCollapse: function(e){
    e.preventDefault();
    this.$el.find('.collapse').collapse('show');
  },

  hideCollapse: function(e){
    e.preventDefault();
    this.$el.find('.collapse').collapse('hide');
  },

  showEnvResourceDetails: function(el){
    if(!this.envResourcesView){
      this.envResourcesView = new Cloudenvironments.View.EnvResourcesView({
        model: this.model,
        el: el[0]
      });
      this.envResourcesView.render();
    }
    
  },

  showAppResouceDetails: function(el){
    if(!this.appsResourcesView){
      this.appsResourcesView = new Cloudenvironments.View.AppsResourcesView({
        model: this.model,
        el: el[0]
      });
      this.appsResourcesView.render();
    }
  },

  showCacheDetails: function(el){
    if(!this.cacheResourcesView){
      this.cacheResourcesView = new Cloudenvironments.View.CacheResourcesView({
        model: this.model,
        el: el[0]
      });
      this.cacheResourcesView.render();
    }
  }
});

Cloudenvironments.View.Overview = Backbone.View.extend({
  initialize: function(){
    this.$el.html(new App.View.Spinner().render().el);
    //Important: the render function only needs to be invoked once as each time when the model is fetched, the collection's 
    //sync event will be emitted as well, which will cause an infinite loop
    this.collection.once("sync", function(){
      this.render();
    }, this);
    this.collection.fetch();
  },

  render: function(){
    this.$el.empty();
    console.log(this.collection.length);
    var models = this.collection.models;
    for(var i=0;i<models.length;i++){
      var model = models[i];
      console.log(model);
      var envAccordionView = new Cloudenvironments.View.EnvAccordionView({model: model});
      envAccordionView.render();
      this.$el.append(envAccordionView.$el);
    }
  }
});