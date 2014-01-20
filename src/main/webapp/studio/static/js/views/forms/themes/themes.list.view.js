var App = App || {};
App.View = App.View || {};

App.View.FormThemesList = App.View.FormListBase.extend({
  templates : {
    'formsListBaseAdd' : '#formsListBaseAdd',
    'fullpageLoading' : '#fullpageLoading',
    'menu' : '#themesListMenu',
    previewOutline: '#preview_outline',
    formselect:'#form_select'
  },
  events : {
    'click tr' : 'onRowSelected',
    'click .btn-add-theme' : 'onCreate',
    'click .btn-clone-theme' : 'onClone',
    'click .btn-delete-theme' : 'onDelete',
    'change #formSelect' : 'formSelect'

  },
  initialize: function(){
    this.collection = new App.Collection.FormThemes();
    this.formCollection = new App.Collection.Form();
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
    var self = this;
    App.View.FormListBase.prototype.render.apply(this, arguments);

    return this.renderPreview();

  },
  renderPreview : function(){
    this.$previewEl = $('<div class="themepreview" />');
    this.$el.append(this.$previewEl);
    this.$previewEl.hide();

    this.$previewEl.append('<div id="formPreviewContainer"></div>');


    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);


    return this;
  },

  formSelect : function (e){
    var self = this;
    var formId = $(e.target).val();
    var form = this.formCollection.findWhere({"_id":formId});

    var rawData = (form) ? JSON.stringify(form.toJSON()) : undefined;

    $fh.forms.init({
      config: {
        "cloudHost": "", "appid": new Date().getTime()
      },
      "updateForms": false
    }, function () {
      console.log(" cb rendering form");

    });//todo figure out why this callback is not being called in studio

    var ele = self.$el.find('div.formPreviewContents');
    if(! rawData){
      ele.html("");
    }else{
      $fh.forms.renderFormFromJSON({rawData: rawData, "container": ele});
    }
  },

  updatePreview : function(updatedModel){
    var self = this;
    var previewTheme = new App.View.FormThemesEdit({ theme : updatedModel, readOnly : true});
    this.$previewEl.find('#formPreviewContainer').html(previewTheme.render().$el);
    previewTheme.$el.removeClass('span10');
    this.$previewEl.show();

    dropdown = this.$previewEl.find('.apps-using-theme');

    dropdown.empty();



    var appsUsingTheme = updatedModel.get("apps") || [];
    if(appsUsingTheme.length > 0){
              if (appsUsingTheme.length>0){
          _.each(appsUsingTheme, function(d){
            dropdown.append('<li><a class="formapp-link" data-_id="' + d.id + '" href="#">' + d.title + '</a></li>');
          });
        }else{
          dropdown.append('<li class="text">No apps using this form</li>');
        }

    }
    console.log("Update preview called");
    self.formCollection.fetch({"success":function (forms){
      console.log("got forms ", forms);
      var formData = [];
      forms.forEach(function (f){
        formData.push({
          "name": f.get("name"),
          "_id": f.get("_id")
        });
      });
      self.$el.find('#previewContainer').html(self.templates.$previewOutline()).show();
      self.$el.find('#previewContainer').append(self.templates.$formselect({"forms":formData}));
      self.$el.find('.themesInnerContainer').append(self.templates.$menu());
    }
    });
  }
});