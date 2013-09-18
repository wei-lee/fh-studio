var App = App || {};
App.View = App.View || {};

App.View.CMS = Backbone.View.extend({

  events: {
    'click table tbody tr': 'showDetails'
  },
  templates : {
    'cms_home' : '#cms_home'
  },
  initialize: function(){
    this.compileTemplates();
  },
  render: function(){
    this.$el.append(this.templates.$cms_home());
    return this;
  },
  compileTemplates: function() {
    var templates = {};
    for (var key in this.templates){
      if (this.templates.hasOwnProperty(key)){
        var tpl = this.templates[key],
        html = $(tpl, this.$container).html();
        if (!html){
          throw new Error("No html found for " + key);
        }
        templates['$' + key] = Handlebars.compile(html);
      }
    }
    this.templates = templates;
  },
});