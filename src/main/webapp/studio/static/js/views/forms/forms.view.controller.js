App.View.FormsController = Backbone.View.extend({
  events: {
    'click .btn-forms' : 'onForms',
    'click .btn-apps' : 'onApps',
    'click .btn-themes' : 'onThemes',
    'click .btn-edit-theme' : 'onEditTheme',
    'click .btn-submissions' : 'onSubmissions',
    'click .btn-groups' : 'onGroups',
    'click .btn-app-submissions' : 'onAppSubmissions',
    'click .btn-form-submissions' : 'onFormSubmissions',
    'click .btn-edit-form' : 'onEditForm',
    'click .btn-edit-form-rules' : 'onEditFormRules',
    'click .btn-edit-form-notifications' : 'onEditFormNotifications',
    'click .formapp-link' : 'onFormAppLoad',
    'click .btn-add-submission' : 'onAddSubmission',
    'click #printSubmission' : 'onPrintSubmission'
  },
  initialize : function(){


  },
  views : {},
  subViews : [],
  getActiveForms: function(){
    if(this.views.forms){
      return this.views.forms.listForms;
    } else {
      return {};
    }
  },
  getActiveThemes: function(){
    if(this.views.themes){
      return this.views.themes.listThemes;
    } else {
      return {};
    }
  },
  render: function(options) {
    var self = this;
    var userRoles = $fw.getUserProp("roles");
    this.$el.addClass('row formscontrollerdiv row-fluid');

    this.menu = new App.View.FormMenu();
    this.bind('menuchange', function(active){
      self.hideAll();
      self.active = active;
      self.back();
      self.menu.change.apply(self, arguments);
    });
    this.$el.append(this.menu.render().$el);

    // Show the default view on first render, forms

    if(userRoles && (userRoles.indexOf("formseditor") != -1 || userRoles.indexOf("formsadmin") != -1)){
      this.onForms();
    }else if(userRoles && (userRoles.indexOf("submissionsviewer") != -1 || userRoles.indexOf("submissionseditor") != -1)){
      this.onSubmissions();
    }

    return this;
  },
  onForms: function(){
    this.trigger('menuchange', 'forms');
    if (this.views.forms){
      this.views.forms.$el.remove();
    }
    this.views.forms = new App.View.FormListAll();
    this.$el.append(this.views.forms.render().$el);
  },
  onThemes : function(){
    this.trigger('menuchange', 'themes');
    if (this.views.themes){
      this.views.themes.$el.remove();
    }
    this.views.themes = new App.View.ThemeListAll();
    this.$el.append(this.views.themes.render().$el);
  },
  onEditTheme : function(e){
    var theme = this.getActiveThemes().collection.findWhere({_id : this.getActiveThemes()._id});
    this.views.themes.$el.hide();

    var editTheme = new App.View.FormThemesEdit({ theme : theme, collection : this.getActiveThemes().collection, readOnly : false});
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
    if (this.views.submissions){
      this.views.submissions.$el.remove();
    }
    this.views.submissions = new App.View.FormSubmissionsTabs({"forms": this.getActiveForms().collection});
    this.$el.append(this.views.submissions.render().$el);
  },
  onAppSubmissions : function(){
    this.onSubmissions();
    var view = this.views.submissions,
    appId = this.views.apps._id,
    e = { target : view.$el.find('a#perAppSubmissions') }; // spoof an event object so it can switch tab

    // Select this form in the dropdown and trigger the change event needed
    view.bind('perAppSubmissionsRendered', function(){
      view.$el.find('.appSelect').val(appId).trigger('change');
    });

    view.perAppSubmissions(e);
  },
  onFormSubmissions : function(){
    this.onSubmissions();
    var formId = this.getActiveForms()._id,
    view = this.views.submissions,
    e = { target : view.$el.find('a#perFormSubmissions') }; // spoof an event object so it can switch tab
    view.perFormSubmissions(e);
    // Select this form in the dropdown and trigger the change event needed
    view.$el.find('.formSelect').val(formId).trigger('change');
  },
  onGroups : function(){
    this.trigger('menuchange', 'groups');
    if (this.views.groups){
      this.views.groups.$el.remove();
    }
    this.views.groups= new App.View.FormGroupsList();
    this.$el.append(this.views.groups.render().$el);
  },
  /*
    Edit Form view switching
   */
  onEditForm : function(e){
    var form = this.getActiveForms().collection.findWhere({ _id : this.getActiveForms()._id }),
    menuEl = this.$el.find(".forms_menu_container");
    this.views.forms.$el.hide();

    var editForm = new App.View.FormEdit({ form : form, collection : this.getActiveForms().collection});
    editForm.bind('back', $.proxy(this.back, this));
    this.$el.append(editForm.render().$el);
    this.subViews.push(editForm);
  },
  onEditFormRules : function(e){
    var self = this;
    var form = this.getActiveForms().collection.findWhere({ _id : this.getActiveForms()._id }),
    menuEl = this.$el.find(".forms_menu_container");
    this.views.forms.$el.hide();

    var editFormRules = new App.View.EditFormRules({ form : form, $pagesMenuEl : menuEl, viewController: this });
    //this.editForm.bind('back', $.proxy(this.back, this));
    this.$el.append(editFormRules.render().$el);
    this.subViews.push(editFormRules);
  },
  onEditFormNotifications : function(e){
    var self = this;
    var form = this.getActiveForms().collection.findWhere({ _id : this.getActiveForms()._id });

    this.views.forms.$el.hide();

    var formNotifications = new App.View.FormNotifications({ form : form, _id : form.get('_id') });
    formNotifications.bind('back', $.proxy(this.back, this));
    this.$el.append(formNotifications.render().$el);
    this.subViews.push(formNotifications);


  },
  /*

   */
  back : function(){
    if (this.subViews && this.subViews.length > 0){
      var toHide = this.subViews.pop(),
      active = this.views[this.active];
      toHide.$el.remove();
      // If there's still items left in the stack, show it
      if (this.subViews.length>0){
        this.subViews[this.subViews.length-1].$el.show();
      }else if (active && active.$el){
        active.$el.show();
      }
    }
  },
  hideAll : function(){
    _.each(this.views, function(view){
      view.$el.hide();
    });
  },
  /*
    Jump to an app from the using this form dropdown
   */
  onFormAppLoad : function(e){
    var self = this,
    el = $(e.target),
    id = el.data('_id'),
    view, row;
    this.onApps();
    view = this.views.apps;
    view.bind('rendered', function(){
      row = view.$el.find($('tr[data-_id="' + id + '"]'));

      if (!row || !id){
        return;
      }

      row.nodeName = "tr";
      view.onRowSelected({ target : row });
    });

  },
  onAddSubmission: function(e){
    return this.onAddEditSubmission('add');
  },
  onEditSubmission : function(){
    return this.onAddEditSubmission('edit');
  },
  onAddEditSubmission : function(mode){
    var submissionsView = this.views.submissions,
    submissionsEl = submissionsView.$el,
    formId, appId, formModel, addEdit, submissionModel;



    if (mode === "edit"){
      submissionModel = submissionsView.submissions.index;
      submissionModel = submissionsView.submissions.collection.at(submissionModel);
      formId = submissionModel.get('formId');
      appId = submissionModel.get('appId');
      if (!submissionModel){
        return submissionsView.modal('Could not locate submission', 'Error');
      }
    }else if (mode==="add"){
      formId = submissionsEl.find('select.formSelect').val();
      appId = submissionsEl.find('select.appSelect').val();
    }

    formModel = this.getActiveForms().collection.findWhere({ "_id" : formId });

    if (!formModel){
      return submissionsView.modal('Please select a form', 'Error');
    }



    addEdit = new App.View.SubmissionsAddEdit({ form : formModel, submission : submissionModel, appId : appId });

    submissionsEl.hide();

    this.$el.append(addEdit.render().$el);
    addEdit.bind('back', $.proxy(this.back, this));
    this.subViews.push(addEdit);
  },
  onPrintSubmission: function(e) {
    e.preventDefault();
    window.print();
  }
});