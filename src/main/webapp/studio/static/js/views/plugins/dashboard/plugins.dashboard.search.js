App.View.DashboardSearch = App.View.PluginsDashboard.extend({
  events: {
    'keyup input' : 'filter'
  },
  templates : {
    pluginsDashboardSearch : '#pluginsDashboardSearch'
  },
  initialize : function(parent){
    this.compileTemplates();
  },
  render: function(parent) {
    this.parent = parent;
    this.collection = parent.collection;
    var search = $(this.templates.$pluginsDashboardSearch()),
    self = this;
    this.$el.append(search);
    return this;
  },
  filter : function(el){
    var value = el.target && el.target.value && el.target.value.toLowerCase();
    this.collection.each(function(model){
      model.unset('hidden');
      if (typeof value !== "string" || value === ""){
        return;
      }
      if (model.get('category').toLowerCase().indexOf(value)===-1
      && model.get('name').toLowerCase().indexOf(value)===-1){
        model.set('hidden', true);
      }
    });
    this.collection.trigger('redraw', this.parent);
  }
});