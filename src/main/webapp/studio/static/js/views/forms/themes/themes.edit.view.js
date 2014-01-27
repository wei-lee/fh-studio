var App = App || {};
App.View = App.View || {};

App.View.FormThemesEdit = App.View.Forms.extend({
  templates : {
    formSaveCancel : '#formSaveCancel',
    form_back : '#form_back',
    themeName : '#themeName',
    themePreviewButton : '#themePreviewButton',
    themeColourRow : '#themeColourRow',
    themeFontRow : '#themeFontRow',
    themeBorderRow : '#themeBorderRow',
    themeBorderRowReadOnly : '#themeBorderRowReadOnly',
    themeFontRowReadOnly : '#themeFontRowReadOnly',
    'themeLogo' : '#themeLogo',
    previewOutline: '#preview_outline',
    formselect:'#form_select'
  },
  events : {
    'click .btn-form-save' : 'onThemeSave',
    'click .btn-form-cancel' : 'back',
    'click .btn-forms-back' : 'back',
    'click .btn-preview-theme' : 'onPreviewTheme',
    'change #formSelect' : 'formSelect'
  },
  initialize: function(options){
    this.constructor.__super__.initialize.apply(this, arguments);
    this.options = options;
    this.theme = options.theme;
    this.readOnly = (options.hasOwnProperty('readOnly')) ? options.readOnly : true;
    this.formCollection = new App.Collection.Form();
    $fh.forms.init({
      config: {
        "cloudHost": "", "appid": new Date().getTime()
      },
      "updateForms": false
    }, function () {
      console.log("fh forms callback");
    });//todo figure out why this callback is not being called in studio, as we are currently only rendering forms we don't need a full setup.


  },
  formSelect : function (e){
    var self = this;
    var formId = $(e.target).val();
    var form = this.formCollection.findWhere({"_id":formId});
    var rawData = (form) ? JSON.stringify(form.toJSON()) : undefined;
    var ele = self.$el.find('div.formPreviewContents');

    if(! rawData){
      ele.html("");
    }else{
      $fh.forms.renderFormFromJSON({rawData: rawData, "container": ele});
    }
  },

  onPreviewTheme : function (e){
    var self = this;
    var prevButton = $(e.target);
    var prevVisible = prevButton.data("visible");
    var leftContainer = self.$el.find('#leftThemeContainer');
    var centerContainer = self.$el.find('#centerThemeContainer');
    var prevContainer = self.$el.find('#previewContainer');
    if(true === prevVisible ){

      prevButton.text("Show Preview");
      prevButton.data("visible",false);
      prevContainer.hide();
      //expand the edit area
      leftContainer.removeClass("span3").addClass("span4");
      centerContainer.removeClass('span6').addClass('span7');

    }else{
      //shrink edit area
      prevButton.text("Hide Preview");
      prevButton.data("visible",true);
      leftContainer.removeClass("span4").addClass("span3");
      centerContainer.removeClass('span7').addClass('span6');
      prevContainer.show();
    }
  },

  render : function(){
    var self = this;
    this.$el.addClass('span10 themeedit');
    this.breadcrumb(['Forms', 'Themes', 'Edit Theme']);

    if (!this.readOnly){
      this.$el.append(this.templates.$form_back());
      this.$el.append(this.templates.$themeName( { name : this.theme.get(this.CONSTANTS.THEME.NAME) }));
      this.$el.append(this.templates.$themePreviewButton());
      this.$el.addClass('preview');
    }

    this.$themesInnerContainer = $('<div class="themesInnerContainer"></div>');
    this.$left = $('<div id="leftThemeContainer" class="span3"></div>');
    this.$right = $('<div id="centerThemeContainer" class="span4"></div>');
    this.$preview = $('<div id="previewContainer" class="span3 hide" style="width: 227px;"></div>');
    this.$themesInnerContainer.append(this.$left, this.$right, this.$preview);

    this.$logo = this.renderLogo();
    this.$left.append(this.$logo);

    this.$colours = this.renderColours();
    this.$left.append(this.$colours);

    this.$typography = this.renderTypography();
    this.$right.append(this.$typography);

    this.$borders = this.renderBorders();
    this.$right.append(this.$borders);

    this.$el.append(this.$themesInnerContainer);

    if (!this.readOnly){
      this.$el.append(this.templates.$formSaveCancel());
    }


    if (!this.readOnly){
      var prevWrapper = this.$el.first("#themesInnerContainer");
      prevWrapper.find('style').remove();
      prevWrapper.append('<style id="themeStyle">'+this.theme.get("css")+'</style>');
      this.$el.find('.btn-preview-theme').trigger("click");

      this.$el.find('#leftThemeContainer').removeClass("span4").addClass("span3");
      this.$el.find('#centerThemeContainer').removeClass('span4').addClass('span6');

      self.formCollection.fetch({"success":function (forms){
        var formData = [];
        forms.forEach(function (f){
           formData.push({
             "name": f.get("name"),
             "_id": f.get("_id")
           });
        });
        self.formData = formData;
        self.renderPreview();
      },"error":function (err){
        console.log("forms fetch error ", err);
        self.message('Error fetching forms ', 'danger');
      }});

    }
    return this;
  },
  renderLogo : function(){
    var self = this,
    typogEl = $('<div class="logo"></div>'),
    logoBase64 = this.theme.get(this.CONSTANTS.THEME.LOGO).base64String;
    typogEl.append('<h4>Logo</h4>');
    typogEl.append(this.templates.$themeLogo({ logoBase64 : logoBase64}));
    if (!this.readOnly){
      var fileBrowse = $('<br /><input type="file" id="logoUpload" name="logo"><br />');
      typogEl.append(fileBrowse);
    }

    return typogEl;
  },
  renderColours : function(){
    var self = this,
    coloursEl = $('<div class="colours"></div>'),
    colours = this.theme.get(this.CONSTANTS.THEME.COLOURS);
    _.each(colours, function(subheadings, heading){
      var sectionContainer = $('<div class=" themesection ' + heading + '"></div>');
      sectionContainer.append('<h4>' + heading + '</h4>');

      var colourSection = $('<div class="coloursection well themesectionBody" data-section="' + heading + '"></div>');
      _.each(subheadings, function(colorHex, name){
        var colourInput = $(self.templates.$themeColourRow( { name : name, value : colorHex } )),
        input = $(colourInput.find('input'));
        input.change(function(){
          self.syncThemeModel.call(self);
        });
        self.spectrumify(input, { color : colorHex }, 'color');
        colourSection.append( colourInput );
      });
      sectionContainer.append(colourSection);
      coloursEl.append(sectionContainer);
    });
    return coloursEl;
  },
  renderTypography : function(){
    var self = this,
    typogEl = $('<div class="typography  themesection"></div>'),
    typogElBody = $('<div class="themesectionBody well"></div>'),
    typog = this.theme.get(this.CONSTANTS.THEME.TYPOGRAPHY);
    typogEl.append('<h4>Typography</h4>');
    _.each(typog, function(fontAttributes, heading){
      var fontRow = self.selectsRow('Font', heading, fontAttributes);
      fontRow.change(function(){
         self.syncThemeModel.call(self);
      });
      typogElBody.append(fontRow);
    });
    typogEl.append(typogElBody);
    return typogEl;
  },
  renderBorders : function(){
    var self = this,
    bordersEl = $('<div class="borders  themesection"></div>'),
    bordersElBody = $('<div class="themesectionBody well"></div>'),
    borders = this.theme.get(this.CONSTANTS.THEME.BORDERS);
    bordersEl.append('<h4>Borders</h4>');
    _.each(borders, function(borderAttributes, heading){
      var row = self.selectsRow('Border', heading, borderAttributes);
      row.change(function (){
         self.syncThemeModel.call(self);
      });
      bordersElBody.append(row);
    });
    bordersEl.append(bordersElBody);
    return bordersEl;
  },
  selectsRow : function(type, heading, attributes){
    var tplBaseName = '$theme' + type + 'Row',
    tplIncReadOnlyName = (this.readOnly) ? tplBaseName + 'ReadOnly' : tplBaseName, // Now includes the "ReadOnly" string if it's needed
    tpl = this.templates[tplIncReadOnlyName],
    row = $(tpl({r : attributes, name : heading})),
    input = $(row.find('input.colour'));
    this.spectrumify(input, attributes, 'colour');

    // Make sure the right select dropdown has the selected attribute to begin with
    row.find('select').each(function(){
      var selectName = $(this).attr('name'),
      selectedValue = attributes[selectName],
      selectedEl = $(this).find('option[value=' + selectedValue + ']');
      selectedEl.attr('selected', 'selected');
    });
    return row;
  },

  syncThemeModel : function (){
    var self = this,
      name = this.$el.find('input[name=themename]').val(),
      colourSections = this.$el.find('.coloursection'),
      fontRows = this.$el.find('.fontrow'),
      borderRows = this.$el.find('.borderrow'),
      colours = {},
      typog = {},
      borders = {},
      fileInput, file;
    // Set the name
    this.theme.set(this.CONSTANTS.THEME.NAME, name);

    /*
     Colours
     iterate over every colour section dom node - we use these to separate section titles
     */

    $(colourSections).each(function(){
      var el = $(this),
      sectionName = el.data('section');
      colours[sectionName] = {};
      // Iterate over every specific colour input in this section - key value parts here
      el.find('input').each(function(){
        var inputName = $(this).attr('name'),
        value = $(this).val();
        colours[sectionName][inputName] = value;
      });
    });
    this.theme.set(this.CONSTANTS.THEME.COLOURS, colours);


    /*
     Typography
     */
    $(fontRows).each(function(){
      var name = $(this).data('name'),
      row = {};
      $($(this).find('input, select').serializeArray()).each(function(){
        row[this.name] = this.value;
      });
      typog[name] = row;
    });
    this.theme.set(this.CONSTANTS.THEME.TYPOGRAPHY, typog);

    /*
     Borders
     */
    $(borderRows).each(function(){
      var name = $(this).data('name'),
      row = {};
      $($(this).find('input, select').serializeArray()).each(function(){
        row[this.name] = this.value;
      });
      borders[name] = row;
    });
    this.theme.set(this.CONSTANTS.THEME.BORDERS, borders);

    var css = App.forms.themeCSSGenerator(this.theme.toJSON())();
    var prevWrapper = self.$el.first("#themesInnerContainer");
    prevWrapper.find('style').remove();
    prevWrapper.append('<style id="themeStyle">'+css+'</style>');

  },

  onThemeSave : function(){
   var self = this;
   self.syncThemeModel();

    /*
     Last but not least, logo - an async html5 get base64 function
     */
    var fileInput = this.$el.find('input#logoUpload');
    if (fileInput.length>0 && fileInput[0].files && fileInput[0].files.length>0){
      fileInput = fileInput[0];
      file = fileInput.files[0];
      
      // 1mb max file size
      if (file.size > 1048576){
        return self.message('Error updating theme - logo must be <1mb', 'danger');
      }

      if (file.type.indexOf("image/")===-1){
        return self.message('Error updating theme - logo must be an image', 'danger');
      }
      var filereader = new FileReader();
      filereader.readAsDataURL(file);
      filereader.onload = function(e) {
        var b64 = e.target.result.replace("data:image/png;base64,", "").replace("data:image/jpg;base64,", "");

        //Getting image height and width
        var image = new Image();

        image.onload = function(){

          var themeLogo = {};
          themeLogo.base64String = b64;
          themeLogo.height = image.height;
          themeLogo.width = image.width;
          self.theme.set(self.CONSTANTS.THEME.LOGO, themeLogo);
          return done();
        };

        image.src = b64;
      };
    }else{
      // No image to upload - all done
      return done();
    }

    function done(){
      self.collection.sync('update', self.theme.toJSON(), { success : function(){
        self.back();
        self.message('Theme updated successfully');
      }, error : function(){
        self.message('Error updating theme', 'danger');
      }});
    }
  },
  spectrumify : function(input, attrs, attrVal){
    input.spectrum({
      showButtons: false,
      disabled: this.readOnly,
      color : attrs[attrVal]
    });
  },
  back : function(){
    this.trigger('back');
    this.breadcrumb(['Forms', 'Themes List']);
  },
  renderPreview : function(){
    var self = this;
    var themeInner = self.$el.find('.themesInnerContainer');
    var prevButton = self.$el.find('.btn-preview-theme');
    var prevVisible = prevButton.data("visible");
    themeInner.find('#leftThemeContainer').removeClass("span4").addClass("span3");
    themeInner.find('#centerThemeContainer').removeClass('span4').addClass('span6');
    themeInner.find('#previewContainer').show().html(self.templates.$previewOutline());
    self.$el.find('#previewContainer').append("<div class='span3'></div> ");
    self.$el.find('#previewContainer').append(self.templates.$formselect({"forms":self.formData}));
  }
});