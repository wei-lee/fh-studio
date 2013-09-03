var Cloudenvironments = Cloudenvironments || {};

Cloudenvironments.Controller = Cloudenvironments.Controller || {};

Cloudenvironments.Controller = Apps.Controller.extend({
  init: function() {},

  show: function(el) {
    $(this.views.container).empty();
    $(this.views.container).show();
    
    var cloudEnvs = new Cloudenvironments.Collection.Environments();
    if(!this.view){
      console.log("Overview constructed");
      this.view = new Cloudenvironments.View.Overview({
        collection: cloudEnvs,
        el: $('#cloudenvironments_accordion')[0]
      });
    }
  }
});