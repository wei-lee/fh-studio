App.View.DashboardFilters = App.View.PluginsDashboard.extend({
  events: {
    'click input#allPluginsCheck' : 'all',
    'click input[type=checkbox][id!=allPluginsCheck]' : 'clicked'
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
    row = this.templates.$pluginsDashboardFilterRow,
    allBox = $(row({ name : 'All' }));
    allBox.find('input').prop({checked : true, id : 'allPluginsCheck'});

    this.parent = parent;
    this.collection = parent.collection;

    template.append(allBox);
    this.collection.each(function(model){
      model = model.toJSON();
      var category = model.category,
      disabled = model.disabled;
      if (categories.indexOf(category)===-1 && !disabled){
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

    this.$el.find('#allPluginsCheck').prop("checked", false);

    if (checked && idx===-1){
      this.filters.push(category);
    }else{
      this.filters.splice(idx, 1);
      if (this.$el.find('input[type=checkbox]:checked').length===0){
        // If nothing else is checked, all is...
        this.$el.find('#allPluginsCheck').prop("checked", true);
      }
    }
    if (this.filters.length>0){
      this.collection.each(function(model){
         var c = model.get('category');
         if (self.filters.indexOf(c)===-1){
           model.set('hidden', true);
         }else{ // if filters.length > 2 there may be elements already with hidden set - unhide these!
           model.unset('hidden');
         }
      });
    }else{
      this.collection.each(function(model){
        model.unset('hidden');
      });
    }
    this.collection.trigger('redraw', this.parent);
  },
  all : function(e){
    this.$el.find('input[type=checkbox][id!=allPluginsCheck]').prop('checked', false);
    this.collection.each(function(model){
      model.unset('hidden');
    });
    this.collection.trigger('redraw', this.parent);

    $(e.target).prop('checked', true);
  }
});