var App = App || {};
App.View = App.View || {};

App.View.CMSListField = App.View.CMSSection.extend({
  initialize: function(options){
    this.constructor.__super__.initialize.apply(this, arguments);
  },
  render : function(options){
    this.constructor.__super__.render.apply(this, arguments);
    var top = new App.View.CMSListFieldTopBar();
    top.render().$el.insertAfter(this.$el.find('.middle .breadcrumb'));
    return this;
  }
});