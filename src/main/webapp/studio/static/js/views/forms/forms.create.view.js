var App = App || {};
App.View = App.View || {};

App.View.FormCreateClone = App.View.Modal.extend({
  initialize: function(options){
    this.CONSTANTS = App.View.Forms.prototype.CONSTANTS;
    var tpl = Handlebars.compile($('#formCreateEditForm').html()),
    body = $(tpl({ CONSTANTS : this.CONSTANTS })),
    mode = options.mode || 'create';
    this.options = options = {
      title: (options.mode==='create') ? 'Create New Form' : 'Clone Form',
      okText: (options.mode==='create') ? 'Create' : 'Clone',
      ok : this.ok,
      body : body,
      collection : options.collection,
      mode : mode,
      form : options.form
    };

    return this.constructor.__super__.initialize.apply(this, [options]);
  },
  render : function(options){
    App.View.Modal.prototype.render.apply(this, arguments);
    if (this.options.mode === 'clone'){
      this.$el.find('input[name="Name"]').val(this.options.form[this.CONSTANTS.FORM.NAME] + " Copy"); // name
      this.$el.find('textarea[name="Description"]').val(this.options.form[this.CONSTANTS.FORM.NAME] || ""); // name
    }

    return this;
  },
  ok: function (e) {
    var self = this,
    formEl = this.$el.find('form'),
    vals = {};

    $($(formEl).serializeArray()).each(function(idx, el){
      vals[el.name] = el.value;
    });

    if (this.options.mode === 'create'){
      vals.DateUpdated = new Date().toString();
      vals.pages = [
        { "Fields": [] }
      ];
    }else{
      // Clone our source with the new prefs
      _.extend(this.options.form, vals);
      vals = this.options.form;
    }
    this.collection.add(vals);
    this.collection.sync('create', vals, { success : function(res){
      var verb = (self.mode === 'create') ? "created" : "cloned";
      self.message('Form ' + verb + ' successfully');
    }, error : function(err){
      self.message('Error creating form');
      console.log('Error creating form');
      console.log(err);
    }});

  },
  doCreateForm: function (sectionParams) {

  }
});