Application = {
  
  editor: null,
  treeviewManager: null,
  
  appAccordionChangeHandler: function(event, ui){
    console.log('appAccordionChangeHandler');
    var accordion = $(event.target),
        content = ui.newContent;
    console.log('old header: ' + ui.oldHeader.attr('id'));

    if ('accordion_item_report' === ui.newHeader.attr('id') || 'accordion_item_debug' === ui.newHeader.attr('id')) {
      // if moving to the reporting item and the preview is open then save flag and hide the preview
      if ($fw.client.preview.isPreviewOpen()) {
      this.previewWasOpen = true;
      $fw.client.preview.hideContent();
      }
    } else if ('accordion_item_report' === ui.oldHeader.attr('id') || 'accordion_item_debug' === ui.oldHeader.attr('id')) {
      // if moving from the reporting item and the preview had previously been open then re-open it
      if (this.previewWasOpen) {
        console.log("reopening Preview");
      $fw.client.preview.showContent();
      this.previewWasOpen = undefined;   // will be reset in future by show() if required
      }
    }
    $fw_manager.app.accordionItemCallback(accordion, content);
  },
  
  accordionItemCallback: function (accordion, content) {
    var deffn = function () {
      // click the first list item in the accordion content
      content.find('li:first').click();
    };
    // Check if we need to force a state
    var id = accordion.attr('id');
    var selected = $fw_manager.state.get(id + '_' + content.prev().attr('id'), 'selected');
    if ('number' === typeof selected) {
      // make sure the list item exists
      var li = content.find('li:visible:nth-child(' + (selected + 1) + ')');
      if(li.length > 0) {
        li.click();
      }
      else {
        deffn();
      }
    }
    else {
      deffn();
    }
  },
  
  destroyTreeView: function(){
      if(null !== $fw_manager.app.treeviewManager){
          $fw_manager.app.treeviewManager.destroy();
          $fw_manager.app.treeviewManager = null;
      }
  },
  
  constructFileTreeView: function(res, guid) {
      $fw_manager.app.treeviewManager = new proto.TreeviewManager({data: res, container: $('#editor_files_list'), app_id: guid });
      $fw_manager.app.treeviewManager.load();
      $('#editor_loading_view').hide();
      $('#editor_files_list').show();
  },
    
  resetApp: function(){
      $fw_manager.app.destroyTreeView();
      if($fw_manager.client.editor.isSetup){
        $fw_manager.client.editor.reset();
      }
      // clear any metrics charts when switching apps
      $(".manage_apps-container .appreport-results").empty();
  },
  
  setupAppGeneration: function(is_source){
    //TODO: get destination data from server
    var destinations = Config.app.destinations;
    $fw_manager.app.showAppGeneration(destinations, is_source);
  },
  
  showAppGeneration: function(dests, is_source){
    
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
          .bind('click', $fw_manager.app.doGeneration);
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
  },
  
  startDownload: function (url) {
    // no need to be all fancy with an iframe here when we can just do..
    document.location = url;
    // plus it works in IE, unlike iframe method
  },
  
  /*
   * Upload the file in the file input id element to the given url
   * Sends along the data and uses the given success callback function
   * Callback has one parameter for the result
   */
  startUpload : function (file_input_id, url, data, success, do_copy, fail, timeout) {
    // Create a new form and copy the file input into it. 
    // We want this to be the only POST parameter initialy, and combine it with the given data
    //   
    var selector = 'string' === typeof file_input_id ? $('#' + file_input_id) : file_input_id;
    var temp_form = selector.closest('form');
    var ph_div = $("<div>");
    if(do_copy){
      selector.before(ph_div);
      temp_form = $("<form>");
      temp_form.append(selector);
      $('body').append(temp_form); 
    }

    var options = {
      url: url,
      data: data,
      dataType: 'json',
      success: function(res){
          success(res);
          if(do_copy){
            ph_div.after(selector);
            temp_form.remove();
            ph_div.remove();
          }
      }
    };
    if(typeof fail == "function"){
        options.error = fail;
    }
    if(typeof timeout == "number"){
        options.timeout = timeout;
    }
    temp_form.ajaxSubmit(options);
    // TODO: clean up/remove temp_form after form submission
  },
  
  initTemplatesGrid: function (data) {
    proto.Grid.destroy(templates_grid);
    templates_grid = proto.Grid.load($('#templates_grid'), {
      pager: 'templates_grid_pager',
      viewrecords: true, 
      recordtext: 'Total Templates : {2}',
      datatype: 'jsonstring',
      emptyrecords: 'No templates',
      data: data,
      colModel : [
        {
          index: 'id',
          name: 'id',
          hidden: true
        },
        {                
          index : 'title', 
          name : 'title', 
          editible : false,
          title: false,
          width:90
        },
        {                
          index : 'description', 
          name : 'description', 
          editible : false,
          title: false
        }, 
        {
          index : 'actions', 
          name : 'actions', 
          editable : false,
          title: false,
          width: 40
        }
      ],
      colNames : $fw_manager.client.lang.getLangArray('template_apps_grid_columns')
    });
  },
  
  initMyAppsGrid: function (data) {
    // destory grid and recreate
    proto.Grid.destroy(my_apps_grid);
    my_apps_grid = proto.Grid.load($('#my_apps_grid'), {
      pager: 'my_apps_grid_pager',
      viewrecords: true, 
      recordtext: 'Total Apps : {2}',
      emptyrecords: 'No apps',
      datatype: 'jsonstring',
      data: data,
      colModel : [
        // if there is no id column the guid will not be set as the id of the row
        { 
          index: 'id',
          name: 'id',
          hidden: true
        },
        {                
          index : 'title', 
          name : 'title', 
          editible : false,
          title: false
        },
        {                
          index : 'email', 
          name : 'email', 
          editible : false,
          title: false
        },
        {
          index : 'description',
          name : 'description',
          editable : false,
          title: false
        },
        {                
          index : 'version', 
          name : 'version', 
          width : 50,
          editible : false,
          sortable : false,
          fixed: true,
          resizable: false,
          title: false
        }, 
        {                
          index : 'modified', 
          name : 'modified', 
          editible : false,
          fixed: true,
          width: 120,
          resizable: false,
          title: false
        }, 
        {                
          index : 'actions', 
          name : 'actions', 
          editable : false,
          sortable : false,
          fixed: true,
          width: 210,
          resizable: false,
          title: false
        }
      ],
      colNames : $fw_manager.client.lang.getLangArray('my_apps_grid_columns')
    });
  }
};
