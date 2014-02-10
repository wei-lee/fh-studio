var App = App || {};
App.View = App.View || {};

App.View.ThemeListAll = Backbone.View.extend({


  events : {
    'click a#viewTheme': 'themesTab',
    'click a#viewThemeTemplates': 'themeTemplatesTab'
  },

  initialize: function(){
    var self = this;

    if(self.listThemes){
      self.listThemes.remove();
    }
    if(self.listThemeTemplates){
      self.listThemeTemplates.remove();
    }
    self.formThemeTemplateListCollection = new App.Collection.FormThemeTemplate();
    self.formThemeListCollection = new App.Collection.FormThemes();
  },

  render : function (){
    this.themesTab();
    return this;
  },

  themesTab: function () {
    var self = this;

    if(self.listThemes){
      self.listThemes.remove();
    }
    if(self.listThemeTemplates){
      self.listThemeTemplates.remove();
    }

    self.listThemes = new App.View.FormThemesListParent({collection: self.formThemeListCollection, "themeList": true});
    self.$el.append(self.listThemes.render().$el);
  },

  themeTemplatesTab: function () {
    var self = this;

    if(self.listThemes){
      self.listThemes.remove();
    }
    if(self.listThemeTemplates){
      self.listThemeTemplates.remove();
    }

    self.listThemeTemplates = new App.View.FormThemesListParent({collection: self.formThemeTemplateListCollection, "themeTemplateList": true});
    self.$el.append(self.listThemeTemplates.render().$el);
  },

  "remove" : function (){
    if(self.listThemes){
      self.listThemes.remove();
    }
    if(self.listThemeTemplates){
      self.listThemeTemplates.remove();
    }
    Backbone.View.prototype.remove.call(this);
  }

});