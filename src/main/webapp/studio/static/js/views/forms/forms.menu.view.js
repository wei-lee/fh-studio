var App = App || {};
App.View = App.View || {};

App.View.FormMenu = App.View.Forms.extend({
  templates : {
    'formsMenu' : '#formsMenu'
  },
  initialize: function(){
    Handlebars.registerHelper("checkRole", function (req, options){
      console.log("required ", req);
      var reqRoles = req.split(",");
      var userRoles = $fw.getUserProp("roles");
      var hasPerm = false;
      for(var i =0; i < reqRoles.length; i++){
        if(userRoles.indexOf(reqRoles[i]) != -1){
          hasPerm = true;
          break;
        }
      }
      if(hasPerm)
        return options.fn(this);
      else{
        return false;
      }
    });
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