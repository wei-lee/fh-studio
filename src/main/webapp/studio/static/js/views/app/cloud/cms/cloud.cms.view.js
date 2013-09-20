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

    this.$el.find('.treeContainer').jstree({
      "json_data" : {
        "data" : [
          {
            "data" : "A node",
            "metadata" : { id : 23 },
            "children" : [ "Child 1", "A Child 2" ]
          },
          {
            "attr" : { "id" : "li.node.id1" },
            "data" : {
              "title" : "Long format demo",
              "attr" : { "href" : "#" }
            }
          }
        ]
      },
      'core': {
        initially_open: ['root'],
        animation: 0
      },
      'themes': {
        theme: 'classic',
        loaded: true
      },
      'plugins': ['themes', 'json_data', 'ui', 'cookies', 'crrm']
    }).bind("select_node.jstree", function (e, data) { alert(data.rslt.obj.data("id")); });

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