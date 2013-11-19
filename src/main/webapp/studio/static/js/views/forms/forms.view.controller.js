App.View.FormsController = Backbone.View.extend({
  events: {
    'click .btn-forms' : 'onForms',
    'click .btn-apps' : 'onApps',
    'click .btn-themes' : 'onThemes',
    'click .btn-submissions' : 'onSubmissions',
    'click .btn-edit-form' : 'onEditForm',
    'click .btn-edit-form-rules' : 'onEditFormRules',
    'click .btn-view-form-submissions' : 'onViewFormSubmissions',
    'click .btn-view-form-apps' : 'onViewAppsUsingThisForm'
  },
  initialize : function(){},
  render: function(options) {
    var self = this;

    this.$el.addClass('row formscontrollerdiv');

    this.menu = new App.View.FormMenu();
    this.bind('menuchange', function(active){
      self.active = active;
      self.menu.change.apply(self, arguments);
    });
    this.$el.append(this.menu.render().$el);

    this.forms = new App.View.FormList();
    this.$el.append(this.forms.render().$el);
    this.trigger('menuchange', 'forms');

    return this;
  },
  onForms: function(){
    this.trigger('menuchange', 'forms');
    this.forms.$el.show();
    if (this.editForm){
      this.editForm.$el.hide();
    }
    if (this.themes){
      this.themes.$el.hide();
    }
    if (this.editFormRules){
      this.editFormRules.$el.hide();
    }
  },
  onThemes : function(){
    this.trigger('menuchange', 'themes');
    this.trigger('menuchange', 'themes');
    if (this.themes){
      this.themes.$el.remove();
    }

    this.themes = new App.View.ThemeList();
    this.$el.append(this.themes.render().$el);
    this.forms.$el.hide();
    if (this.editFormRules){
      this.editFormRules.$el.hide();
    }
  },
  onApps : function(){
    this.trigger('menuchange', 'apps');
  },
  onSubmissions : function(){
    this.trigger('menuchange', 'submissions');
  },
  /*
    Edit Form view switching
   */
  onEditForm : function(e){
    var form = this.forms.collection.at(this.forms.index),
    menuEl = this.$el.find(".forms_menu_container");
    this.forms.$el.hide();

    if (this.editFormRules){
      this.editFormRules.$el.hide();
    }


    this.editForm = new App.View.FormEdit({ form : form, collection : this.forms.collection, $pagesMenuEl : menuEl });
    this.editForm.bind('back', $.proxy(this.back, this));
    this.$el.append(this.editForm.render().$el);
  },
  onEditFormRules : function(e){
    var form = this.forms.collection.at(this.forms.index),
    menuEl = this.$el.find(".forms_menu_container");
    this.forms.$el.hide();

    this.editFormRules = new App.View.FormFieldRules({ form : form, collection : this.forms.collection, $pagesMenuEl : menuEl });
    //this.editForm.bind('back', $.proxy(this.back, this));
    this.$el.append(this.editFormRules.render().$el);
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
    _.each([this.editForm], function(view){
      if (view && view.$el){
        view.$el.hide();
      }
    });
    this[this.active].$el.show();
  }
});