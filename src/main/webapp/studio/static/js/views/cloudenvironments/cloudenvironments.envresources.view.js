var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.View = Cloudenvironments.View || {};

Cloudenvironments.View.ResourceBarChartView = App.View.BarChart.extend({
  initialize: function(options){
    options = $.extend(true, {}, options, {
      chart: {
        type: "bar"
      },
      credits: {
        enabled: false
      },
      title: false
    });

    App.View.BarChart.prototype.initialize.call(this, options);
  }
});

Cloudenvironments.View.TabbableView = Backbone.View.extend({

  initialize: function(){
    this.temp = Handlebars.compile($('#cloudenvironments-tabbable-view-template').html());
  },
  
  render: function(){
    var env = this.model.id;
    var list = {};
    var self = this;
    list[env+"_resource_dashboard"] = "Dashboard";
    list[env+"_resource_memory"] = "Memory";
    list[env+"_resource_cpu"] = "CPU";
    list[env+"_resource_disk"] = "Disk";

    this.$el.html(self.temp({"list":list}));
    
    this.$el.find("a[data-toggle='tab']").on("shown", function(e){
      var href = $(e.target).attr("href");
      if(href.indexOf("dashboard") > -1){
        self.showDashboardView(href);
      } else if(href.indexOf("memory") > -1){
        self.showMemoryView(href);
      } else if(href.indexOf("cpu") > -1){
        self.showCpuView(href);
      } else {
        self.showDiskView(href);
      }
    });

    this.$el.find(".nav li:first a").tab("show");
  },

  showDashboardView: function(id){
    if(!this.dashboardView){
      this.dashboardView = new Cloudenvironments.View.ResourceDashboardView({
        model: this.model,
        el:id
      });
    }
  },

  showMemoryView: function(id){
    if(!this.memoryView){
      this.memoryView = new Cloudenvironments.View.SingleResourceView({
        model: this.model,
        resource: 'memory',
        el: id
      });
    }
  },

  showCpuView: function(id){
    if(!this.cpuView){
      this.cpuView = new Cloudenvironments.View.SingleResourceView({
        model: this.model,
        resource: 'cpu',
        el: id
      });
    }
  },

  showDiskView: function(id){
    if(!this.diskView){
      this.diskView = new Cloudenvironments.View.SingleResourceView({
        model: this.model,
        resource: 'disk',
        el: id
      });
    }
  }
});

Cloudenvironments.View.ResourceDashboardView = Backbone.View.extend({

  initialize: function(){
    this.temp = Handlebars.compile($("#cloudenvironments-resource-dashboard-view-template").html());
    this.render();
  },

  render: function(){
    var self = this;
    var resources = {"memory": "Memory", "cpu": "CPU", "disk": "Disk"};
    this.$el.html(self.temp({resources: resources}));
    _.each(resources, function(val, key){
      self.renderChart(key, self.$el.find('.' + key + "_chart_view"));
    });
    this.model.startPooling();
  },

  renderChart: function(resource, el){
    var self = this;
    var collection = self.model.getResourceLineSeries(resource);
    var opts = collection.getOptions();
    opts.el = el[0];
    opts.dynamic = true;
    opts.collection = collection;
    var chartView = new App.View.LineChart(opts);
    chartView.render();
  }
});

Cloudenvironments.View.SingleResourceView = Backbone.View.extend({
  initialize: function(options){
    this.resource = options.resource;
    this.temp = Handlebars.compile($('#cloudenvironments-resource-single-view-template').html());
    this.render();
  },

  render: function(){
    this.$el.html(this.temp());
    this.renderLineChartView();
    this.renderStackChart();
  },

  renderLineChartView : function(){
    var self = this;
    var collection = self.model.getResourceLineSeries(self.resource);
    var opts = collection.getOptions();
    opts.el = this.$el.find('.line_chart_view')[0];
    opts.dynamic = true;
    opts.collection = collection;
    var chartView = new App.View.LineChart(opts);
    chartView.render();
  },

  renderStackChart: function(){
    var model = this.model.getStackSeries(this.resource);
    var opts = {el: this.$el.find('.stack_chart_view_chart')[0]};
    opts.model = model;
    opts.xAxis = {categories: [this.resource]};
    var chartView = new Cloudenvironments.View.ResourceBarChartView(opts);
    //chartView.render();
  }
});

Cloudenvironments.View.EnvResourcesView = Backbone.View.extend({

  render: function(){
    var self = this;
    console.log("EnvResourcesView rendered");
    if(!this.tabbableView){
      this.tabbableView = new Cloudenvironments.View.TabbableView({
        model: self.model,
        el: self.el
      });
      this.tabbableView.render();
    }
  }
});