var App = App || {};
App.View = App.View || {};

App.View.FormCreateClone = App.View.Modal.extend({
  initialize: function(options){
    this.CONSTANTS = App.View.Forms.prototype.CONSTANTS;
    this.singleTitle = options.singleTitle;
    this.singleId = options.singleId;
    this.pluralTitle = options.pluralTitle;
    this.viewingTemplates = options.viewingTemplates;
    var autoHide = options.autoHide;
    var tpl = Handlebars.compile($('#formCreateEdit' + this.singleId).html()),
    body = $(tpl({ CONSTANTS : this.CONSTANTS })),
    mode = options.mode || 'create';

    var title;
    var okText;

    if (options.mode === 'clone') {
      title = 'Clone ' + this.singleTitle;
      okText = 'Clone';
    } else if (options.mode === 'existing') {
      title = 'Associate Forms with existing ' + this.singleTitle;
      okText = 'Associate';      
    } else {
      title = 'Create New ' + this.singleTitle;
      okText = 'Create';
    }

    this.options = options = {
      title: title,
      okText: okText,
      ok : this.ok,
      body : body,
      collection : options.collection,
      mode : mode,
      cloneSource : options.cloneSource,
      autoHide: autoHide
    };

    return this.constructor.__super__.initialize.apply(this, [options]);
  },
  baseform : function(vals){
    vals[App.View.Forms.prototype.CONSTANTS.FORM.UPDATED] = new Date().toString();
    vals[App.View.Forms.prototype.CONSTANTS.FORM.USING] = 0;
    vals[App.View.Forms.prototype.CONSTANTS.FORM.SUBSTODAY] = 0;
    vals[App.View.Forms.prototype.CONSTANTS.FORM.SUBS] = 0;
    vals.pages = [
      { "fields": [] }
    ];
    return vals;
  },
  basetheme : function(vals){
    vals[App.View.Forms.prototype.CONSTANTS.THEME.UPDATED] = new Date();
    vals[App.View.Forms.prototype.CONSTANTS.THEME.USING] = 0;
    return vals;
  },
  baseformsapp : function(vals){
    vals[App.View.Forms.prototype.CONSTANTS.FORMSAPP.UPDATED] = new Date();
    return vals;
  },
  render : function(options){
    App.View.Modal.prototype.render.apply(this, arguments);
    var constObj = this.CONSTANTS[this.singleId.toUpperCase().replace(" ","")];
    if (this.options.mode === 'clone'){
      this.$el.find('input[name="name"]').val(this.options.cloneSource[constObj.NAME] + " Copy"); // name

      // Form has a desc - populate it - theme does not, remove it..
      if (this.singleId.toLowerCase() === "form"){
        this.$el.find('textarea[name="description"]').val(this.options.cloneSource[constObj.DESC] || ""); // name
      }
    }

    if (this.singleId === "formsapp"){
      // Delegate entire view to FormsAppsCreateEdit view, and it's own save function
      this.formsApp = new App.View.FormAppsCreateEdit( { mode : this.options.mode, collection : this.options.collection } );
      this.$el.find('.modal-body').append(this.formsApp.render().$el);
    }

    return this;
  },
  ok: function (e) {
    var self = this,
    formEl = this.$el.find('form'),
    vals = {};

    if (this.singleId === "formsapp") {
      var create = (self.options.mode === 'create');
      return this.formsApp.saveForm.apply(this.formsApp, [create, function(new_guid) {
      }]);
    }

    $($(formEl).serializeArray()).each(function(idx, el){
      vals[el.name] = el.value;
    });


    if (this.options.mode === 'create' || this.options.mode === 'existing'){
      vals = self['base' + this.singleId](vals);
    }else{
      // Clone our source with the new prefs

      _.extend(this.options.cloneSource, vals);
      vals = this.options.cloneSource;
      this.stripIds(vals); // because we're cloning, any elements with an ID won't get created
    }

    this.collection.sync('create', vals, { success : function(res){
      var verb = (self.mode === 'create') ? "created" : "cloned";
      vals._id = res._id;
      if(!self.viewingTemplates){
        self.collection.add(vals);
      }
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