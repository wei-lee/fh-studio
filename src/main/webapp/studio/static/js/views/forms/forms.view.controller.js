App.View.FormsController = Backbone.View.extend({
  events: {
    'click .btn-forms' : 'onForms',
    'click .btn-apps' : 'onApps',
    'click .btn-themes' : 'onThemes',
    'click .btn-submissions' : 'onSubmissions',
    'click .btn-edit-form' : 'onEditForm'
  },
  initialize : function(){},
  menuItem : 'forms', // TODO: Trigger events maybe to change if he's active or not..?
  render: function(options) {
    var self = this;

    this.menu = new App.View.FormMenu();
    this.$el.append(this.menu.render().$el);

    this.formsList = new App.View.FormList();
    this.$el.append(this.formsList.render().$el);
    return this;
  },
  onForms: function(){
    this.menuItem = 'forms';
    this.formsList.$el.show();
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
  onEditForm : function(e){
    var form = this.formsList.collection.at(this.formsList.currentForm);
    this.formsList.$el.hide();
    this.editForm = new App.View.FormEdit({ form : form });
    this.$el.append(this.editForm.render().$el);
  }
});