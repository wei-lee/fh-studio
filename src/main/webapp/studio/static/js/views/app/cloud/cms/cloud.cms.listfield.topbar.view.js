App = App || {};
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
    var back = $(this.templates.$cms_back()).addClass('btn-small');
    this.$el.append(back);
    if (this.options.mode === 'data'){
      this.$el.append(this.templates.$cms_listfieldEditDataTopButtons());
    }else{
      this.$el.append('<span>Drag fields to alter the structure</span>');
    }
    this.$el.append(this.templates.$cms_listfieldswitch());
    if (!this.options.isAdministrator){
      this.$el.find('.btn-listfield-change-structure').remove();
    }

    return this;
  }
});
