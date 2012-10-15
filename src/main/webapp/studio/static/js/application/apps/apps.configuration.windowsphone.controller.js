var Apps = Apps || {};

Apps.Configuration = Apps.Configuration || {};
Apps.Configuration.Windowsphone = Apps.Configuration.Windowsphone || {};

Apps.Configuration.Windowsphone.Controller = Apps.Configuration.Support.extend({
  destination: 'windowsphone7',

  init: function () {
    this._super();
    this.hiddenOptions = {'auto Rotate': true, 'flurry Application Key': true, 'orientation':true, 'status':true, 'version Name':true};
  }

});