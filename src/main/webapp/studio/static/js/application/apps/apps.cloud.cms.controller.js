var Apps = Apps || {};
Apps.Cloud = Apps.Cloud || {};
Apps.Cloud.Cms = Apps.Cloud.Cms|| {};
var CMS_TOPICS = App.dispatch.topics.CMS;

Apps.Cloud.Cms.Controller = Apps.Cloud.Controller.extend({
  views : {
    container: '#cms_container'
  },
  init: function() {
    this._super();
  },
  show: function(e) {
    this._super(this.views.container);
    var self = this,
    box_container = $($(this.views.container).find('.fh-box-inner'));
    $(this.views.container).show();
    if (this.view){
      this.view.remove();
      this.view.stopListening(); // TODO Does this still cause issues with formbuilder?
    }
    this.view = new App.View.CMSController({ container : this.views.container, mode : $fw.data.get('cloud_environment') });
    box_container.empty().append(this.view.render().$el);
  }
});