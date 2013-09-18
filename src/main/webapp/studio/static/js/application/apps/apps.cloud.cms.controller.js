var Apps = Apps || {};
Apps.Cloud = Apps.Cloud || {};
Apps.Cloud.CMS = Apps.Cloud.CMS || {};

Apps.Cloud.CMS.Controller = Apps.Cloud.Controller.extend({
  container: '#cms_container',
  init: function() {
    this._super();
  },
  show: function(e, showClientCloudOptions) {
    var self = this;
    this.view = new App.View.CMS();
    $(this.container).append(this.view.render().$el);
  }
});