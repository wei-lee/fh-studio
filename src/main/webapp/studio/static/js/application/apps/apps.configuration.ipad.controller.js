var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};
Apps.Configuration.Ipad = Apps.Configuration.Ipad || {};

Apps.Configuration.Ipad.Controller = Apps.Configuration.Ios.Controller.extend({
  destination: 'ipad',

  init: function () {
    this._super();
    this.replaceOptions = {};
  }

});