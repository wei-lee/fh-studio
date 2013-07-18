App.View.DashboardFilters = Backbone.View.extend({
  events: {
    'click input[type=checkbox]' : 'addFilter'
  },
  initialize : function(options){

  },
  render: function(collection) {
    var categories = [],
    template = $(Handlebars.compile($('#pluginsDashboardFilters').html())()),
    row = Handlebars.compile($('#pluginsDashboardFilterRow').html());

    collection.each(function(model){
      var category = model.get('category');
      if (categories.indexOf(category)===-1){
        categories.push(category);
        template.append(row({ name : category  }));
      }
    });

    this.$el.html(template);
    return this;
  },
  addFilter : function(e){
    var el = e.target,
    category = $(e.target).val();
  }
});