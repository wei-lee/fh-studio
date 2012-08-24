var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};
Apps.Configuration.Nokiawrt = Apps.Configuration.Nokiawrt || {};

Apps.Configuration.Nokiawrt.Controller = Apps.Configuration.Support.extend({
  destination: 'nokiawrt',

  init: function () {
    this._super();
    this.hiddenOptions = {'auto Rotate': true, 'flurry Application Key': true, 'orientation':true, 'status':true, 'version Name':true, 'splash Image': true, 'remote Debug': true};
  }

});