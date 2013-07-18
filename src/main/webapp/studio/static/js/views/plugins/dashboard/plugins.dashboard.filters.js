App.View.DashboardFilters = App.View.PluginsDashboard.extend({
  events: {
    'click input[type=checkbox]' : 'clicked'
  },
  templates : {
    pluginsDashboardFilters : '#pluginsDashboardFilters',
    pluginsDashboardFilterRow : '#pluginsDashboardFilterRow'

  },
  filters : [],
  initialize : function(){
    this.compileTemplates();
  },
  render: function(parent) {
    var categories = [],
    template = $(this.templates.$pluginsDashboardFilters()),
    row = this.templates.$pluginsDashboardFilterRow;

    this.parent = parent;
    this.collection = parent.collection;

    this.collection.each(function(model){
      var category = model.get('category');
      if (categories.indexOf(category)===-1){
        categories.push(category);
        template.append(row({ name : category  }));
      }
    });

    this.$el.html(template);
    return this;
  },
  clicked : function(e){
    var self = this,
    el = $(e.target),
    category = el.val(),
    checked = el.prop('checked'),
    idx = this.filters.indexOf(category);

    if (checked && idx===-1){
      this.filters.push(category);
    }else{
      this.filters.splice(idx, 1);
    }
    if (this.filters.length>0){
      this.collection.each(function(model){
         var c = model.get('category');
         if (self.filters.indexOf(c)===-1){
           model.set('hidden', true);
         }else{ // if filters.length > 2 there may be elements already with hidden set - unhide these!
           model.unset('hidden', true);
         }
      });
    }else{
      this.collection.each(function(model){
        model.unset('hidden');
      });
    }
    this.collection.trigger('redraw', this.parent);
  }
});