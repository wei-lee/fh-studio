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
  },

  // Overwrite if needed for a particular apps controller.
  // This function will be called on every app controller whenever the 'selected' app has changed
  //  i.e. each controller is responsible for cleaning up after itself before it can show data/ui
  //       for newly selected app
  reset: function () {
    console.log('apps.controller reset');
    // n/a at generic app controller level
  }
});