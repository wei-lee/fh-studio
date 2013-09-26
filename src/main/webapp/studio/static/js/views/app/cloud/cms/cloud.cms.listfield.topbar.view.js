var App = App || {};
App.View = App.View || {};

App.View.CMSListFieldTopBar = App.View.CMS.extend({
  templates : {
    'cms_listfieldswitch' : '#cms_listfieldswitch',
    'cms_listfieldEditDataTopButtons' : '#cms_listfieldEditDataTopButtons',
    'cms_back' : '#cms_back'
  },
  initialize: function(options){
    this.options = options;
    this.compileTemplates();
  },
  render : function(options){
    this.$el.append(this.templates.$cms_back());
    if (this.options.mode === 'structure'){
      this.$el.append(this.templates.$cms_listfieldEditDataTopButtons());
    }else{
      this.$el.append('<span>Drag fields to alter the structure</span>');
    }
    this.$el.append(this.templates.$cms_listfieldswitch());
    return this;
  }
});