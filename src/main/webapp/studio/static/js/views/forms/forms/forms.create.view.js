var App = App || {};
App.View = App.View || {};

App.View.FormCreateClone = App.View.Modal.extend({
  initialize: function(options){
    this.CONSTANTS = App.View.Forms.prototype.CONSTANTS;
    var tpl = Handlebars.compile($('#formCreateEditForm').html()),
    body = $(tpl({ CONSTANTS : this.CONSTANTS })),
    mode = options.mode || 'create';
    this.singleTitle = options.singleTitle;
    this.pluralTitle = options.pluralTitle;
    this.options = options = {
      title: (options.mode==='create') ? 'Create New ' + this.singleTitle : 'Clone ' + this.singleTitle,
      okText: (options.mode==='create') ? 'Create' : 'Clone',
      ok : this.ok,
      body : body,
      collection : options.collection,
      mode : mode,
      cloneSource : options.cloneSource
    };


    return this.constructor.__super__.initialize.apply(this, [options]);
  },
  baseForm : function(vals){
    vals[App.View.Forms.prototype.CONSTANTS.FORM.UPDATED] = new Date().toString();
    vals[App.View.Forms.prototype.CONSTANTS.FORM.USING] = 0;
    vals[App.View.Forms.prototype.CONSTANTS.FORM.SUBSTODAY] = 0;
    vals[App.View.Forms.prototype.CONSTANTS.FORM.SUBS] = 0;
    vals.pages = [
      { "fields": [] }
    ];
    return vals;
  },
  baseTheme : function(vals){
    vals[App.View.Forms.prototype.CONSTANTS.THEME.UPDATED] = new Date();
    vals[App.View.Forms.prototype.CONSTANTS.THEME.USING] = 0;
    return vals;
  },
  render : function(options){
    App.View.Modal.prototype.render.apply(this, arguments);
    if (this.options.mode === 'clone'){
      this.$el.find('input[name="name"]').val(this.options.cloneSource[this.CONSTANTS[this.singleTitle.toUpperCase()].NAME] + " Copy"); // name

      // Form has a desc - populate it - theme does not, remove it..
      if (this.singleTitle.toLowerCase() === "form"){
        this.$el.find('textarea[name="description"]').val(this.options.cloneSource[this.CONSTANTS[this.singleTitle.toUpperCase()].DESC] || ""); // name
      }
    }

    // Theme has no description - remove this box
    if (this.singleTitle.toLowerCase() === "theme"){
      this.$el.find('textarea[name="description"]').remove();
      this.$el.find('label[for=formTextareaDesc]').remove();
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
      vals = self['base' + this.singleTitle](vals);
    }else{
      // Clone our source with the new prefs

      _.extend(this.options.cloneSource, vals);
      vals = this.options.cloneSource;
      this.stripIds(vals); // because we're cloning, any elements with an ID won't get created
    }

    this.collection.sync('create', vals, { success : function(res){
      var verb = (self.mode === 'create') ? "created" : "cloned";
      vals._id = res._id;
      self.collection.add(vals);
      self.collection.trigger('reset');
      App.View.Forms.prototype.message(self.singleTitle + ' ' + verb + ' successfully');
    }, error : function(err){
      App.View.Forms.prototype.message('Error creating ' + self.singleTitle.toLowerCase());
      console.log('Error creating ' + self.singleTitle.toLowerCase());
      console.log(err);
    }});

  },
  stripIds : function(item){
    delete item._id;
    _.each(item.pages, function(p){
      delete p._id;
      _.each(p.fields, function(f){
        delete f._id;
      });
    });
    return item;
  }
});