var App = App || {};
App.View = App.View || {};

App.View.CMS = Backbone.View.extend({
  initialize: function(){
    this.compileTemplates();
  },
  cmsBreadcrumb : function(path){
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
  alertMessage : function(msg, cls, cb){
    cls = cls || 'success';
    msg = msg || 'Save successful';

    var cms_alert = Handlebars.compile($('#cms_alert').html()),
    alertBox = $(cms_alert({ cls : cls, msg : msg })),
    el = this.$el.find('.middle');


    if (!el || (el.length && el.length ===0)){
      el = this.$el;
    }

    $(el).prepend(alertBox);

    // Fade out then remove our message
    setTimeout(function(){
      alertBox.fadeOut('fast', function(){
        if (typeof cb === 'function'){
          cb();
        }
        alertBox.remove();
      });
    }, 3000);
  }
});