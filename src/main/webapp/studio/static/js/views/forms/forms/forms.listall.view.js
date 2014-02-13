var App = App || {};
App.View = App.View || {};

App.View.FormListAll = Backbone.View.extend({


  events : {
    'click a#viewForm': 'formsTab',
    'click a#viewFormTemplates': 'formTemplatesTab'
  },

  initialize: function(){
    var self = this;

    if(self.listForms){
      self.listForms.remove();
    }
    if(self.listFormTemplates){
      self.listFormTemplates.remove();
    }
    self.formTemplatesCollection = new App.Collection.FormTemplate();
    self.formCollection = new App.Collection.Form();
  },

  render : function (){
    var self = this;
    self.formsTab();
    console.log("Render");
    return self;
  },
  formsTab: function () {
    var self = this;
    console.log("Render formsTab");

    if(self.listForms){
      self.listForms.remove();
    }
    if(self.listFormTemplates){
      self.listFormTemplates.remove();
    }

    self.listForms = new App.View.FormListParent({collection: self.formCollection, "formList": true});
    self.$el.append(self.listForms.render().$el);
  },

  formTemplatesTab: function () {
    var self = this;

    if(self.listForms){
      self.listForms.remove();
    }
    if(self.listFormTemplates){
      self.listFormTemplates.remove();
    }

    self.listFormTemplates = new App.View.FormListParent({collection: self.formTemplatesCollection, "formTemplateList": true});
    self.$el.append(self.listFormTemplates.render().$el);
  },

  "remove" : function (){
    if(self.listForms){
      self.listForms.remove();
    }
    if(self.listFormTemplates){
      self.listFormTemplates.remove();
    }
    Backbone.View.prototype.remove.call(this);
  }

});