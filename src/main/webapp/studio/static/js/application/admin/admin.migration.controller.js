var Admin = Admin || {};

Admin.Migration = Admin.Migration || {};

Admin.Migration.Controller = Controller.extend({
  models: {
    app: new model.App()
  },

  views: {
    container: '#admin_migration'
  },

  container: null,
  showPreview: true,

  init: function() {},

  show: function() {
    this._super();

    console.log('admin migration show');

    this.hide();
    this.container = this.views.container;

    // this.view = new App.View.MigrateApp();
    // this.view.render();
    // $('.fh-box-inner', this.container).html(this.view.el);

    $(this.container).show();
  }
});