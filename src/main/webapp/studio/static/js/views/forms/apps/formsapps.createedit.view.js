/*
 TOOD: This is just a copy-paste placeholder of themes for now, to illustrate it also is a version of FormListBase
 */
var App = App || {};
App.View = App.View || {};

App.View.FormAppsCreateEdit = App.View.Forms.extend({
  templates : {
    'formsApps' : '#formsApps'
  },
  initialize: function(options){
    var self = this;
    this.model = options.model;
    this.forms = new App.Collection.Form();
    this.themes = new App.Collection.FormThemes();

    // Fetch on the forms and themes - only once these are done can we finish..
    async.parallel([
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
    ], function(err, res){
      if (err){
        //TODO: Err handling
        return;
      }
      self.loading = false;
      self.render();

    });

    this.loading = true;

    this.compileTemplates();
  },
  render : function(){
    var self = this;

    if (this.loading){
      return this;
    }

    var name = (this.model) ? this.model.get(this.CONSTANTS.FORMSAPP.NAME) : '';
    this.$el.append(this.templates.$formsApps({ name : name }));
    var themesSelect = this.$el.find('#formAppTheme'),
    formsSelect = this.$el.find('#formAppForms');

    this.forms.each(function(f){
      formsSelect.append('<option value="' + f.get('_id') + '">' + f.get(self.CONSTANTS.FORM.NAME) + '</option>');
    });
    this.themes.each(function(f){
      themesSelect.append('<option value="' + f.get('_id') + '">' + f.get(self.CONSTANTS.THEME.NAME) + '</option>');
    });

    formsSelect.select2({});
    if (this.model){
      formsSelect.select2('val', this.model.get('forms'));
    }else{
      // A create operation - remove the save buttons
      this.$el.find('.btn-group').remove();
    }

    return this;
  }
});
