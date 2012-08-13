var Apps = Apps || {};

Apps.Quickstart = Apps.Quickstart || {};

Apps.Quickstart.Controller = Apps.Controller.extend({

  model: {
    //device: new model.Device()
  },

  views: {
    quickstart_container: '#quickstart_container',
    quickstart_client_container: '#quickstart_client_container',
    quickstart_cloud_container: '#quickstart_cloud_container'
  },

  container: null,

  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  show: function(e, view){
    this._super();

    this.initFn();
    
    // TODO
    this.hide();
    if (view != null) {
      this.container = view;
    } else {
      this.container = this.views.quickstart_container;
    }
    $(this.container).show();
  },

  initBindings: function () {
    // client/cloud quickstart binding setup
  }

});

Apps.Quickstart.Client = Apps.Quickstart.Client || {};

Apps.Quickstart.Client.Controller = Apps.Quickstart.Controller.extend({
  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  show: function (e) {
    this._super(e, this.views.quickstart_client_container);
  },

  initBindings: function () {
    // client quickstart binding setup
  }
});


Apps.Quickstart.Cloud = Apps.Quickstart.Cloud || {};

Apps.Quickstart.Cloud.Controller = Apps.Quickstart.Controller.extend({
  init: function () {
    this.initFn = _.once(this.initBindings);
  },

  show: function (e) {
    this._super(e, this.views.quickstart_cloud_container);
  },

  initBindings: function () {
    // cloud quickstart binding setup
  }
});