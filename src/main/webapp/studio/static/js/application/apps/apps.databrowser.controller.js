var Apps = Apps || {};

Apps.Databrowser = Apps.Databrowser || {};

Apps.Databrowser.Controller = Apps.Controller.extend({
  views: {
    container: "#databrowser_container"
  },
  init : function(){
    this._super();
  },
  show: function () {
    this._super(this.views.container);
    if (!this.view){
      $(this.views.container).empty().show();
      //this.view = new App.View.DataBrowserCollectionsList();
      this.view = new App.View.DataBrowserController();
      this.view.render();
      $(this.views.container).append(this.view.el);
    }else{
      this.view.show();
    }
  }
});