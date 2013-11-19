var Forms = Forms || {};
Forms.Tab = Forms.Tab || {};

Forms.Tab.Manager = Tab.Manager.extend({
  
  id: 'forms_layout',
  views: {
    container: '#forms_container'
  },
  init: function() {
    this._super();
    this.initFn = _.once(this.initBindings);
  },
  show : function(){
    this._super();

    // Just shelling out the a Backbone ViewController here, skipping studio view controllers altogether
    if (!this.view){
      $(this.views.container).empty();
      this.view = new App.View.FormsController();
      this.view.render();
      $(this.views.container).append(this.view.$el);
    }else{
      this.view.$el.show();
    }
  }
});