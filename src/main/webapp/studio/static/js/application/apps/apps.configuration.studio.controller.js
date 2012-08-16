var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};
Apps.Configuration.Studio = Apps.Configuration.Studio || {};

Apps.Configuration.Studio.Controller = Apps.Configuration.Support.extend({
  destination: 'studio',

  init: function () {
    this._super();
  }

});