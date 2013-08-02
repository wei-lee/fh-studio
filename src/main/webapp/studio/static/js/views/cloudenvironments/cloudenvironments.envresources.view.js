var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.View = Cloudenvironments.View || {};

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
    var chartView = new Cloudenvironments.View.EnvLineChartView({
      collection: this.model.getResourceCollection(),
      resource: resource,
      el: el[0]
    });
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
    this.renderPieChart();
    this.renderAppsTable();
  },

  renderLineChartView : function(){
    var chartView = new Cloudenvironments.View.EnvLineChartView({
      collection: this.model.getResourceCollection(),
      resource: this.resource,
      el: this.$el.find('.line_chart_view')[0]
    });
    chartView.render();
  },

  renderStackChart: function(){
    var chartView = new Cloudenvironments.View.StackChartView({
      collection: this.model.getResourceCollection(),
      el: this.$el.find('.stack_chart_view')[0],
      resource: this.resource
    });
    chartView.render();
  },

  renderPieChart: function(){
    var chartView = new Cloudenvironments.View.AppResourcePieChartView({
      collection: this.model.getResourceCollection(),
      el: this.$el.find('.pie_chart_view')[0],
      resource: this.resource
    }); 
    chartView.render();
  },

  renderAppsTable: function(){
    var self = this;
    var tableView = new App.View.DataTable({
      aaData : self.model.getAppResources(),
      "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
        // Append guid data
        $(nTr).attr('data-guid', sData.guid);
      },
      aoColumns: [{
        "sTitle": "Title",
        "mDataProp": "title"
      }, {
        "sTitle": "Type",
        "mDataProp": "type",
      }, {
        "sTitle": "Status",
        "mDataProp": "status",
      }, {
        "sTitle": self.resource,
        "mDataProp": self.resource
      }],
      "bAutoWidth": false,
      "sPaginationType": 'bootstrap',
      "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
      "bLengthChange": false,
      "iDisplayLength": 5,
      "bInfo": true
    });
    this.$el.find('.details_table_view').html(tableView.render().el);
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