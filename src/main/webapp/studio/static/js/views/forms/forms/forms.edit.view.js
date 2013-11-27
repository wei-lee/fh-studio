var App = App || {};
App.View = App.View || {};

App.View.FormEdit = App.View.Forms.extend({
  templates : {
    formEditExtraTabs : '#formEditExtraTabs',
    formEditExtraTabsContent : '#formEditExtraTabsContent',
    formCreateEditForm : '#formCreateEditform',
    formSaveCancel : '#formSaveCancel',
    form_back : '#form_back',
    previewOutline : '#preview_outline',
    fullpageLoading : '#fullpageLoading'
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
      addAt : 'last',
      fields : [ 'text', 'paragraph', 'number', 'email', 'website', 'dropdown', 'radio', 'checkboxes', 'location', 'map', 'file', 'photo', 'signature', 'autodate', 'section_break', 'page_break' ] // TODO: Add the rest that we support here
    });

    this.fb.collection.bind('add', function(model){
      self.updatePreview.apply(self, arguments);
      model.set('_id', model.cid);
      if (model.get(self.CONSTANTS.FB.FIELD_TYPE)===self.CONSTANTS.FORM.PAGE_BREAK){
        self.reorder.render();
      }
    });
    this.fb.collection.bind('change', function(model){
      self.updatePreview.apply(self, arguments);
      if (model.get(self.CONSTANTS.FB.FIELD_TYPE)===self.CONSTANTS.FORM.PAGE_BREAK){
        self.reorder.render();
      }
    });
    this.fb.collection.bind('remove', function(model){
      self.updatePreview.apply(self, arguments);
      if (model.get(self.CONSTANTS.FB.FIELD_TYPE)===self.CONSTANTS.FORM.PAGE_BREAK){
        self.reorder.render();
      }
    });
    this.fb.collection.bind('remove', $.proxy(this.updatePreview, this));

    this.$el.find('.fb-field-wrapper .subtemplate-wrapper').click(function (){
      self.$el.find('.fb-tabs li.configurefield a').trigger('click');
    });

    this.reorder = new App.View.FormEditReorder({ form: this.form, fb : this.fb, $fbEl : this.$fbEl });
    this.$el.prepend(this.reorder.render().$el);

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

    this.$fbEl.find('#formPreview').html(this.templates.$previewOutline());
    this.updatePreview();

    this.$fbEl.find('.middle').removeClass('span6').addClass('span7');
    this.$fbEl.find('.right').removeClass('span4').addClass('span3');

    var configName = $(this.$fbEl.find('input[name="' + this.CONSTANTS.FORM.NAME + '"]')),
    configDesc = $(this.$fbEl.find('textarea[name="' + this.CONSTANTS.FORM.DESC + '"]'));
    configName.val(this.form.get(this.CONSTANTS.FORM.NAME));
    configDesc.val(this.form.get(this.CONSTANTS.FORM.DESC));

    this.$el.find('.middle').append(this.templates.$formSaveCancel());

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
    curPage,
    pages = [],
    first = this.fb.collection.at(0);

    this.loading = $(this.templates.$fullpageLoading());
    this.$el.append(this.loading).addClass('busy');
    self.reorder.$el.hide();
    self.$fbEl.hide();

    this.fb.collection.each(function(f, i, coll){
      // For every page break - except the first, that's just a UI thing..
      if (f.get(self.CONSTANTS.FB.FIELD_TYPE) === self.CONSTANTS.FORM.PAGE_BREAK){
        if (curPage){
          pages.push(_.clone(curPage));
        }
        curPage = {};
        var p = f.toJSON();
        delete p.cid;
        delete p.fieldOptions;
        delete p.value;
        delete p.required;
        delete p.type;
        _.extend(curPage, p);
        curPage[self.CONSTANTS.FORM.FIELDS] = [];
      }else{
        curPage[self.CONSTANTS.FORM.FIELDS].push(f.toJSON());
      }
    });
    // Push the last page
    pages.push(curPage);

    this.form.set(this.CONSTANTS.FORM.PAGES, pages);
    this.form.set(this.CONSTANTS.FORM.NAME, this.$el.find('#formInputName').val());
    this.form.set(this.CONSTANTS.FORM.DESC, this.$el.find('#formTextareaDesc').val());
    this.collection.sync('update', this.form.toJSON(), { success : function(){
      self.fb.collection.reset([]);
      self.back();
      self.message('Form updated successfully');
    }, error : function(){
      self.$el.removeClass('busy');
      self.loading.remove();
      self.reorder.$el.show();
      self.$fbEl.show();
      self.message('Error updating form', 'danger');
    }});
  },
  back : function(){
    this.trigger('back');
  },
  updatePreview: function(){
    var html = $(this.$el.find('.fb-response-fields').html());
    html.find('.actions-wrapper').remove();
    this.$el.find('.formPreviewContents').html(html);
  }
});