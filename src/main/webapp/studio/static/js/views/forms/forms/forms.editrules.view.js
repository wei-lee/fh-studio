var App = App || {};
App.View = App.View || {};

App.View.EditFormRules = Backbone.View.extend({


  events : {
    'click a#fieldRules': 'fieldRulesTab',
    'click a#pageRules': 'pageRulesTab',
    'click .btn-forms-back':'goBack'
  },

  render : function (){
    this.fieldRulesTab();
    return this;
  },

  goBack : function (){
    console.log("called go back");
    this.options.viewController.back();
    return;
  },

  fieldRulesTab: function () {
    var self = this;
    if(this.editPageRules){
      this.editPageRules.remove();
    }
    if(this.editFormRules){
      this.editFormRules.remove();
    }

    this.editFormRules = new App.View.FormFieldRules({ form: self.options.form, $pagesMenuEl: self.options.$pagesMenuEl });
    //this.editForm.bind('back', $.proxy(this.back, this));

    self.$el.html(this.editFormRules.render().$el);
    self.$el.find('a#fieldRules').parent('li').addClass("active");
    self.$el.find('a#pageRules').parent('li').removeClass("active");

  },

  pageRulesTab: function () {
    var self = this;
    if(this.editFormRules){
      this.editFormRules.remove();
    }
    if(this.editPageRules){
      this.editPageRules.remove();
    }
    this.editPageRules = new App.View.FormPageRules({form: self.options.form, $pagesMenuEl: self.options.$pagesMenuEl});
    self.$el.html(this.editPageRules.render().$el);
    self.$el.find('a#fieldRules').parent('li').removeClass("active");
    self.$el.find('a#pageRules').parent('li').addClass("active");
  },

  "remove" : function (){
    if(this.editPageRules){
      this.editPageRules.remove();
    }
    if(this.editFormRules){
      this.editFormRules.remove();
    }
    Backbone.View.prototype.remove.call(this);

  }

});