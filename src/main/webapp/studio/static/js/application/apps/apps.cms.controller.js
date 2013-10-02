var Apps = Apps || {};
Apps.Cms = Apps.Cms || {};

Apps.Cms.Controller = Apps.Cloud.Controller.extend({
  views : {
    container: '#cms_container'
  },
  init: function() {
    this._super();
    this.initCloudFn();
  },
  show: function(e) {
    var self = this,
    box_container = $($(this.views.container).find('.fh-box-inner'));
    $(this.views.container).show();
    if (this.view){
      return; //this.view.remove();
    }
    this.view = new App.View.CMSController({ container : this.views.container, mode : $fw.data.get('cloud_environment') });
    box_container.empty().append(this.view.render().$el);
  }
});