var Apps = Apps || {};

Apps.Controller = Controller.extend({
  showPreview: false,


  init: function () {

  },

  show: function () {
    if (this.showPreview) {
      if (!$fw.client.preview.isPreviewOpen()) {
        console.log('forcing show preview by controller');
        $fw.client.preview.show();
      }
    } else {
      $fw.client.preview.hide();
    }
  }
});