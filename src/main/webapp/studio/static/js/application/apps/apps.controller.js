var Apps = Apps || {};

Apps.Controller = Controller.extend({
  showPreview: false,


  init: function () {

  },

  show: function () {
    var previewController = $fw.client.tab.apps.manageapps.getController('apps.preview.controller');
    if (this.showPreview || previewController.forceStayOpen) {
      if (!previewController.isPreviewOpen()) {
        console.log('forcing show preview by controller');
        previewController.show();
      }
    } else {
      previewController.hide();
    }
  },

  // Overwrite if needed for a particular apps controller.
  // This function will be called on every app controller whenever the 'selected' app has changed
  //  i.e. each controller is responsible for cleaning up after itself before it can show data/ui
  //       for newly selected app
  reset: function () {
    // n/a at generic app controller level
  }
});