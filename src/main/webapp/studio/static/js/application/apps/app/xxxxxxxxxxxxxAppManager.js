application.AppManager = Class.extend({
  
  init: function () {
    
  },
  
  /*
   *
   */
  doDelete: function (guid) {
    console.log('app.doDelete guid:' + guid);
    var icon_html = "<span class=\"ui-icon ui-icon-alert content_icon\"></span>",
        app_title = $('<div>').html(my_apps_grid.jqGrid('getRowData', guid).title);
    $fw.client.dialog.showConfirmDialog($fw.client.lang.getLangString('caution'), icon_html + $fw.client.lang.getLangString('delete_app_confirm_text').replace('<APP>', $.trim(app_title.text())), function () {
      proto.ProgressDialog.reset($fw.client.dialog.progress);
      proto.ProgressDialog.setTitle($fw.client.dialog.progress, 'Delete Progress');
      proto.ProgressDialog.setProgress($fw.client.dialog.progress, 10);
      proto.ProgressDialog.append($fw.client.dialog.progress, 'Starting delete');
      proto.ProgressDialog.show($fw.client.dialog.progress);
      $fw.client.model.App['delete'](guid, function (data) {
        if (data.inst && data.inst.id) {
          proto.ProgressDialog.setProgress($fw.client.dialog.progress, 100);
          proto.ProgressDialog.append($fw.client.dialog.progress, 'Delete complete');
          my_apps_grid.jqGrid('delRowData', guid);
          my_apps_grid.trigger('reloadGrid');
          setTimeout(function () {
            proto.ProgressDialog.hide($fw.client.dialog.progress);
          }, 1500);
        } else if (data.status && data.status === "error") {
          proto.ProgressDialog.hide($fw.client.dialog.progress);
          $fw.client.dialog.error(data.message);
        }
      });
    });
  }
});