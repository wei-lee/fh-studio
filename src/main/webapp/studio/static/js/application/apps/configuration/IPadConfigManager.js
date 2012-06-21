application.IPadConfigManager = application.IosConfigManager.extend({
  destination: 'ipad',
  
  init: function () {
    this._super();
    this.replaceOptions = {};
  }
});