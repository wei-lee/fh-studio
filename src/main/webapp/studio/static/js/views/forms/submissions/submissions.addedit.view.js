var App = App || {};
App.View = App.View || {};

App.View.SubmissionsAddEdit = App.View.Forms.extend({
  templates : {
    formSaveCancel : '#formSaveCancel',
    'form_back' : '#form_back'
  },
  events : {
    'click .btn-form-save' : 'onSubmit',
    'click .btn-form-cancel' : 'back',
    'click .btn-forms-back' : 'back'
  },
  initialize: function(options){
    this.constructor.__super__.initialize.apply(this, arguments);
    this.options = options;
  },
  render : function(){
    var form = this.options.form,
    fields = this.formToFormBuilderFields(form);
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

    this.$fbEl.find('.right').hide();

    this.fb.collection.bind('add', function(model){

    });
    this.fb.collection.bind('change', function(model){

    });
    this.fb.collection.bind('remove', function(model){

    });


    this.$fbEl.find('.middle').prepend(this.templates.$form_back());
    this.$fbEl.find('.middle').append(this.templates.$formSaveCancel());

    return this;
  },
  onSubmit : function(){
    var fields = this.fb.collection.toJSON();
  },
  back : function(){
    this.trigger('back');
  },
});