var Reporting = Reporting || {};

Reporting.Startups = Reporting.Startups || {};

Reporting.Startups.Controller = Controller.extend({

  models: {
    user: new model.User()
  },

  views: {
    reportingtabstartups_container: '#reportingtabstartups_container'
  },

  container: null,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    var self = this;
  },

  show: function(){
    this._super();

    this.initFn();

    this.container = this.views.reportingtabstartups_container;
    $(this.container).show();
  }
});

