var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.View = Cloudenvironments.View || {};

Cloudenvironments.View.ResourceSummaryView = Backbone.View.extend({
  WARNING_THRESHHOLD : 50,
  DANGER_THRESHHOLD : 80,

  render: function(){
    var resourceText = {"apps": "Apps", "memory":"Memory", "cpu": "CPU", "disk":"Storage"};
    var params = {};
    params.name = resourceText[this.model.get("name")];
    params.total = this.model.get("total");
    if(params.total === 0){
      params.na = true;
      this.$el.addClass("disabled");
    } else {
      params.used = this.model.get("used");
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

      if(this.model.get("name") === "apps"){
        type = "info";
      } 

      params.type = type;
      this.$el.addClass(type);
      
    }
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
    this.model.on("sync", function(){
      this.render();
    }, this);
    this.model.fetch();
    this.model.on("change:resources", function(){
      this.render();
    }, this);
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
    'click .hide_collapse_button': 'hideCollapse',
    'click .pause_btn': 'pauseUpdate',
    'click .play_btn': 'continueUpdate'
  },

  initialize: function(options){
    this.envName = this.model.get('environment');
    var temp = Handlebars.compile($('#cloudenvironments-env-resource-accordion-tempalte').html());
    var html = temp({name: this.envName, envName: this.model.getEnvName()});
    this.$el = $(html);
    this.model.on("change:interval", function(){
      this.renderCountDown();
    }, this);
    this.model.once("sync", function(){
      this.$el.find('.resource_controls').removeClass("hidden");
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
      self.model.stopPooling();
      self.$el.find('.hide_collapse_button').addClass('hidden');
      self.$el.find('.show_collapse_button').removeClass('hidden');
    });
    this.$el.find('.collapse').on('shown', function(){
      if(self.$el.find('.nav li.active').length === 0){
        self.$el.find('.nav li:first a').tab('show');
      }
      self.model.startPooling();
    });
    this.$el.find('a[data-toggle="pill"]').on('shown', function(e){
      var href = $(e.target).attr("href");
      if(href.indexOf("details_resources_cotent") > -1){
        self.showEnvResourceDetails(self.$(href));
      } else if(href.indexOf("details_apps_cotent") > -1) {
        var appGuid = $(e.target).data("appGuid");
        if(appGuid){
          $(e.target).removeData("appGuid");
        }
        var appName = $(e.target).data("appName");
        if(appName){
          $(e.target).removeData("appName");
        }
        self.showAppResourceDetails(self.$(href), appGuid, appName);
      } else {
        self.showCacheDetails(self.$(href));
      }
    });
    this.renderCountDown();
  },

  renderCountDown: function(){
    this.$el.find('.count_down_info').find("span").text(this.model.get("interval") === 0 ? "Loading..." : ("Next Refresh: " + this.model.get("interval") + " Seconds") );
  },

  pauseUpdate: function(e){
    e.preventDefault();
    this.model.pausePooling();
    this.$el.find('.pause_btn').addClass("hidden");
    this.$el.find('.play_btn').removeClass("hidden");
    this.$el.find('.count_down_info').find("span").text("Paused");
  },

  continueUpdate: function(e){
    e.preventDefault();
    this.model.continuePooling();
    this.$el.find('.play_btn').addClass("hidden");
    this.$el.find('.pause_btn').removeClass("hidden");
    this.$el.find('.count_down_info').find("span").text("Loading...");
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
        el: el[0],
        parentView: this
      });
      this.envResourcesView.render();
    }
  },

  showAppResourceDetails: function(el, appGuid, appName){
    if(!this.appsResourcesView){
      this.appsResourcesView = new Cloudenvironments.View.AppsResourcesView({
        model: this.model,
        el: el[0]
      });
    } 
    this.appsResourcesView.toggleView(appGuid, appName);
  },

  switchToAppResourcesView: function(appGuid, appName){
    if(appGuid){
      this.$el.find(".nav li:eq(1) a").data("appGuid", appGuid).data("appName", appName);
    }
    this.$el.find(".nav li:eq(1) a").tab("show");
  },

  showCacheDetails: function(el){
    if(!this.cacheResourcesView){
      this.cacheResourcesView = new Cloudenvironments.View.CacheResourcesView({
        model: this.model,
        el: el[0]
      });
    }
  },

  switchToCacheDetailsView: function(){
    this.$el.find(".nav li:eq(2) a").tab("show");
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
    var models = this.collection.models;
    for(var i=0;i<models.length;i++){
      var model = models[i];
      var envAccordionView = new Cloudenvironments.View.EnvAccordionView({model: model});
      envAccordionView.render();
      this.$el.append(envAccordionView.$el);
    }
  }
});