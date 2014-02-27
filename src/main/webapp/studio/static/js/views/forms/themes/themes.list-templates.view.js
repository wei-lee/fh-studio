var App = App || {};
App.View = App.View || {};

App.View.ThemeListTemplates = App.View.FormListBase.extend({
  templates: {
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
  initialize: function () {
    var self = this;
    self.collection = new App.Collection.FormThemeTemplate();
    self.formCollection = new App.Collection.Form();
    self.pluralTitle = 'Themes';
    self.singleTitle = 'Theme';
    self.columns = [
      {
        "sTitle": 'Name',
        "mDataProp": self.CONSTANTS.THEME.NAME
      },
      {
        "sTitle": 'Updated',
        "mDataProp": self.CONSTANTS.THEME.UPDATED
      }
    ];

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


    self.constructor.__super__.initialize.apply(self, arguments);
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
      console.log("err fetching themes ", err);
      self.message('Error fetching themes ', 'danger');
      self.renderPreview();
    }
    });

    App.View.FormListBase.prototype.render.apply(self, arguments);
    self.$el.find('a#viewTheme').parent('li').removeClass("active");
    self.$el.find('a#viewThemeTemplates').parent('li').addClass("active");
    return self;
  },
  renderPreview: function () {
    var self = this;
    self.$previewEl = $('<div class="themepreview" />');
    self.$el.append(this.$previewEl);
    self.$previewEl.hide();

    self.$previewEl.append('<div id="formPreviewContainer"></div>');


    // Move the loading to the bottom of this element's dom
    self.loading.remove();
    self.$el.append(self.loading);
    return self;
  },

  formSelect: function (e) {
    var self = this;
    var formId = $(e.target).val();
    var form = self.formCollection.findWhere({"_id": formId});

    var rawData = (form) ? JSON.stringify(form.toJSON()) : undefined;


    var ele = self.$el.find('div.formPreviewContents');
    if (!rawData) {
      ele.html("");
    } else {
      $fh.forms.renderFormFromJSON({rawData: rawData, "container": ele});
    }
  },

  /**
   *
   * Note this is called when a row in a table is clicked.
   */
  updatePreview: function (updatedModel) {
    var self = this;
    var previewTheme = new App.View.FormThemesEdit({ theme: updatedModel, readOnly: true});
    self.$previewEl.find('#formPreviewContainer').html(previewTheme.render().$el);


    previewTheme.$el.removeClass('span10');
    self.$previewEl.show();

    dropdown = self.$previewEl.find('.apps-using-theme');

    dropdown.empty();

    var appsUsingTheme = updatedModel.get("apps") || [];
    if (appsUsingTheme.length > 0) {
      if (appsUsingTheme.length > 0) {
        _.each(appsUsingTheme, function (d) {
          dropdown.append('<li><a class="formapp-link" data-_id="' + d.id + '" href="#">' + d.title + '</a></li>');
        });
      } else {
        dropdown.append('<li class="text">No apps using this form</li>');
      }

    }


    var prevContainer = self.$el.find('#previewContainer');
    prevContainer.html(self.templates.$previewOutline()).show();
    prevContainer.append(self.templates.$formselect({"forms": self.formData}));
    prevContainer.find('style').remove();
    prevContainer.append("<style id='themeStyle'>" + updatedModel.get('css') + "</style>");
    self.$el.find('.themesInnerContainer').append(self.templates.$menu({"themeView": false}));
  }
});