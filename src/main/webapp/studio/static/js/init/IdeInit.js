// initialise globals
var my_apps_grid = null;
var templates_grid = null;
var apps_layout = null;
var list_apps_layout = null;
var manage_apps_layout = null;
var list_apps_buttons = null;
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
  
});