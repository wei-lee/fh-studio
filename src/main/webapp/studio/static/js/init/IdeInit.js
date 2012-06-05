// initialise globals
var my_apps_grid = null;
var templates_grid = null;
var apps_layout = null;
var list_apps_layout = null;
var manage_apps_layout = null;
var list_apps_buttons = null;
var snippets_tags_tabs = null;
var snippets_mine_snippets_new_button = null;
var snippets_mine_snippet_view_save_create_button = null;
var snippets_mine_snippet_view_save_update_button = null;
var snippets_tags_list_snippet_view_copy_snippet_button = null;
var snippets_tags_list_snippets_back_button = null;
var snippet_create_form = null;
var snippet_update_form = null;
var snippets_search_page_button = null;
var snippets_search_view_back_button = null;
var change_password_button = null;

$(document).ready(function () {
  $(document).bind('keyup', function (e) {
    try {
      if (e.altKey && e.ctrlKey && e.keyCode === 71) { // Ctrl-Alt-G
        alert('app:' + $fw.data.get('app').guid + '\ninst:' + $fw.data.get('inst').guid);
      }
    }
    catch (e) {
      // fail silently
    }
  });
  Log.append('init and set IDEManager as client of FrameworkManager');
  // $fw_manager.client becomes available as well as $fw_manager.app
  $fw_manager.setClient(new IDEManager());
  $fw_manager.initClient();
  
  
  /*
  $fw_manager.ui.setMode('basic');
  // TODO: Validation happens here behind the scenes
  //$fw_manager.ui.loadModel('main_layout',$(document.body));
  
  */
  
});