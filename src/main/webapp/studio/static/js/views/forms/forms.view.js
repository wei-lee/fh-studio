var App = App || {};
App.View = App.View || {};

App.View.Forms = Backbone.View.extend({
  initialize: function(){
    this.compileTemplates();
  },
  formsBreadcrumb : function(path){
    var crumbs = [];
    crumbs.push('<ul class="breadcrumb">');
    _.each(path.split('.'), function(crumb, index, list){
      if (index === list.length-1){
        crumbs.push('<li class="active">' + crumb  + '</li>');
      }else{
        crumbs.push('<li><a href="#">' + crumb + '</a> <span class="divider">/</span></li>');
      }
    });
    crumbs.push('</ul>');
    return crumbs.join('');
  },
  modal : function(msg, title){
    title = title || 'Confirm';
    this.modalView = new App.View.Modal({
      body : msg,
      title : title,
      cancelText : false
    });
    this.$el.append(this.modalView.render().$el);
  },
  formToFormBuilderFields : function(form){
    var fields = [];
    _.each(form.Pages, function(p){
      _.each(p.Fields, function(f){
        fields.push({
          label :f.Title,
          value :f.DefaultVal,
          field_type : f.Type
        });
      });
    });
    return fields;
  }
});