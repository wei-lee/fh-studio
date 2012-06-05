








/** GENERATED FILE - DO NOT EDIT 
 * 
 */

var ui_model = new function() {

  var self = {
    
    account_tab : function() {
       return { 
        tab_title : 'account_tab_title', 
        id : 'account_tab', 
        text : 'account_tab_text'
       };
           
    },
 
    apps_tab_east : function() {
       return { 
        id : 'apps_tab_east'
       };
           
    },
 
    sub_main_north : function() {
       return { 
        id : 'sub_main_north', 
        components : [          
          'apps_tab_button', 
          'account_tab_button'
        ]
       };
           
    },
 
    main_layout : function() {
       return { 
        id : 'main_layout', 
        north : self.main_north, 
        south : self.main_south, 
        type : 'layout', 
        east : self.main_east, 
        west : self.main_west, 
        center : self.main_center
       };
           
    },
 
    apps_tab_west : function() {
       return { 
        id : 'apps_tab_west', 
        components : [          
          self.apps_options_my_apps, 
          self.apps_options_create_app, 
          self.apps_options_import_app
        ]
       };
           
    },
 
    sub_main_center : function() {
       return { 
        type : 'layoutTabs', 
        tabs : [          
          self.apps_tab, 
          self.account_tab
        ], 
        id : 'sub_main_center'
       };
           
    },
 
    apps_options_my_apps : function() {
       return { 
        id : 'apps_options_my_apps', 
        text : 'apps_options_my_apps_text'
       };
           
    },
 
    editor_files : function() {
       return { 
        id : 'editor_files', 
        text : 'editor_files_text'
       };
           
    },
 
    configuration_settings : function() {
       return { 
        id : 'configuration_settings'
       };
           
    },
 
    main_north : function() {
       return { 
        id : 'main_north', 
        components : [          
          self.header_logo, 
          self.header_user_info
        ]
       };
           
    },
 
    manage_details : function() {
       return { 
        id : 'manage_details'
       };
           
    },
 
    apps_grid_header : function() {
       return { 
        id : 'apps_grid_header', 
        components : [          
          self.apps_header_search_field, 
          self.apps_header_create_button
        ]
       };
           
    },
 
    apps_header_create_button : function() {
       return { 
        id : 'apps_header_create_button', 
        text : 'apps_header_create_button_text'
       };
           
    },
 
    preview_app : function() {
       return { 
        id : 'preview_app'
       };
           
    },
 
    edit_app_south : function() {
       return { 
        id : 'edit_app_south'
       };
           
    },
 
    configuration_destination : function() {
       return { 
        id : 'configuration_destination'
       };
           
    },
 
    app_accordion_tab_configuration : function() {
       return { 
        id : 'app_accordion_tab_configuration', 
        text : 'app_accordion_tab_configuration_title', 
        content : self.app_accordion_tab_configuration_content, 
        type : 'accordionTitle'
       };
           
    },
 
    sub_main_east : function() {
       return { 
        id : 'sub_main_east'
       };
           
    },
 
    sub_main_west : function() {
       return { 
        id : 'sub_main_west'
       };
           
    },
 
    manage_destination : function() {
       return { 
        id : 'manage_destination'
       };
           
    },
 
    apps_header_search_field : function() {
       return { 
        id : 'apps_header_search_field', 
        text : 'apps_header_search_field_text'
       };
           
    },
 
    app_accordion_tab_configuration_content : function() {
       return { 
        id : 'app_accordion_tab_configuration_content', 
        components : [          
          self.configuration_settings, 
          self.configuration_destination
        ]
       };
           
    },
 
    main_east : function() {
       return { 
        id : 'main_east'
       };
           
    },
 
    apps_grid : function() {
       return { 
        emptyrecords : 'grid_apps_no_records_text', 
        params : {            
          sortorder : 'asc', 
          rowNum : 20, 
          rowList : [            
            20, 
            40, 
            60
          ], 
          datatype : 'local', 
          colModel : [            
            {                
              index : 'appname', 
              name : 'appname', 
              editible : false
            }, 
            {                
              index : 'lastmodified', 
              name : 'lastmodified', 
              editible : false
            }, 
            {                
              index : 'appactions', 
              name : 'appactions', 
              editable : false
            }
          ], 
          viewrecords : false, 
          pager : 'apps_grid_pagers', 
          cellEdit : false
        }, 
        colNames : [          
          'grid_apps_name_header_text', 
          'grid_apps_lastmodified_header_text', 
          'grid_apps_action_header_text'
        ], 
        id : 'apps_grid', 
        type : 'grid', 
        classes : 'ui-layout-content', 
        caption : 'grid_apps_title'
       };
           
    },
 
    main_west : function() {
       return { 
        id : 'main_west'
       };
           
    },
 
    apps_tab_south : function() {
       return { 
        id : 'apps_tab_south'
       };
           
    },
 
    edit_app_north : function() {
       return { 
        id : 'edit_app_north', 
        components : [          
          self.edit_app_app_id, 
          self.edit_app_back
        ]
       };
           
    },
 
    manage_publish : function() {
       return { 
        id : 'manage_publish'
       };
           
    },
 
    manage_analytics : function() {
       return { 
        id : 'manage_analytics'
       };
           
    },
 
    main_center : function() {
       return { 
        type : 'layoutTabs', 
        tabs : [          
          self.apps_tab, 
          self.account_tab
        ], 
        id : 'main_center'
       };
           
    },
 
    header_logo : function() {
       return { 
        id : 'header_logo'
       };
           
    },
 
    edit_app_back : function() {
       return { 
        id : 'edit_app_back', 
        text : 'edit_app_back_text'
       };
           
    },
 
    header_user_info : function() {
       return { 
        id : 'header_user_info', 
        text : 'header_user_info_text'
       };
           
    },
 
    apps_options_create_app : function() {
       return { 
        id : 'apps_options_create_app', 
        text : 'apps_options_create_app_text'
       };
           
    },
 
    apps_tab_center : function() {
       return { 
        id : 'apps_tab_center', 
        components : [          
          self.apps_grid_header, 
          self.apps_grid
        ]
       };
           
    },
 
    edit_app_east : function() {
       return { 
        id : 'edit_app_east', 
        components : [          
          self.preview_app
        ]
       };
           
    },
 
    sub_main_south : function() {
       return { 
        id : 'sub_main_south'
       };
           
    },
 
    edit_app_app_id : function() {
       return { 
        id : 'edit_app_app_id'
       };
           
    },
 
    apps_options_import_app : function() {
       return { 
        id : 'apps_options_import_app', 
        text : 'apps_options_import_app_text'
       };
           
    },
 
    app_accordion_tab_editor_content : function() {
       return { 
        id : 'app_accordion_tab_editor_content', 
        components : [          
          self.editor_files
        ]
       };
           
    },
 
    edit_app_center : function() {
       return { 
        id : 'edit_app_center'
       };
           
    },
 
    app_accordion_tab_editor : function() {
       return { 
        id : 'app_accordion_tab_editor', 
        text : 'app_accordion_tab_editor_title', 
        content : self.app_accordion_tab_editor_content, 
        type : 'accordionTitle'
       };
           
    },
 
    edit_app_west : function() {
       return { 
        type : 'accordion', 
        tabs : [          
          self.app_accordion_tab_manage, 
          self.app_accordion_tab_editor, 
          self.app_accordion_tab_testing, 
          self.app_accordion_tab_configuration
        ], 
        id : 'edit_app_west'
       };
           
    },
 
    apps_tab_north : function() {
       return { 
        id : 'apps_tab_north'
       };
           
    },
 
    app_accordion_tab_manage_content : function() {
       return { 
        id : 'app_accordion_tab_manage_content', 
        components : [          
          self.manage_details, 
          self.manage_analytics, 
          self.manage_publish, 
          self.manage_destination
        ]
       };
           
    },
 
    app_accordion_tab_manage : function() {
       return { 
        id : 'app_accordion_tab_manage', 
        text : 'app_accordion_tab_manage_title', 
        content : self.app_accordion_tab_manage_content, 
        type : 'accordionTitle'
       };
           
    },
 
    apps_tab : function() {
       return { 
        west : self.apps_tab_west, 
        tab_title : 'apps_tab_title', 
        east : self.apps_tab_east, 
        type : 'layout', 
        south : self.apps_tab_south, 
        north : self.apps_tab_north, 
        params : {            
          north__init_closed : true, 
          resizeWithWindow : false, 
          east__init_closed : true
        }, 
        id : 'apps_tab', 
        center : [          
          self.apps_grid_header, 
          self.apps_grid
        ]
       };
           
    },
 
    app_accordion_tab_testing_content : function() {
       return { 
        id : 'app_accordion_tab_testing_content'
       };
           
    },
 
    app_accordion_tab_testing : function() {
       return { 
        id : 'app_accordion_tab_testing', 
        text : 'app_accordion_tab_testing_title', 
        content : self.app_accordion_tab_testing_content, 
        type : 'accordionTitle'
       };
           
    },
 
    main_south : function() {
       return { 
        id : 'main_south', 
        text : 'main_south_text'
       };
           
    }
 
  };
  return self;
};
