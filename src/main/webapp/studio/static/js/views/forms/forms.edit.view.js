var App = App || {};
App.View = App.View || {};

App.View.FormEdit = App.View.Forms.extend({
  templates : {

  },
  events : {
    'click .btn-add-form' : 'onCreateForm',
    'click tr' : 'onFormSelected'
  },
  initialize: function(options){
    this.constructor.__super__.initialize.apply(this, arguments);
    this.options = options;
  },
  render : function(){
    var fields = [],
    form = this.options.form;
    fields = this.formToFormBuilderFields(form);
    this.$el.empty();
    this.$el.addClass('span10 formedit');
    this.$fbEl = $('<div>');
    this.$el.append(this.$fbEl);

    // Also configure default FormBuilder field setup here to be inline with FH requirements
    this.fb = new Formbuilder(this.$fbEl, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: fields
    });

    // Place holders that get filled when the user clicks a form
    this.$fbEl.find('.middle').prepend("<p>" + form.get('Description') + "</p>");
    this.$fbEl.find('.middle').prepend("<h4>" + form.get('Name') + "</h4>");

//    this.$fbEl.find('.middle').removeClass('span6').addClass('span9');
//    this.$fbEl.find('.right').removeClass('span4').addClass('span2');
    return this;
  }
});