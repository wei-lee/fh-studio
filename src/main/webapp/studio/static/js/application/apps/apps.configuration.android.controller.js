var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};
Apps.Configuration.Android = Apps.Configuration.Android || {};

Apps.Configuration.Android.Controller = Apps.Configuration.Support.extend({
  destination: 'android',

  init: function() {
    this.hiddenOptions = {
      'splash Image': true
    };
    this._super();
  }

});