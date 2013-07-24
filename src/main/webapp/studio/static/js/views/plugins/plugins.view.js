App.View.PluginsView = Backbone.View.extend({
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
  breadcrumb : function(trail){
    var crumb = $('#plugins_layout').find('.breadcrumb').empty();
    _.each(trail, function(element, index, list){
      if (index === list.length-1){
        crumb.append($('<li>', {
          "class": "active",
          "text": element
        }));
      }else{
        crumb.append($('<li>', {
          "text": element
        })).append($('<span>', {
          "class": "divider",
          "text" : "/"
        }));
      }
    });
  }
});