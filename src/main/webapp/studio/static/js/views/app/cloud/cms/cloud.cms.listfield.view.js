var App = App || {};
App.View = App.View || {};

App.View.CMSListField = App.View.CMSSection.extend({
  events : {
    'click .btn-listfield-save' : 'onListFieldSave'
  },
  initialize: function(options){
    this.templates = _.extend(this.constructor.__super__.templates, {
      'cms_listfieldsavecancel' : '#cms_listfieldsavecancel'
    });
    this.constructor.__super__.initialize.apply(this, arguments);
  },
  render : function(){
    //TODO: Interrogate options.mode and choose the right view
    this.constructor.__super__.render.apply(this, arguments);

    // remove unused tabs
    this.$el.find('.fb-tabs li.configuresection').remove();
    if (this.options.mode === "data"){
      this.$el.find('.fb-tabs li.addfield').remove();
      this.$el.find('.fb-tabs li.configurefield').remove();
    }

    var top = new App.View.CMSListFieldTopBar(this.options);
    top.render().$el.insertAfter(this.$el.find('.middle .breadcrumb'));


    this.$el.find('.middle').append(this.templates.$cms_listfieldsavecancel());

    return this;
  },
  onListFieldSave : function(){
    debugger;
    //TODO: POST to server
  }
});