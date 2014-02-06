//var App = App || {};
//App.View = App.View || {};
//
////TODO - Need to abstract this.
//App.View.FormThemesList = App.View.FormListBase.extend({
//  templates : {
//    'formsListBaseAdd' : '#formsListBaseAdd',
//    'fullpageLoading' : '#fullpageLoading',
//    'menu' : '#themesListMenu',
//    previewOutline: '#preview_outline',
//    formselect:'#form_select',
//    'templateTabs': '#templateTabs'
//  },
//  events : {
//    'click tr' : 'onRowSelected',
//    'click .btn-add-theme' : 'onCreate',
//    'click .btn-clone-theme' : 'onClone',
//    'click .btn-delete-theme' : 'onDelete',
//    'change #formSelect' : 'formSelect'
//
//  },
//  initialize: function(){
//    var self = this;
//    this.collection = new App.Collection.FormThemes();
//    this.formCollection = new App.Collection.Form();
//    this.pluralTitle = 'Themes';
//    this.singleTitle = 'Theme';
//    this.columns = [{
//      "sTitle": 'Name',
//      "mDataProp": this.CONSTANTS.THEME.NAME
//    },{
//      "sTitle": 'Updated',
//      "mDataProp": this.CONSTANTS.THEME.UPDATED
//    },{
//      "sTitle": 'Apps Using This',
//      "mDataProp": this.CONSTANTS.THEME.USING
//    }];
//
//    $fh.forms.init({
//      config: {
//        "cloudHost": "", "appid": new Date().getTime()
//      },
//      "updateForms": false
//    }, function () {
//      console.log(" cb rendering form");
//    });//todo figure out why this callback is not being called in studio
//
//
//    this.constructor.__super__.initialize.apply(this, arguments);
//  },
//  render : function(){
//    var self = this;
//    self.formCollection.fetch({"success":function (forms){
//      self.formData = [];
//      forms.forEach(function (f){
//        self.formData.push({
//          "name": f.get("name"),
//          "_id": f.get("_id")
//        });
//      });
//      self.renderPreview();
//    },"error": function (err){
//      console.log("err fetching forms ", err);
//      self.message('Error fetching forms ', 'danger');
//      self.renderPreview();
//    }
//    });
//
//   App.View.FormListBase.prototype.render.apply(this, arguments);
//    self.$el.find('a#viewTheme').parent('li').addClass("active");
//    self.$el.find('a#viewThemeTemplates').parent('li').removeClass("active");
//   return this;
//  },
//  renderPreview : function(){
//    this.$previewEl = $('<div class="themepreview" />');
//    this.$el.append(this.$previewEl);
//    this.$previewEl.hide();
//
//    this.$previewEl.append('<div id="formPreviewContainer"></div>');
//
//
//
//    // Move the loading to the bottom of this element's dom
//    this.loading.remove();
//    this.$el.append(this.loading);
//    return this;
//  },
//
//  formSelect : function (e){
//    var self = this;
//    var formId = $(e.target).val();
//    var form = this.formCollection.findWhere({"_id":formId});
//
//    var rawData = (form) ? JSON.stringify(form.toJSON()) : undefined;
//
//
//
//    var ele = self.$el.find('div.formPreviewContents');
//    if(! rawData){
//      ele.html("");
//    }else{
//      $fh.forms.renderFormFromJSON({rawData: rawData, "container": ele});
//    }
//  },
//
//  /**
//   *
//   * Note this is called when a row in a table is clicked.
//   */
//  updatePreview: function (updatedModel) {
//    var self = this;
//    var previewTheme = new App.View.FormThemesEdit({ theme: updatedModel, readOnly: true});
//    this.$previewEl.find('#formPreviewContainer').html(previewTheme.render().$el);
//
//
//
//    previewTheme.$el.removeClass('span10');
//    this.$previewEl.show();
//
//    dropdown = this.$previewEl.find('.apps-using-theme');
//
//    dropdown.empty();
//
//    var appsUsingTheme = updatedModel.get("apps") || [];
//    if (appsUsingTheme.length > 0) {
//      if (appsUsingTheme.length > 0) {
//        _.each(appsUsingTheme, function (d) {
//          dropdown.append('<li><a class="formapp-link" data-_id="' + d.id + '" href="#">' + d.title + '</a></li>');
//        });
//      } else {
//        dropdown.append('<li class="text">No apps using this form</li>');
//      }
//
//    }
//
//
//    var prevContainer = self.$el.find('#previewContainer');
//    prevContainer.html(self.templates.$previewOutline()).show();
//    prevContainer.append(self.templates.$formselect({"forms":self.formData}));
//    prevContainer.find('style').remove();
//    prevContainer.append("<style id='themeStyle'>"+updatedModel.get('css')+"</style>");
//    self.$el.find('.themesInnerContainer').append(self.templates.$menu({"themeView" : true}));
//  },
//  onDelete : function(){
//    var self = this;
//
//    if(self.collection.length < 2){
//      modal = new App.View.Modal({
//        title: 'Notice',
//        body: "Cannot delete theme. There must be at least one theme defined for form apps to function correctly. Please create a new theme or import a theme template to "
//      });
//      this.$el.append(modal.render().$el);
//      return;
//    }
//
//    this.constructor.__super__.onDelete.apply(this, arguments);
//  }
//});