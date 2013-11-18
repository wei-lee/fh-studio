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
      this.$el.find('input[name="name"]').val(this.options.form[this.CONSTANTS.FORM.NAME] + " Copy"); // name
      this.$el.find('textarea[name="description"]').val(this.options.form[this.CONSTANTS.FORM.NAME] || ""); // name
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
      vals[App.View.Forms.prototype.CONSTANTS.FORM.UPDATED] = new Date().toString();
      vals[App.View.Forms.prototype.CONSTANTS.FORM.USING] = 0;
      vals[App.View.Forms.prototype.CONSTANTS.FORM.SUBSTODAY] = 0;
      vals[App.View.Forms.prototype.CONSTANTS.FORM.SUBS] = 0;
      vals.pages = [
        { "fields": [] }
      ];
    }else{
      // Clone our source with the new prefs

      _.extend(this.options.form, vals);
      vals = this.options.form;
      this.stripIds(vals); // because we're cloning, any elements with an ID won't get created
    }
    this.collection.add(vals);
    this.collection.sync('create', vals, { success : function(res){
      var verb = (self.mode === 'create') ? "created" : "cloned";
      App.View.Forms.prototype.message('Form ' + verb + ' successfully');
    }, error : function(err){
      App.View.Forms.prototype.message('Error creating form');
      console.log('Error creating form');
      console.log(err);
    }});

  },
  stripIds : function(form){
    delete form._id;
    _.each(form.pages, function(p){
      delete p._id;
      _.each(p.fields, function(f){
        delete f._id;
      });
    });
    return form;
  }
});