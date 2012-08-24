var Apps = Apps || {};

Apps.Myapps = Apps.Myapps || {};

Apps.Myapps.Controller = Apps.List.Support.extend({

  model: {
    app: new model.App()
  },

  views: {
    myapps_grid_wrapper: "#myapps_grid_wrapper",
    myapps_grid: "#myapps_grid"
  },

  container: null,

  init: function() {

  },

  show: function() {
    this._super();
    
    var self = this;
    console.log('myapps show');

    this.model.app.listMyApps(function(res) {
      var data = self.addControls(res);
      self.renderAppListing(self.views.myapps_grid, self.views.myapps_grid_wrapper, data);
    }, function() {
      // Failure
    }, true);
  }

});