var App = App || {};
App.View = App.View || {};

App.View.FormThemesListParent = App.View.FormListBase.extend({

  templates: {
    'formsListBaseAdd': '#formsListBaseAdd',
    'fullpageLoading': '#fullpageLoading',
    'menu': '#themesListMenu',
    previewOutline: '#preview_outline',
    formselect: '#form_select',
    'templateTabs': '#templateTabs'
  },
  events: {
    'click tr': 'onRowSelected',
    'click .btn-add-theme': 'onCreate',
    'click .btn-clone-theme': 'onClone',
    'click .btn-delete-theme': 'onDelete',
    'change #formSelect': 'formSelect'
  },
  initialize: function (params) {
    var self = this;
    self.formCollection = new App.Collection.Form();
    self.pluralTitle = 'Themes';
    self.singleTitle = 'Theme';

    $fh.forms.init({
      config: {
        "cloudHost": "",
        "appid": new Date().getTime(),
        "studioMode": true
      },
      "updateForms": false
    }, function () {
      console.log(" cb rendering form");
    });

    if (params.themeList === true) {
      self.viewingTemplates = false;
      self.initialiseThemeList(params);
    } else if (params.themeTemplateList === true) {
      self.viewingTemplates = true;
      self.initializeThemeTemplateList(params);
    } else {
      console.log("ERROR SHOULD NOT BE HERE.");
    }
  },
  initialiseThemeList: function (params) {
    var self = this;
    this.columns = [
      {
        "sTitle": 'Name',
        "mDataProp": this.CONSTANTS.THEME.NAME
      },
      {
        "sTitle": 'Updated',
        "mDataProp": this.CONSTANTS.THEME.UPDATED
      },
      {
        "sTitle": 'Apps Using This',
        "mDataProp": this.CONSTANTS.THEME.USING
      }
    ];
    self.constructor.__super__.initialize.apply(this, arguments);
  },
  initializeThemeTemplateList: function (params) {
    var self = this;
    this.columns = [
      {
        "sTitle": 'Name',
        "mDataProp": this.CONSTANTS.THEME.NAME
      },
      {
        "sTitle": 'Updated',
        "mDataProp": this.CONSTANTS.THEME.UPDATED
      }
    ];
    self.constructor.__super__.initialize.apply(this, arguments);
  },
  render: function () {
    var self = this;
    self.formCollection.fetch({"success": function (forms) {
      self.formData = [];
      forms.forEach(function (f) {
        self.formData.push({
          "name": f.get("name"),
          "_id": f.get("_id")
        });
      });
      self.renderPreview();
    }, "error": function (err) {
      console.log("err fetching forms ", err);
      self.message('Error fetching forms ', 'danger');
      self.renderPreview();
    }
    });

    App.View.FormListBase.prototype.render.apply(this, arguments);
    if (self.viewingTemplates) {
      self.$el.find('a#viewTheme').parent('li').removeClass("active");
      self.$el.find('a#viewThemeTemplates').parent('li').addClass("active");
    } else {
      self.$el.find('a#viewTheme').parent('li').addClass("active");
      self.$el.find('a#viewThemeTemplates').parent('li').removeClass("active");
    }
    return this;
  },
  renderPreview: function () {
    this.$previewEl = $('<div class="themepreview" />');
    this.$el.append(this.$previewEl);
    this.$previewEl.hide();

    this.$previewEl.append('<div id="formPreviewContainer"></div>');

    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
    return this;
  },
  formSelect: function (e) {
    var self = this;
    var formId = $(e.target).val();
    var form = this.formCollection.findWhere({"_id": formId});

    var rawData = (form) ? JSON.stringify(form.toJSON()) : undefined;
    var dropdown = this.$previewEl.find('.apps-using-theme');

    form.fetch({
      success: function (form) {
        rawData = (form) ? JSON.stringify(form.toJSON()) : undefined;
        var ele = self.$el.find('div.formPreviewContents');
        if (!rawData) {
          ele.html("");
        } else {
          $fh.forms.renderFormFromJSON({rawData: rawData, "container": ele});
        }
      },
      error: function () {
        dropdown.empty().append('<li>Error loading apps using this form</li>');
      }
    });
  },

  /**
   *
   * Note this is called when a row in a table is clicked.
   */
  updatePreview: function (updatedModel) {
    var self = this;
    var previewTheme = new App.View.FormThemesEdit({ theme: updatedModel, readOnly: true});
    this.$previewEl.find('#formPreviewContainer').html(previewTheme.render().$el);

    previewTheme.$el.removeClass('span10');
    this.$previewEl.show();

    var prevContainer = self.$el.find('#previewContainer');
    prevContainer.html(self.templates.$previewOutline()).show();
    prevContainer.append(self.templates.$formselect({"forms": self.formData}));
    prevContainer.find('style').remove();
    prevContainer.append("<style id='themeStyle'>" + updatedModel.get('css') + "</style>");
    self.$el.find('.themesInnerContainer').append(self.templates.$menu({"themeView": this.viewingTemplates === false}));

    var dropdown = this.$el.find('.apps-using-theme');
    dropdown.empty();

    var appsUsingTheme = updatedModel.get("apps") || [];

    if (appsUsingTheme.length > 0) {
      _.each(appsUsingTheme, function (d) {

        dropdown.append('<li><a class="formapp-link" data-_id="' + d.appId + '" href="#">' + d.title + '</a></li>');
      });
    } else {
      dropdown.append('<li class="text">No apps using this form</li>');
    }
  },
  onDelete: function () {
    var self = this;

    if (self.collection.length < 2) {
      modal = new App.View.Modal({
        title: 'Notice',
        body: "Cannot delete theme. There must be at least one theme defined for form apps to function correctly. Please create a new theme or import a theme template to delete this theme."
      });
      this.$el.append(modal.render().$el);
      return;
    }

    this.constructor.__super__.onDelete.apply(this, arguments);
  }
});