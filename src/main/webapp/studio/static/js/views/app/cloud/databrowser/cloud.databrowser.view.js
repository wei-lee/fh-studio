App.View.DataBrowserView = Backbone.View.extend({
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
      var id = element.toLowerCase().replace(/\s/g, "");
      if (index === list.length-1){
        crumb.append($('<li>', {
          "class": "active",
          "text": element
        }));
      }else{
        crumb.append($('<li>', {
          "html": '<a id="crumb-' + id + '" href="#">' + element + '</a>'
        })).append($('<span>', {
          "class": "divider",
          "text" : "/"
        }));
      }
    });
  },
  alertbox : function(msg){
    this.modal  = new App.View.Modal({
      body : msg,
      cancelText : false
    });
    this.$el.append(this.modal.render().$el);
  }
});