App.View.PluginsView = Backbone.View.extend({
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
  }
});