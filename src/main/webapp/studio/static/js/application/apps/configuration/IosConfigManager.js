application.IosConfigManager = application.ConfigurationManager.extend({  
  destination: "ios",
  init: function () {
    this._super();
    this.replaceOptions = {"packages": true, "auto Rotate": true, "hide Status Bar": true, "landscape splash image": true, "orientation": true, "portrait splash image": true, "retina splash image": true, "splash Image": true};
  }
});