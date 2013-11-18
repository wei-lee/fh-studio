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
  menuItem : 'forms', // TODO: Trigger events maybe to change if he's active or not..?
  render: function(options) {
    var self = this;

    this.$el.addClass('row formscontrollerdiv');

    this.menu = new App.View.FormMenu();
    this.$el.append(this.menu.render().$el);

    this.forms = new App.View.FormList();
    this.$el.append(this.forms.render().$el);
    return this;
  },
  onForms: function(){
    this.menuItem = 'forms';
    this.forms.$el.show();
    if (this.editForm){
      this.editForm.$el.hide();
    }
  },
  onThemes : function(){
    this.menuItem = 'themes';
  },
  onApps : function(){
    this.menuItem = 'apps';
  },
  onSubmissions : function(){
    this.menuItem = 'submissions';
  },
  /*
    Edit Form view switching
   */
  onEditForm : function(e){
    var form = this.forms.collection.at(this.forms.currentForm),
    menuEl = this.$el.find(".forms_menu_container");
    this.forms.$el.hide();

    this.editForm = new App.View.FormEdit({ form : form, collection : this.forms.collection, $pagesMenuEl : menuEl });
    this.editForm.bind('back', $.proxy(this.back, this));
    this.$el.append(this.editForm.render().$el);
  },
  onEditFormRules : function(e){
    var form = this.forms.collection.at(this.forms.currentForm),
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
    this[this.menuItem].$el.show();
  }
});