App.View.DataBrowserView = Backbone.View.extend({
  breadcrumb : function(trail, clickHandler){
    var startRemoving = false;
    var crumb = $('#apps_breadcrumb');
    crumb.children().each(function(index, el){
      if (startRemoving && $(this).prop('tagName').toLowerCase() === "li"){
        $(this).remove();
      }else{
        startRemoving = $(this).text().trim() === "Cloud Management";
      }
    });
    _.each(trail, function(element, index, list){
      var id = element.toLowerCase().replace(/\s/g, "");

      // First iteration needs an extra /
      if (index === 0){
        crumb.append($('<span>', {
          "class": "divider",
          "text" : "/"
        }));
      }

      if (index === list.length-1){
        crumb.append($('<li>', {
          "class": "active",
          "text": element
        }));
      }else{
        crumb.append($('<li>', {
          "html": '<a class="databrowserCrumb" data-index="' + index + '" id="crumb-' + id + '" href="#">' + element + '</a>'
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