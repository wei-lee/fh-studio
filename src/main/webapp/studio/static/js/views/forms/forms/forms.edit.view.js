var App = App || {};
App.View = App.View || {};

App.View.FormEdit = App.View.Forms.extend({
  templates: {
    formEditExtraTabs: '#formEditExtraTabs',
    formEditExtraTabsContent: '#formEditExtraTabsContent',
    formCreateEditForm: '#formCreateEditform',
    formSaveCancel: '#formSaveCancel',
    form_back: '#form_back',
    previewOutline: '#preview_outline',
    fullpageLoading: '#fullpageLoading',
    themeselect:'#theme_select'
  },
  events: {
    'click .btn-add-form': 'onCreateForm',
    'click tr': 'onFormSelected',
    'keyup #formInputName': 'updateNameDesc',
    'keyup #formTextareaDesc': 'updateNameDesc',
    'click .btn-form-save': 'onFormSave',
    'click .btn-form-cancel': 'back',
    'click .btn-forms-back': 'back',
    'change #themeSelect' : 'themeSelect',
    'change input.minReps': 'checkMinReps'
  },

  initialize: function (options) {
    this.constructor.__super__.initialize.apply(this, arguments);
    this.options = options;
  },
  render: function () {
    var self = this,
      fields;
    this.form = this.options.form;
    this.collection = this.options.collection;
    this.themes = new App.Collection.FormThemes();

    fields = this.formToFormBuilderFields(this.form);

    this.themes.fetch({"success": function (themes) {
      self.$el.find('#formPreview').find('#themeSelect').remove();
      var templateThemes = [];
      if(themes){
        themes.forEach(function (th){
          templateThemes.push({
            "_id":th.get("_id"),
            "name":th.get("name")
          });
        });
        self.$el.find('#formPreview').append(self.templates.$themeselect({"themes":templateThemes}));
      }
    }, "error": function (er) {
      console.log("themes error ", er);
    }});


    this.breadcrumb(['Forms', 'Forms List', 'Edit Form']);

    this.$el.empty();
    this.$el.addClass('span10 formedit');


    this.$fbEl = $('<div>');
    this.$el.append(this.$fbEl);

    // Also configure default FormBuilder field setup here to be inline with FH requirements
    this.fb = new Formbuilder(this.$fbEl, {
      noScroll: true,
      noEditOnDrop: true,
      bootstrapData: fields,
      eventFix: true,
      addAt: 'last',
      fields: self.CONSTANTS.FB.SUPPORTED_FIELDS
    });


    var fb = this.fb;

    this.fb.mainView.on("reorder", function (){
       console.log("form reordered");
      self.syncModelAndFormBuilder();
      self.updatePreview();
    });

    this.fb.collection.bind('add', function (model) {
      model.set('_id', model.cid);
      if (model.get(self.CONSTANTS.FB.FIELD_TYPE)===self.CONSTANTS.FORM.PAGE_BREAK){
        self.reorder.render();
      }
      var fieldRefs = self.form.get("fieldRef");

      fieldRefs[model.cid] = model;
    });
    this.fb.collection.bind('change', function (model) {
      if (model.get(self.CONSTANTS.FB.FIELD_TYPE) === self.CONSTANTS.FORM.PAGE_BREAK) {
        self.reorder.render();
      }
      self.syncModelAndFormBuilder();
      self.updatePreview.apply(self, arguments);
    });
    this.fb.collection.bind('remove', function (model) {
      var _idRemoved = model.get("_id");
      var fieldRefs = self.form.get("fieldRef");
      var pages = self.form.get("pages");
      for (var i = 0; i < pages.length; i++) {
        var p = pages.at(i);
        var fields = p.get("fields");
        p.removeFieldFromPage(_idRemoved);
        if (fieldRefs && fieldRefs.hasOwnProperty(_idRemoved)) {
          delete fieldRefs[_idRemoved];
        }
        //reset the fieldref indexes otherwise $fh.forms gives out.
        for (var fi = 0; fi < fields.length; fi++) {
          if (fieldRefs[fields[fi]._id]) {
            fieldRefs[fields[fi]._id].field = fi;
          }
        }
        self.form.set("fieldref", fieldRefs);
      }
      self.updatePreview.apply(self, arguments);
      if (model.get(self.CONSTANTS.FB.FIELD_TYPE) === self.CONSTANTS.FORM.PAGE_BREAK) {
        self.reorder.render();
      }
      self.$el.find('.fb-tabs li.formpreview a').trigger('click');
    });
    this.$el.find('.fb-field-wrapper .subtemplate-wrapper').click(function () {
      self.$el.find('.fb-tabs li.configurefield a').trigger('click');
    });

    this.reorder = new App.View.FormEditReorder({ form: this.form, fb: this.fb, $fbEl: this.$fbEl });
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

    this.$fbEl.find('.middle').removeClass('span6').addClass('span7');
    this.$fbEl.find('.right').removeClass('span4').addClass('span3');

    var configName = $(this.$fbEl.find('input[name="' + this.CONSTANTS.FORM.NAME + '"]')),
    configDesc = $(this.$fbEl.find('textarea[name="' + this.CONSTANTS.FORM.DESC + '"]'));
    configName.val(this.form.get(this.CONSTANTS.FORM.NAME));
    configDesc.val(this.form.get(this.CONSTANTS.FORM.DESC));
    this.$el.find('.middle').append(this.templates.$formSaveCancel());

    self.updatePreview();

    return this;
  },
  updateNameDesc: function (e) {
    var el = $(e.target);
    if (el.attr('id') === 'formInputName') {
      this.$el.find('.middle h4.heading').html(el.val());
    } else {
      this.$el.find('.middle p.desc').html(el.val());
    }
  },

  themeSelect :function (e) {
    console.log("theme select");
    var self = this;
    var val = $(e.target).val();
    var prevWrapper = self.$el.first("#preview_wrapper");
    prevWrapper.find('style').remove();
    if('none' === val){
      return;
    }
    var theme = self.themes.findWhere({"_id":val });
    console.log("have css ", theme.get("css"));
    prevWrapper.append('<style>'+theme.get("css")+'</style>');
  },
  syncModelAndFormBuilder: function () {
    this.fb.collection.sort();
    var self = this,
      curPage,
      pages = [];
    this.fb.collection.each(function (f, i, coll) {
      // For every page break - except the first, that's just a UI thing..
      if (f.get(self.CONSTANTS.FB.FIELD_TYPE) === self.CONSTANTS.FORM.PAGE_BREAK) {
        if (curPage) {
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
    if (curPage) {
      pages.push(curPage);
    }



    for (var i = 0; i < pages.length; i++) {
      var p = pages[i];

      var fields = p["fields"];
      //reset the fieldref ind
      // exes otherwise $fh.forms gives out.
      var fieldRefs = self.form.get("fieldRef");
      var resetRef = {};
      for (var fi = 0; fi < fields.length; fi++) {
        resetRef[fields[fi]._id] = {"page":i,"field":fi};
      }
      console.log("fieldRefs set to ", resetRef);
      self.form.set("fieldRef", resetRef);
    }

    this.form.set(this.CONSTANTS.FORM.PAGES, pages);
    this.form.set(this.CONSTANTS.FORM.NAME, this.$el.find('#formInputName').val());
    this.form.set(this.CONSTANTS.FORM.DESC, this.$el.find('#formTextareaDesc').val());
  },

  onFormSave: function () {
    var self = this;
    this.loading = $(this.templates.$fullpageLoading());
    this.$el.append(this.loading).addClass('busy');
    self.reorder.$el.hide();
    self.$fbEl.hide();

    self.syncModelAndFormBuilder();
    this.collection.sync('update', this.form.toJSON(), { success: function () {
      self.fb.collection.reset([]);
      self.back();
      self.message('Form updated successfully');
    }, error: function () {
      self.$el.removeClass('busy');
      self.loading.remove();
      self.reorder.$el.show();
      self.$fbEl.show();
      self.message('Error updating form', 'danger');
    }});
  },
  back: function () {
    this.trigger('back');
  },
  updatePreview: function () {
    var self = this;
    var rawData = JSON.stringify(self.form.toJSON());
    console.log("update preview raw data", self.form.toJSON());
    $fh.forms.init({
      config: {
        "cloudHost": "", "appid": new Date().getTime()
      },
      "updateForms": false
    }, function () {
      console.log(" cb rendering form");

    });

    var ele = self.$el.find('div.formPreviewContents');
    $fh.forms.renderFormFromJSON({rawData: rawData, "container": ele});

  }
});