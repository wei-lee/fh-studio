var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};
Apps.Configuration.Iphone = Apps.Configuration.Iphone || {};

Apps.Configuration.Iphone.Controller = Apps.Configuration.Ios.Controller.extend({
  destination: 'iphone',

  init: function () {
    this._super();
    this.replaceOptions = {};
  }

});