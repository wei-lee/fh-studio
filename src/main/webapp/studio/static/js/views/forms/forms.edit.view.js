var App = App || {};
App.View = App.View || {};

App.View.FormEdit = App.View.Forms.extend({
  templates : {
    formEditExtraTabs : '#formEditExtraTabs',
    formEditExtraTabsContent : '#formEditExtraTabsContent',
    formCreateEditForm : '#formCreateEditForm',
    formSaveCancel : '#formSaveCancel',
    form_back : '#form_back'
  },
  events : {
    'click .btn-add-form' : 'onCreateForm',
    'click tr' : 'onFormSelected',
    'keyup #formInputName' : 'updateNameDesc',
    'keyup #formTextareaDesc' : 'updateNameDesc',
    'click .btn-form-save' : 'onFormSave',
    'click .btn-form-cancel' : 'back',
    'click .btn-forms-back' : 'back'
  },
  initialize: function(options){
    this.constructor.__super__.initialize.apply(this, arguments);
    this.options = options;
  },
  render : function(){
    var self = this,
    fields;
    this.form = this.options.form;
    this.collection = this.options.collection;
    fields = this.formToFormBuilderFields(this.form);

    this.breadcrumb(['Forms', 'Forms List', 'Edit Form']);

    this.$el.empty();
    this.$el.addClass('span10 formedit');
    this.$fbEl = $('<div>');
    this.$el.append(this.$fbEl);

    // Also configure default FormBuilder field setup here to be inline with FH requirements
    this.fb = new Formbuilder(this.$fbEl, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: fields,
      eventFix : true,
      fields : [ 'text', 'paragraph', 'number', 'email', 'website', 'section_break', 'page_break' ] // TODO: Add the rest that we support here
    });

    this.$el.find('.fb-field-wrapper .subtemplate-wrapper').click(function (){
      self.$el.find('.fb-tabs li.configurefield a').trigger('click');
    });

    // Bug fix for multiple formbuilder views - unbind and re-bind the events
    var mv = this.fb.mainView;
    mv.$el.find('.fb-tabs a').unbind().on('click', $.proxy(mv.showTab, mv));

    // Place holders that get filled when the user clicks a form
    this.$fbEl.find('.middle').prepend('<p class="desc">' + this.form.get(this.CONSTANTS.FORM.DESC) + "</p>");
    this.$fbEl.find('.middle').prepend('<h4 class="heading">' + this.form.get(this.CONSTANTS.FORM.NAME) + '</h4>');
    this.$fbEl.find('.middle').prepend(this.templates.$form_back());

    this.$fbEl.find('.right .fb-tabs').append(this.templates.$formEditExtraTabs());
    this.$fbEl.find('.right .fb-tab-content').append(this.templates.$formEditExtraTabsContent());
    this.$fbEl.find('.right .fb-tab-content #formConfig').html(this.templates.$formCreateEditForm({ CONSTANTS: this.CONSTANTS }));

    this.$fbEl.find('.middle').removeClass('span6').addClass('span8');
    this.$fbEl.find('.right').removeClass('span4').addClass('span3');

    var configName = $(this.$fbEl.find('input[name="' + this.CONSTANTS.FORM.NAME + '"]')),
    configDesc = $(this.$fbEl.find('textarea[name="' + this.CONSTANTS.FORM.DESC + '"]'));
    configName.val(this.form.get(this.CONSTANTS.FORM.NAME));
    configDesc.val(this.form.get(this.CONSTANTS.FORM.DESC));

    this.$el.append(this.templates.$formSaveCancel());



    return this;
  },
  updateNameDesc : function(e){
    var el = $(e.target);
    if (el.attr('id')==='formInputName'){
      this.$el.find('.middle h4.heading').html(el.val());
    }else{
      this.$el.find('.middle p.desc').html(el.val());
    }
  },
  onFormSave : function(){
    var self = this,
    curPage = {},
    pages = [];

    curPage[this.CONSTANTS.FORM.FIELDS] = [];

    this.fb.mainView.collection.each(function(f, i, coll){
      if (f.get(self.CONSTANTS.FB.FIELD_TYPE) === 'page_break'){ //TODO CONST
        pages.push(curPage);
        curPage = {};
        curPage[self.CONSTANTS.FORM.FIELDS] = [];
      }
      curPage[self.CONSTANTS.FORM.FIELDS].push(f.toJSON());
      if (i === coll.length-1){
        pages.push(curPage);
      }
    });

    this.form.set(this.CONSTANTS.FORM.PAGES, pages);
    this.form.set(this.CONSTANTS.FORM.NAME, this.$el.find('#formInputName').val());
    this.form.set(this.CONSTANTS.FORM.DESC, this.$el.find('#formTextareaDesc').val());
    this.collection.sync('update', this.form.toJSON(), { success : function(){
      self.trigger('back');
      self.message('Form updated successfully');
    }});
  },
  back : function(){
    this.trigger('back');
  }
});