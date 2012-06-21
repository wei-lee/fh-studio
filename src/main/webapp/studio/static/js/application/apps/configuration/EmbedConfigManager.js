application.EmbedConfigManager = application.ConfigurationManager.extend({
  destination: 'embed',
  
  init: function () {
    this._super();
  }
});