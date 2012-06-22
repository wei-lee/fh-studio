application.IPhoneConfigManager = application.IosConfigManager.extend({
  destination: 'iphone',
  
  init: function () {
    this._super();
    this.replaceOptions = {};
  }
});