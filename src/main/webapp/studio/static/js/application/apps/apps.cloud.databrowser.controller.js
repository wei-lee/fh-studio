var Apps = Apps || {};
Apps.Cloud = Apps.Cloud || {};
Apps.Cloud.Databrowser = Apps.Cloud.Databrowser || {};

Apps.Cloud.Databrowser.Controller = Apps.Cloud.Controller.extend({
  views: {
    container: "#databrowser_container",
  },
  init : function(){
    this._super();
  },
  show: function () {
    this._super(this.views.container);
    if (this.guid && this.guid === $fw.data.get('inst').guid
    && this.env && this.env === $fw.data.get('cloud_environment') && this.view){
      // Show the same view if we've already got it, and we haven't switched app - then exit completely
      return $(this.views.container).show();
    }else if (this.view){
      // otherwise, if we have a view already -> we've switched app, nuke the old one
      this.view.remove();
    }
    // Draw from scratch
    this.guid = $fw.data.get('inst').guid;
    this.env = $fw.data.get('cloud_environment');
    $(this.views.container).find('.fh-box-inner').empty();
    $(this.views.container).show();
    //this.view = new App.View.DataBrowserCollectionsList();
    this.view = new App.View.DataBrowserController();
    this.view.render();
    $(this.views.container).find('.fh-box-inner').append(this.view.el);
  }
});