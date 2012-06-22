application.Windowsphone7ConfigManager = application.ConfigurationManager.extend({
  destination: 'windowsphone7',
  
  init: function () {
    this._super();
    this.hiddenOptions = {'auto Rotate': true, 'flurry Application Key': true, 'orientation':true, 'status':true, 'version Name':true};
  }
});