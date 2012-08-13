Application = {
  
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
      colNames : $fw.client.lang.getLangArray('template_apps_grid_columns')
    });
  }
};
