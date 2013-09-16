var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};
Apps.Configuration.Ios = Apps.Configuration.Ios || {};

Apps.Configuration.Ios.Controller = Apps.Configuration.Support.extend({
  destination: 'ios',

  init: function() {
    // Affects both iPhone and iPad config (which is fine)
    this.hiddenOptions = {
      "landscape splash image": true,
      "portrait splash image": true,
      "retina splash image": true,
      "iphone5 Retina Splash Image": true,
      "splash Image": true,
      "ipad Retina Splash Image": true,
      "ipad Landscape Retina Splash Image": true
    };

    this._super();
    this.replaceOptions = {
      "packages": true,
      "auto Rotate": true,
      "hide Status Bar": true,
      "orientation": true,
    };
  }
});