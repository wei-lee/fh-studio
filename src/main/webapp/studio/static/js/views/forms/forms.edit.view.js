var App = App || {};
App.View = App.View || {};

App.View.FormEdit = App.View.Forms.extend({
  templates : {
    formEditExtraTabs : '#formEditExtraTabs',
    formEditExtraTabsContent : '#formEditExtraTabsContent',
    formCreateEditForm : '#formCreateEditForm',
    formSaveCancel : '#formSaveCancel',
    form_back : '#form_back',
    form_pages : '#form_pages',
    form_page : '#form_page',
    previewOutline : '#preview_outline'
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

    this.fb.mainView.collection.bind('add', $.proxy(this.updatePreview, this));
    this.fb.mainView.collection.bind('update', $.proxy(this.updatePreview, this));
    this.fb.mainView.collection.bind('remove', $.proxy(this.updatePreview, this));

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

    this.$fbEl.find('#formPreview').html(this.templates.$previewOutline());
    this.updatePreview();

    this.$fbEl.find('.middle').removeClass('span6').addClass('span8');
    this.$fbEl.find('.right').removeClass('span4').addClass('span3');

    var configName = $(this.$fbEl.find('input[name="' + this.CONSTANTS.FORM.NAME + '"]')),
    configDesc = $(this.$fbEl.find('textarea[name="' + this.CONSTANTS.FORM.DESC + '"]'));
    configName.val(this.form.get(this.CONSTANTS.FORM.NAME));
    configDesc.val(this.form.get(this.CONSTANTS.FORM.DESC));

    this.$el.append(this.templates.$formSaveCancel());


    // Append the page reorderable div below the menu on the LHS
    var menuContainer = self.options.$pagesMenuEl;
    menuContainer.append(this.templates.$form_pages());
    this.form.get(this.CONSTANTS.FORM.PAGES).each(function(p){
      var page = self.templates.$form_page({_id :p.get('_id'), name :p.get('name')});
      menuContainer.find('.form-pages').append(page);
    });

    menuContainer.find('.form-pages').sortable({
      forcePlaceholderSize: true,
      stop : function(e, ui){
        var order = [],
        reOrdered = [],
        curPage;
        menuContainer.find('.form-pages .form-page').each(function(el){
          order.push($(this).data('_id'));
        });
        /*
          We now have an array of the order of IDs - iterate over formbuilder's fields.
          . We then flatten reOrdered.
         */
        self.fb.mainView.collection.each(function(f){
          if (f.get('type')==='page_break'){ // TODO Constant
            /*
             Every time we find a page, add it and it's subsequent fields to a new array -
             then push this to reOrdered at indexOf the current page ID in order[].
             */
            if (curPage && curPage._id && curPage.length>0){
              var idx = order.indexOf(curPage._id);
              reOrdered[idx] = curPage;
            }
            curPage = [];
            curPage._id = f.get('_id');
          }
          /*
          First iteration might make reOrdered look like this:
          [ undefined, ArrayofFields, undefined]
          ..and eventually after we come across a few more pages
          all of reOrdered should be populated
          */
          curPage.push(f.toJSON());
        });
        var idx = order.indexOf(curPage._id);
        reOrdered[idx] = curPage;
        // Lastly now we're done iterating we flatten out our 2d array reOrdered, and load it back into formbuilder
        reOrdered = _.flatten(reOrdered);
        self.fb.mainView.collection.reset(reOrdered);
      }
    });
    menuContainer.find('.form-page').click($.proxy(this.onFormPageClicked, this));

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
      self.back();
      self.message('Form updated successfully');
    }});
  },
  back : function(){
    this.options.$pagesMenuEl.find('.formpages-menu').remove();

    this.trigger('back');
  },
  onFormPageClicked : function(e){
    var el = (e.target.nodeName.toLowerCase()==="div") ? $(e.target) : $(e.target).closest('div'),
    _id = el.data('_id'),
    model = this.fb.mainView.collection.findWhere({_id : _id}),
    cid = model && model.cid;
    if ( el.is('.ui-draggable-dragging') ) {
      return;
    }

    var field = this.fb.mainView.$el.find(".fb-field-wrapper").filter(function(){ return $(this).data('cid') === cid; }),
    scroller = this.$el.find('.middle .fb-response-fields'),
    scroll = scroller.scrollTop() + field.offset().top - 234;
    this.$el.find('.middle .fb-response-fields').animate({scrollTop: scroll}, 750);
  },
  updatePreview: function(){
    debugger;
    var html = $(this.$el.find('.fb-response-fields').html());
    html.find('.actions-wrapper').remove();
    this.$el.find('.formPreviewContents').html(html)
  }
});