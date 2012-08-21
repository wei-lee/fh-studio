var Reporting = Reporting || {};

Reporting.Installs = Reporting.Installs || {};

Reporting.Installs.Controller = Controller.extend({

  models: {
    user: new model.User()
  },

  views: {
    reportingtabinstalls_container: '#reportingtabinstalls_container'
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

    this.container = this.views.reportingtabinstalls_container;
    $(this.container).show();
  }
});

