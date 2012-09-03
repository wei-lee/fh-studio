// TODO: remove these globals
var change_password_button = null;

$(document).ready(function () {
  ZeroClipboard.setMoviePath( '/studio/static/common/js/ui/thirdparty/zeroclipboard/ZeroClipboard.swf' );

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
  // $fw.client becomes available as well as $fw.app

  // CAUTION!!! uncomment this line to enable sample data on reports
  //$fw.clientProps['reporting-sampledata-enabled'] = 'true';

  $fw.setClient(new IDEManager());
  $fw.initClient();
});