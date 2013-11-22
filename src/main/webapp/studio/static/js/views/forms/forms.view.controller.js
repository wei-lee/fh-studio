App.View.FormsController = Backbone.View.extend({
  events: {
    'click .btn-forms' : 'onForms',
    'click .btn-apps' : 'onApps',
    'click .btn-themes' : 'onThemes',
    'click .btn-edit-theme' : 'onEditTheme',
    'click .btn-submissions' : 'onSubmissions',
    'click .btn-edit-form' : 'onEditForm',
    'click .btn-edit-form-rules' : 'onEditFormRules',
    'click .btn-view-form-submissions' : 'onViewFormSubmissions',
    'click .btn-view-form-apps' : 'onViewAppsUsingThisForm'
  },
  initialize : function(){},
  views : {},
  subViews : [],
  render: function(options) {
    var self = this;

    this.$el.addClass('row formscontrollerdiv');

    this.menu = new App.View.FormMenu();
    this.bind('menuchange', function(active){
      self.hideAll();
      self.active = active;
      self.back();
      self.menu.change.apply(self, arguments);
    });
    this.$el.append(this.menu.render().$el);

    // Show the default view on first render, forms
    this.onForms();

    return this;
  },
  onForms: function(){
    this.trigger('menuchange', 'forms');
    if (this.views.forms){
      this.views.forms.$el.remove();
    }
    this.views.forms = new App.View.FormList();
    this.$el.append(this.views.forms.render().$el);
  },
  onThemes : function(){
    this.trigger('menuchange', 'themes');
    if (this.views.themes){
      this.views.themes.$el.remove();
    }
    this.views.themes = new App.View.FormThemesList();
    this.$el.append(this.views.themes.render().$el);
  },
  onEditTheme : function(e){
    var theme = this.views.themes.collection.at(this.views.themes.index);
    this.views.themes.$el.hide();

    var editTheme = new App.View.FormThemesEdit({ theme : theme, collection : this.views.themes.collection, readOnly : false});
    editTheme.bind('back', $.proxy(this.back, this));
    this.$el.append(editTheme.render().$el);
    this.subViews.push(editTheme);
  },
  onApps : function(){
    this.trigger('menuchange', 'apps');
    if (this.views.apps){
      this.views.apps.$el.remove();
    }
    this.views.apps = new App.View.FormAppsList();
    this.$el.append(this.views.apps.render().$el);
  },
  onSubmissions : function(){
    this.trigger('menuchange', 'submissions');
  },
  /*
    Edit Form view switching
   */
  onEditForm : function(e){
    var form = this.views.forms.collection.at(this.views.forms.index),
    menuEl = this.$el.find(".forms_menu_container");
    this.views.forms.$el.hide();

    var editForm = new App.View.FormEdit({ form : form, collection : this.views.forms.collection});
    editForm.bind('back', $.proxy(this.back, this));
    this.$el.append(editForm.render().$el);
    this.subViews.push(editForm);
  },
  onEditFormRules : function(e){
    var self = this;
    var form = this.views.forms.collection.at(this.views.forms.index),
    menuEl = this.$el.find(".forms_menu_container");
    this.views.forms.$el.hide();

    var editFormRules = new App.View.FormFieldRules({ form : form, $pagesMenuEl : menuEl });
    //this.editForm.bind('back', $.proxy(this.back, this));
    this.$el.append(editFormRules.render().$el);
    this.subViews.push(editFormRules);


  },
  onViewFormSubmissions : function(e){
    //TODO
  },
  onViewAppsUsingThisForm : function(e){
    //TODO
  },
  /*

   */
  back : function(){
    // TODO - update breadcrumb
    if (this.subViews && this.subViews.length > 0){
      var toHide = this.subViews.pop();
      toHide.$el.remove();
      // If there's still items left in the stack, show it
      if (this.subViews.length>0){
        this.subViews[this.subViews.length-1].$el.show();
      }else{
        this.views[this.active].$el.show();
      }
    }
  },
  hideAll : function(){
    _.each(this.views, function(view){
      view.$el.hide();
    });
  }
});