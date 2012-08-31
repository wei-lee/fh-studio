var Apps = Apps || {};

Apps.Controller = Controller.extend({
  showPreview: false,


  init: function () {

  },

  show: function () {
    if (this.showPreview) {
      if (!$fw.client.tab.apps.manageapps.getController('apps.preview.controller').isPreviewOpen()) {
        console.log('forcing show preview by controller');
        $fw.client.tab.apps.manageapps.getController('apps.preview.controller').show();
      }
    } else {
      $fw.client.tab.apps.manageapps.getController('apps.preview.controller').hide();
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