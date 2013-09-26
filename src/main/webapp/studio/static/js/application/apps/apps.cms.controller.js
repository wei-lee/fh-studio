var Apps = Apps || {};
Apps.Cms = Apps.Cms || {};

Apps.Cms.Controller = Apps.Cloud.Controller.extend({
  container: '#cms_container',
  init: function() {
    this._super();
    this.initCloudFn();
  },
  show: function(e) {
    var self = this,
    box_container = $($(this.container).find('.fh-box-inner'));
    $(this.container).show();
//    if (this.view){
//      return;
//    }
    this.view = new App.View.CMSController({ container : this.container });
    box_container.empty().append(this.view.render().$el);
  }
});