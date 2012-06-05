application.NokiawrtConfigManager = application.ConfigurationManager.extend({
  destination: 'nokiawrt',
  
  init: function () {
    this._super();
    this.hiddenOptions = {'auto Rotate': true, 'flurry Application Key': true, 'orientation':true, 'status':true, 'version Name':true, 'splash Image': true, 'remote Debug': true};
  }
});