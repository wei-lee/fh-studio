/*
  TOOD: This is just a copy-paste placeholder of themes for now, to illustrate it also is a version of FormListBase
 */
var App = App || {};
App.View = App.View || {};

App.View.FormAppsList = App.View.FormListBase.extend({
  templates : {
    'formsListBaseAdd' : '#formsListBaseAdd',
    'formsApps' : '#formsApps',
    'fullpageLoading' : '#fullpageLoading'
  },
  events : {
    'click tr' : 'onRowSelected',
    'click .btn-add-theme' : 'onCreate',
    'click .btn-clone-theme' : 'onClone',
    'click .btn-delete-theme' : 'onDelete'
  },
  initialize: function(){
    var self = this;
    this.collection = new App.Collection.FormApps();

    this.forms = new App.Collection.Form();
    this.themes = new App.Collection.FormThemes();

    this.pluralTitle = 'Apps';
    this.singleTitle = 'App';
    this.columns = [{
      "sTitle": 'App Name',
      "mDataProp": this.CONSTANTS.APP.NAME
    },/*{
     "sTitle": 'Version',
     "mDataProp": this.CONSTANTS.APP.VERSION
     },*/{
      "sTitle": 'Last Updated',
      "mDataProp": this.CONSTANTS.APP.UPDATED
    },{
      "sTitle": '# Forms In This App',
      "mDataProp": this.CONSTANTS.APP.FORMS + ".length"
    },{
      "sTitle": 'Theme',
      "mDataProp": this.CONSTANTS.APP.UPDATED
    }];

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

    });

    var superRes = self.constructor.__super__.initialize.apply(self, arguments);
    this.loading = true;
    return superRes;
  },
  render : function(){
    App.View.FormListBase.prototype.render.apply(this, arguments);
    return this.renderPreview();
  },
  renderPreview : function(){
    this.$previewEl = $('<div class="app" />');
    this.$el.append(this.$previewEl);
    this.$previewEl.hide();

    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
    return this;
  },
  updatePreview : function(updatedModel){
    var self = this,
    form = $(this.templates.$formsApps({ name : updatedModel.get(this.CONSTANTS.APP.NAME) })),
    themesSelect = form.find('#formAppTheme'),
    formsSelect = form.find('#formAppForms');

    this.forms.each(function(f){
      formsSelect.append('<option value="' + f.get('_id') + '">' + f.get(self.CONSTANTS.FORM.NAME) + '</option>');
    });
    this.themes.each(function(f){
      themesSelect.append('<option value="' + f.get('_id') + '">' + f.get(self.CONSTANTS.THEME.NAME) + '</option>');
    });

    formsSelect.select2({});
    formsSelect.select2('val', updatedModel.get('forms'));

    themesSelect.find('option[value=' + updatedModel.get('theme') + ']').attr('selected', 'selected');

    this.$previewEl.html(form);
    this.$previewEl.show();
  }
});
