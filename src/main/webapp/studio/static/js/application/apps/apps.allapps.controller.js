var Apps = Apps || {};

Apps.Allapps = Apps.Allapps || {};

Apps.Allapps.Controller = Apps.List.Support.extend({

  model: {
    app: new model.App()
  },

  views: {
    allapps_grid_wrapper: "#allapps_grid_wrapper",
    allapps_grid: "#allapps_grid"
  },

  container: null,

  init: function () {
    
  },

  show: function() {
    this._super();
    
    var self = this;
    console.log('all apps show');

    this.model.app.listAll(function(res) {
      var data = self.addControls(res);
      self.renderAppListing(self.views.allapps_grid, self.views.allapps_grid_wrapper, data);
    }, function() {
      // Failure
    }, true);
  }

});