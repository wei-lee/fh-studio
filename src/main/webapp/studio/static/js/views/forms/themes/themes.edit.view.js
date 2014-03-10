App.View = App.View || {};

App.View.FormThemesEdit = App.View.Forms.extend({
  templates : {
    formSaveCancel : '#formSaveCancel',
    themeName : '#themeName',
    themePreviewButton : '#themePreviewButton',
    themeColourRow : '#themeColourRow',
    themeFontRow : '#themeFontRow',
    themeBorderRow : '#themeBorderRow',
    themeBorderRowReadOnly : '#themeBorderRowReadOnly',
    themeFontRowReadOnly : '#themeFontRowReadOnly',
    'themeLogo' : '#themeLogo',
    previewOutline: '#preview_outline',
    formselect:'#form_select',
    themeFunctionalAreas: "#theme_functional_areas",
    themeFunctionalAreasSection: "#theme_functional_areas_section",
    themeFunctionalAreasRow: "#theme_functional_areas_row"
  },
  events : {
    'click .btn-form-save' : 'onThemeSave',
    'click .btn-form-cancel' : 'back',
    'click .btn-forms-back' : 'back',
    'click .btn-preview-theme' : 'onPreviewTheme',
    'change #formSelect' : 'formSelect'
  },
  colorChanged: function(e){
    var self = this;
    console.log("COLOR CHANGED: ", e);
    self.syncThemeModel.call(self);
  },
  initialize: function(options){
    var self = this;
    this.constructor.__super__.initialize.apply(this, arguments);
    this.options = options;
    this.theme = options.theme;
    this.readOnly = (options.hasOwnProperty('readOnly')) ? options.readOnly : true;
    this.formCollection = new App.Collection.Form();
    $fh.forms.init({
      config: {
        "cloudHost": "",
        "appid": new Date().getTime(),
        "studioMode":true
      },
      "updateForms": false
    }, function () {
      console.log("fh forms callback");
    });

    self.off("changedTheme");
    self.on("changedTheme", self.colorChanged);
  },
  formSelect : function (e){
    var self = this;
    var formId = $(e.target).val();
    var form = this.formCollection.findWhere({"_id":formId});

    if(form){
      form.fetch({
        success : function(form){
          var rawData = (form) ? JSON.stringify(form.toJSON()) : undefined;
          var ele = self.$el.find('div.formPreviewContents');

          if(! rawData){
            ele.html("");
          }else{
            $fh.forms.renderFormFromJSON({rawData: rawData, "container": ele});
          }
        },
        error : function(){
          self.$el.find('#formSelect').empty().append('<li>Error loading apps using this form</li>');
        }
      });
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
  getThemeElementVal : function(sectionIndex, subSectionIndex, elementType){
    var self = this;
    return self.theme.get(self.CONSTANTS.THEME.SECTIONS)[sectionIndex][self.CONSTANTS.THEME.SUBSECTIONS][subSectionIndex][elementType];
  },

  render : function(){
    var self = this,
    classes = (typeof $fw === 'undefined') ? "themeedit row-fluid" : "span10 themeedit";
    self.$el.addClass(classes);
    self.breadcrumb(['Forms', 'Themes', 'Edit Theme']);

    if (this.options.subnavbar) {
      self.$el.prepend('<div class="subnav_container"></div>');
      self.options.subnavbar.setElement(this.$('.subnav_container')).render();
      self.$container = $('<div class="container_with_subnav"></div>');
    }else{
      self.$container = $('<div class=""></div>');
    }


    if (!this.readOnly){
      self.$container.append(self.templates.$themeName( { name : self.theme.get(self.CONSTANTS.THEME.NAME) }));
      self.$container.append(self.renderLogo());
      self.$container.append(self.templates.$themePreviewButton());
      self.$container.addClass('preview');
    } else {
      self.$container.append(self.renderLogo());
    }

    self.$themesInnerContainer = $('<div class="themesInnerContainer"></div>');
    self.$left = $('<div id="leftThemeContainer" class="span3"></div>');
    self.$right = $('<div id="centerThemeContainer" class="span4"></div>');
    self.$preview = $('<div id="previewContainer" class="span3 hide" style="width: 227px;"></div>');
    self.$themesInnerContainer.append(self.$left, self.$right, self.$preview);

    self.$themeFunctionalAreasTable= $('<div id="themeConfigurator" class="themeConfigContainer"><div class="configTitleContainer"><div class="configTitle">Sections</div><div class="configTitle">Typography</div><div class="configTitle">Background Color</div><div class="configTitle">Border</div></div></div>');


    _.each(self.theme.get(self.CONSTANTS.THEME.STRUCTURE)[self.CONSTANTS.THEME.SECTIONS], function(strThemeSection, strThemeSectionIdx){
      var sectionContainer = $('<div class="configSectionContainer"></div>');
      sectionContainer.append($('<div class="configSectionTitleContainer"><div class="configSectionTitle">' + strThemeSection.label + '</div><div class="configSectionTitleEmpty"></div><div class="configSectionTitleEmpty"></div class="configSectionTitleEmpty"><div class="configSectionTitleEmpty"></div></div>'));
      _.each(strThemeSection[self.CONSTANTS.THEME.SUBSECTIONS], function(strSubSection, strThemeSubSectionIdx){
        var fullSectionId = strThemeSection.id + "_" + strSubSection.id;
        var functionAreasRow = $('<div class="configSubSectionContainer" id="' + fullSectionId + '"></div>');
        var typographyHtml = "<div class='fontrow'></div>";
        var backgroundHtml = "<div class='colorRow'></div>";
        var borderHtml = "<div class='borderrow'></div>";
        var subSectionHeading = strSubSection.label;
        functionAreasRow.append($('<div class="configSubSectionHeading">' + subSectionHeading + '</div>'));


        if(strSubSection.style.typography){
          var typographyInfo = self.getThemeElementVal(strThemeSectionIdx, strThemeSubSectionIdx, self.CONSTANTS.THEME.TYPOGRAPHY);
          typographyHtml = self.renderTypography(fullSectionId, typographyInfo);
        }

        functionAreasRow.append(typographyHtml);

        if(strSubSection.style.background){
          var backgroundInfo = self.getThemeElementVal(strThemeSectionIdx, strThemeSubSectionIdx, self.CONSTANTS.THEME.BACKGROUND);
          backgroundHtml = self.renderColours(fullSectionId, backgroundInfo);
        }

        functionAreasRow.append(backgroundHtml);

        if(strSubSection.style.border){
          var borderInfo = self.getThemeElementVal(strThemeSectionIdx, strThemeSubSectionIdx, self.CONSTANTS.THEME.BORDERS);
          borderHtml = self.renderBorders(fullSectionId, borderInfo);
        }

        functionAreasRow.append(borderHtml);

        sectionContainer.append(functionAreasRow);

        self.$themeFunctionalAreasTable.append(sectionContainer);
      });
    });

    self.$left.append(this.$themeFunctionalAreasTable);

    self.$container.append(self.$themesInnerContainer);

    if (!this.readOnly){
      self.$container.append(self.templates.$formSaveCancel());
    }


    if (!this.readOnly){
      var prevWrapper = self.$el.first("#themesInnerContainer");
      prevWrapper.find('style').remove();
      prevWrapper.append('<style id="themeStyle">'+this.theme.get("css")+'</style>');
      self.$el.find('.btn-preview-theme').trigger("click");

      self.$el.find('#leftThemeContainer').removeClass("span4").addClass("span3");
      self.$el.find('#centerThemeContainer').removeClass('span4').addClass('span6');

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
    self.$el.append(self.$container);
    return self;
  },
  renderLogo : function(){
    var self = this;
    var typogEl = $('<div class="logo"></div>');
    var logoBase64 = self.theme.get(this.CONSTANTS.THEME.LOGO).base64String;
    typogEl.append('<h4>Logo</h4>');
    typogEl.append(self.templates.$themeLogo({ logoBase64 : logoBase64}));
    if (!self.readOnly){
      var fileBrowse = $('<br /><input type="file" id="logoUpload" name="logo"><br />');
      typogEl.append(fileBrowse);
    }
    return typogEl;
  },
  renderColours : function(fullSectionId, backgroundInfo){
    var self = this;
    var colorHex = backgroundInfo.background_color;

    var colourInput = $(self.templates.$themeColourRow( {id: fullSectionId, value : colorHex } )),
    input = $(colourInput.find('input'));
    self.spectrumify(colourInput, colorHex, fullSectionId, "color");
    return colourInput;
  },
  renderTypography : function(fullSectionId, typographyInfo){
    var self = this;
    var fontRow = self.selectsRow('Font', fullSectionId, typographyInfo, typographyInfo.fontColour);
    fontRow.change(function(){
      self.syncThemeModel.call(self);
    });

    return fontRow;
  },
  renderBorders : function(fullSectionId, borderInfo){
    var self = this;
    var row = self.selectsRow('Border', fullSectionId, borderInfo, borderInfo.colour);
    row.change(function (){
      self.syncThemeModel.call(self);
    });
    return row;
  },
  selectsRow: function(type, fullSectionId, attributes, colourVal){
    var self = this;
    var tplBaseName = '$theme' + type + 'Row',
    tplIncReadOnlyName = (self.readOnly) ? tplBaseName + 'ReadOnly' : tplBaseName, // Now includes the "ReadOnly" string if it's needed
    tpl = self.templates[tplIncReadOnlyName],
    row = $(tpl({r : attributes, name : fullSectionId})),
    input = $(row.find('input.colour'));

    self.spectrumify(row, colourVal, fullSectionId, type);

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
    var self = this;
    var themeName = self.$el.find('input[name=themename]').val();


    var sectionVals = [];

    _.each(self.theme.get(self.CONSTANTS.THEME.STRUCTURE)[self.CONSTANTS.THEME.SECTIONS], function(strThemeSection, strThemeSectionIdx){

      var sectionObject = {id: strThemeSection.id, label: strThemeSection.label, "sub_sections": []};
      _.each(strThemeSection[self.CONSTANTS.THEME.SUBSECTIONS], function(strSubSection, strThemeSubSectionIdx){
        var subSectionObject = {id: strSubSection.id, label: strSubSection.label};
        var fullSectionId = strThemeSection.id + "_" + strSubSection.id;

        var sectionContainer = self.$el.find('#' + fullSectionId + '.configSubSectionContainer');
        if(strSubSection.style.typography){
          var fontRow = sectionContainer.find('.fontrow');

          var fontSize = fontRow.find('select.size').val();
          var fontFamily = fontRow.find('select.family').val();
          var fontStyle = fontRow.find('select.style').val();
          var fontColour = fontRow.find('input.colour').val();
          subSectionObject[self.CONSTANTS.THEME.TYPOGRAPHY] = {
            "fontSize": fontSize,
            "fontFamily": fontFamily,
            "fontStyle": fontStyle,
            "fontColour": fontColour
          };
        }


        if(strSubSection.style.background){
          var colorRow = sectionContainer.find('.colorRow');

          var backgroundInput = colorRow.find('input.colour');
          var backgroundVal = backgroundInput.val();
          subSectionObject[self.CONSTANTS.THEME.BACKGROUND] = {"background_color": backgroundVal};
        }


        if(strSubSection.style.border){
          var borderRow = sectionContainer.find('.borderrow');

          var thickness  = borderRow.find('select.thickness');
          var style = borderRow.find('select.style');
          var borderColor = borderRow.find('input.colour');

          var thicknessVal = thickness.val();
          var styleVal = style.val();
          var borderColorVal = borderColor.val();
          subSectionObject[self.CONSTANTS.THEME.BORDERS] = {
            "thickness": thicknessVal,
            "style": styleVal,
            "colour": borderColorVal
          };
        }

        sectionObject.sub_sections.push(subSectionObject);
      });

      sectionVals.push(sectionObject);
    });

    self.theme.set(self.CONSTANTS.THEME.SECTIONS, sectionVals);
    self.theme.set(self.CONSTANTS.THEME.NAME, themeName);
    var themeGenerationResult = App.forms.themeCSSGenerator(self.theme.toJSON()).generateThemeCSS();

    if(themeGenerationResult.generationResult.failed){
      console.log("Theme generation failed: ", themeGenerationResult.generationResult);
      return;
    }
    var css = themeGenerationResult.generatedCSS;
    self.theme.set(self.CONSTANTS.THEME.CSS, css);


    var prevWrapper = self.$el.first("#themesInnerContainer");
    prevWrapper.find('style').remove();
    prevWrapper.append('<style id="themeStyle">'+css+'</style>');


//    name = this.$el.find('input[name=themename]').val(),
//    colourSections = this.$el.find('.coloursection'),
//    fontRows = this.$el.find('.fontrow'),
//    borderRows = this.$el.find('.borderrow'),
//    colours = {},
//    typog = {},
//    borders = {},
//    fileInput, file;
//    // Set the name
//    self.theme.set(this.CONSTANTS.THEME.NAME, name);
//
//    /*
//     Colours
//     iterate over every colour section dom node - we use these to separate section titles
//     */
//
//    $(colourSections).each(function(){
//      var el = $(this),
//      sectionName = el.data('section');
//      colours[sectionName] = {};
//      // Iterate over every specific colour input in this section - key value parts here
//      el.find('input').each(function(){
//        var inputName = $(this).attr('name'),
//        value = $(this).val();
//        colours[sectionName][inputName] = value;
//      });
//    });
//    self.theme.set(self.CONSTANTS.THEME.COLOURS, colours);
//
//
//    /*
//     Typography
//     */
//    $(fontRows).each(function(){
//      var name = $(this).data('name'),
//      row = {};
//      $($(this).find('input, select').serializeArray()).each(function(){
//        row[this.name] = this.value;
//      });
//      typog[name] = row;
//    });
//    self.theme.set(self.CONSTANTS.THEME.TYPOGRAPHY, typog);
//
//    /*
//     Borders
//     */
//    $(borderRows).each(function(){
//      var name = $(this).data('name'),
//      row = {};
//      $($(this).find('input, select').serializeArray()).each(function(){
//        row[this.name] = this.value;
//      });
//      borders[name] = row;
//    });
//    self.theme.set(self.CONSTANTS.THEME.BORDERS, borders);
//
//    var css = App.forms.themeCSSGenerator(this.theme.toJSON())();
//    var prevWrapper = self.$el.first("#themesInnerContainer");
//    prevWrapper.find('style').remove();
//    prevWrapper.append('<style id="themeStyle">'+css+'</style>');

  },

  onThemeSave : function(e){
    if (e){
      e.preventDefault();
    }
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
      self.theme.save({}, {
        success : function(res){
          self.back();
          self.message('Theme updated successfully');
        },
        error : function(){
          self.message('Error updating theme', 'danger');
        }
      });
    }
  },
  spectrumify : function(colorRow, colorVal, fieldId, fieldType){
    var self = this;
    var input = colorRow.find('input');
    var fullFieldId = fieldType ? fieldType.toLowerCase() + "_" + fieldId : fieldId;
    var altField = "." + fullFieldId;
    var colorDisplay = colorRow.find(altField);
    colorDisplay.css("background-color", colorVal);

    if(!this.readOnly){
      var colorPickerInput = input.colorpicker({
        altField: altField,
        altAlpha: true,
        altProperties: "background-color,color",
        alpha: true,
        parts:	['header', 'map', 'bar', 'hex', 'alpha', 'footer', 'preview'],
        layout: {
          preview:	[0, 0, 2, 1],
          hex:		[2, 0, 1, 1],
          map:		[0, 1, 3, 3],	// Left, Top, Width, Height (in table cells).
          bar:		[3, 1, 1, 3],
          alpha:		[3, 0, 1, 1]
        },
        inline: false,
        color : colorVal,
        colorFormat: 'RGBA',
        rgb: false,
        hsv: false,
        title: "Choose A Color",
        select: function(formatted, colorpicker){
          console.log("SELECT");
          self.trigger("changedTheme");
        },
        close: function(formatted, colorpicker){
          console.log("CLOSE");
          self.trigger("changedTheme");
        }
      });

      colorDisplay.click(function(e){
        e.preventDefault();
        colorPickerInput.colorpicker('open');
      });
   }
  },
  back : function(e){
    if (e){
      e.preventDefault();
    }

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
    // Direct lookup on the thing that needs relative for some reason doesn't work
    self.$el.find('#preview_wrapper').children('div').css('position', 'relative'); // new preview fix
  },
  // Convert camel case attribute names to plain english - they all can be easily converted, so no need for big language map file
  deCamelCase : function(camelCaseName){
    camelCaseName = camelCaseName.replace( /([A-Z])/g, " $1" ); // Add spaces
    camelCaseName = camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1); // First letter goes to caps, then add the rest
    return camelCaseName;
  }
});