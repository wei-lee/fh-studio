var App = App || {};
App.View = App.View || {};

App.View.CMSListFieldTopBar = App.View.CMS.extend({
  templates : {
    'cms_listfieldswitch' : '#cms_listfieldswitch',
    'cms_back' : '#cms_back'
  },
  initialize: function(options){
    this.compileTemplates();
  },
  render : function(options){
    this.$el.append(this.templates.$cms_back());
    this.$el.append('Drag fields to alter the structure');
    this.$el.append(this.templates.$cms_listfieldswitch());
    return this;
  }
});