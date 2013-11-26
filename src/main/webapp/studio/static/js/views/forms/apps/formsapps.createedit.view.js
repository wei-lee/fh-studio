/*
 TOOD: This is just a copy-paste placeholder of themes for now, to illustrate it also is a version of FormListBase
 */
var App = App || {};
App.View = App.View || {};

App.View.FormAppsCreateEdit = App.View.Forms.extend({
  templates : {
    'formsApps' : '#formsApps',
    'fullpageLoading' : '#fullpageLoading'
  },
  events : {
    'click .btn-success' : 'onFormSave'
  },
  initialize: function(options){
    var self = this;
    this.model = options.model;
    this.forms = new App.Collection.Form();
    this.themes = new App.Collection.FormThemes();
    this.mode = options.mode || 'create';

    // Fetch on the forms and themes - only once these are done can we finish..
    var getters = [
      function(cb){
        self.forms.fetch({
          success : function(res){
            cb(null, res);
          },
          error : function(err){
            cb(err);
          }
        });
      },
      function(cb){
        self.themes.fetch({
          success : function(res){
            cb(null, res);
          },
          error : function(err){
            cb(err);
          }
        });
      }
    ];

    if (this.mode === 'existing'){
      this.apps = new App.Collection.Apps();
      getters.push(function(cb){
        self.apps.fetch({
          success : function(res){
            return cb(null, res);
          },
          error : function(err){
            return cb(err);
          }
        });
      });
    }

    async.parallel(getters, function(err, res){
      if (err){
        //TODO: Err handling
        return;
      }
      self.loaded = true;
      self.render();

    });

    this.loaded = false;

    this.compileTemplates();
  },
  render : function(){
    var self = this,
    name = '';

    if (!this.loaded){
      this.$el.height(134);
      return this;
    }

    if (this.mode === 'update'){
      name = this.model.get(this.CONSTANTS.FORMSAPP.NAME);
    }

    this.$el.append(this.templates.$formsApps({ name : name }));

    if (this.mode === 'existing'){
      var appSelect = $("<select></select>");
      this.apps.each(function(a){
        appSelect.append('<option value="' + a.get('id') + '">' + a.get('title') + '</option>');
      });
      this.$el.find('.appname').html(appSelect);
    }

    var themesSelect = this.$el.find('#formAppTheme'),
    formsSelect = this.$el.find('#formAppForms');

    this.forms.each(function(f){
      formsSelect.append('<option value="' + f.get('_id') + '">' + f.get(self.CONSTANTS.FORM.NAME) + '</option>');
    });
    this.themes.each(function(f){
      themesSelect.append('<option value="' + f.get('_id') + '">' + f.get(self.CONSTANTS.THEME.NAME) + '</option>');
    });

    formsSelect.select2({});
    if (this.mode === 'update'){
      formsSelect.select2('val', this.model.get(self.CONSTANTS.FORMSAPP.FORMS));
    }else{
      // A create operation - remove the save buttons
      this.$el.find('.btn-group').remove();
    }

    return this;
  },
  onFormSave : function(){
    var forms = this.$el.find('form.formsApps #formAppForms').val(); //TODO: Theme and name
    this.model.set(this.CONSTANTS.FORMSAPP.FORMS, forms);
    this.model.save();
  }
});
