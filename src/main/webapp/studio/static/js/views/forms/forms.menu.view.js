var App = App || {};
App.View = App.View || {};

App.View.FormMenu = App.View.Forms.extend({
  templates : {
    'formsMenu' : '#formsMenu'
  },
  initialize: function(){

    this.compileTemplates();
  },
  render : function(){
    var menu = this.templates.$formsMenu();
    this.$el.append(menu);
    return this;
  },
  change : function(active){
    this.$el.find('li').removeClass('active');
    this.$el.find('.btn-' + active).parent().addClass('active');
  }
});