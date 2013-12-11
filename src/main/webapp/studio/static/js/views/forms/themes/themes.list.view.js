var App = App || {};
App.View = App.View || {};

App.View.FormThemesList = App.View.FormListBase.extend({
  templates : {
    'formsListBaseAdd' : '#formsListBaseAdd',
    'fullpageLoading' : '#fullpageLoading',
    'menu' : '#themesListMenu'
  },
  events : {
    'click tr' : 'onRowSelected',
    'click .btn-add-theme' : 'onCreate',
    'click .btn-clone-theme' : 'onClone',
    'click .btn-delete-theme' : 'onDelete'

  },
  initialize: function(){
    this.collection = new App.Collection.FormThemes();
    console.log("collection ", this.collection);
    this.pluralTitle = 'Themes';
    this.singleTitle = 'Theme';
    this.columns = [{
      "sTitle": 'Name',
      "mDataProp": this.CONSTANTS.THEME.NAME
    },{
      "sTitle": 'Updated',
      "mDataProp": this.CONSTANTS.THEME.UPDATED
    },{ //TODO: Make these..?
      "sTitle": 'Apps Using This',
      "mDataProp": this.CONSTANTS.THEME.USING
    }];
    this.constructor.__super__.initialize.apply(this, arguments);
  },
  render : function(){
    App.View.FormListBase.prototype.render.apply(this, arguments);
    return this.renderPreview();
  },
  renderPreview : function(){
    this.$previewEl = $('<div class="themepreview" />');
    this.$el.append(this.$previewEl);
    this.$previewEl.hide();

    this.$previewEl.append('<div id="formPreviewContainer"></div>');
    var menu = $(this.templates.$menu()).addClass('pull-right');
    this.$previewEl.append(menu);

    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
    return this;
  },
  updatePreview : function(updatedModel){
    console.log("updatePreview",updatedModel);
    var previewTheme = new App.View.FormThemesEdit({ theme : updatedModel, readOnly : true});
    this.$previewEl.find('#formPreviewContainer').html(previewTheme.render().$el);
    previewTheme.$el.removeClass('span10').addClass('span8');
    this.$previewEl.show();

    dropdown = this.$previewEl.find('.apps-using-theme');

    dropdown.empty();



    var appsUsingTheme = updatedModel.get("apps");
    if(appsUsingTheme.length > 0){
      console.log("there are apps using this theme");
              if (appsUsingTheme.length>0){
          _.each(appsUsingTheme, function(d){
            dropdown.append('<li><a class="formapp-link" data-_id="' + d.id + '" href="#">' + d.title + '</a></li>');
          });
        }else{
          dropdown.append('<li class="text">No apps using this form</li>');
        }
    }

  }
});