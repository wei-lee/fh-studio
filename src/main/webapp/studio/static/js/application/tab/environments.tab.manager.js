var Cloudenvironments = Cloudenvironments || {};
Cloudenvironments.Tab = Cloudenvironments.Tab || {};

Cloudenvironments.Tab.Manager = Tab.Manager.extend({
  
  id: 'cloud_environments_layout',
  
  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function () {
    var self = this;
    var el = $('#' + this.id);
    self.enableNav();

    var navList = el.find('.nav-tabs');

    navList.find('li a:eq(0)').trigger('click');
  }
});