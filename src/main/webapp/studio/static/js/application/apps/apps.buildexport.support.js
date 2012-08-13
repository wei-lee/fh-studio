var Apps = Apps || {};

Apps.BuildExport = Apps.BuildExport || {};

Apps.BuildExport.Support = Controller.extend({

  init: function () {
    
  },
  
  setupAppGeneration: function(is_source){
    //TODO: get destination data from server
    var destinations = Config.app.destinations;
    this.showAppGeneration(destinations, is_source);
  },
  
  showAppGeneration: function(dests, is_source){
    var self = this;

    var type = is_source ? "export" : "publish";
    var container = $('#manage_' + type + '_container');
    container.find(".dashboard-content").hide();

    var dest_container_id = '#app_' + type + '_destinations';
    var dest_container = container.find(dest_container_id);

    var dest_list_id = '#app_' + type + '_list';
    var dest_list = container.find(dest_list_id);
    
    // TODO: move this presentation stuff out to preseenation layer location i.e. html
    var dest_ul = $("<ul>", {id:'app_destinations'});
    for(var i=0;i<dests.length; i++){
      var dest = dests[i];
      if(is_source && !dest.source){
          continue;
      }
      if(!is_source && !dest.binary){
          continue;
      }
      var dest_li = $('<li>', {id:'dest_' + (is_source ? 'source' : 'binary') + '_' + dest.id, 'class': 'destination insert-help'});
      var dest_anchor = $('<a>');
      dest_li.data('data', {
        is_source: is_source,
        dest_id: dest.id
      })
      .bind('click', self.doGeneration);
      var dest_icon = $('<span>', {id: 'dest_' + dest.id + '_icon', 'class' : 'destination_icon'});
      var dest_name = $fw_manager.client.lang.getLangString('export_' + dest.id + '_title');
      var dest_text = $('<span>', {id: 'dest_' + dest.id + '_text','class': 'destination_text', 'text': dest_name});
      dest_li.append(dest_anchor.append(dest_icon).append(dest_text));
      dest_ul.append(dest_li);
    }
    dest_list.html(dest_ul);
    dest_container.show();
  },
  
  doGeneration: function(e){
    e.preventDefault();
    var el = $(this),
        el_data = el.data('data'),
        is_source = el_data.is_source,
        dest_id = el_data.dest_id;
    
    var class_name = 'Destination' + js_util.capitalise(dest_id);
    if(typeof application[class_name] === 'undefined'){
      class_name = "DestinationGeneral";
    }
    var dest_class = new application[class_name](dest_id);
    dest_class.doGeneration(is_source);
  }

});