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
    themeLogo : '#themeLogo',
    previewOutline: '#preview_outline',
    formselect:'#form_select',
    themeFunctionalAreasTable: '#themeFunctionalAreasTable',
    sectionContainer: '#sectionContainer',
    themeStyleSection: '#themeStyleSection',
    styleSpacing: '#styleSpacing'
  },
  events : {
    'click .btn-form-save' : 'onThemeSave',
    'click .btn-form-cancel' : 'back',
    'click .btn-forms-back' : 'back',
    'change #formSelect' : 'formSelect',
    'change #themeConfigurator input[type="number"]' : 'colorChanged'
  },
  colorChanged: function(e){
    var self = this;
    self.syncThemeModel.call(self);
  },
  initialize: function(options){
    var self = this;
    self.constructor.__super__.initialize.apply(self, arguments);
    self.options = options;
    self.theme = options.theme;
    self.readOnly = (options.hasOwnProperty('readOnly')) ? options.readOnly : true;
    self.formCollection = new App.Collection.Form();
    $fh.forms.init({
      config: {
        "cloudHost": "",
        "appid": new Date().getTime(),
        "studioMode":true
      },
      "updateForms": false
    }, function () {
    });
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
  getThemeElementVal : function(sectionIndex, subSectionIndex, elementType){
    var self = this;
    var defaultTheme = App.forms.themeCSSGenerator().baseTheme;
    var sections = self.theme.get(self.CONSTANTS.THEME.SECTIONS) ? self.theme.get(self.CONSTANTS.THEME.SECTIONS) : defaultTheme[self.CONSTANTS.THEME.SECTIONS];

    var subSections = sections[sectionIndex][self.CONSTANTS.THEME.SUBSECTIONS] ? sections[sectionIndex][self.CONSTANTS.THEME.SUBSECTIONS] : defaultTheme[self.CONSTANTS.THEME.SECTIONS][sectionIndex][self.CONSTANTS.THEME.SUBSECTIONS];

    var element = subSections[subSectionIndex] ? subSections[subSectionIndex] : defaultTheme[self.CONSTANTS.THEME.SECTIONS][sectionIndex][self.CONSTANTS.THEME.SUBSECTIONS][subSectionIndex];

    var elementVal = element[elementType] ? element[elementType] : defaultTheme[self.CONSTANTS.THEME.SECTIONS][sectionIndex][self.CONSTANTS.THEME.SUBSECTIONS][subSectionIndex][elementType];

    return elementVal;
  },

  render : function(){
    //this.options.help.set('body_template', '#help-forms-dashboard-template');
    var self = this,
      classes = (typeof $fw === 'undefined') ? "themeedit row-fluid" : "span9 themeedit";

    if(self.readOnly){
      classes = "span11 themeedit";
    }
    self.$el.addClass(classes);
    self.breadcrumb(['Forms', 'Themes', 'Edit Theme']);

    if (this.options.subnavbar) {
      self.$el.prepend('<div class="subnav_container"></div>');
      self.options.subnavbar.setElement(this.$('.subnav_container')).render();
      self.$container = $('<div class="container_with_subnav"></div>');
    }else{
      self.$container = $('<div class=""></div>');
    }


    if (!self.readOnly){
      self.$container.append(self.renderLogo());
      self.$container.addClass('preview');
    } else {
      self.$container.append(self.renderLogo());
    }

    self.$themesInnerContainer = $('<div class="themesInnerContainer"></div>');
    self.$left = $('<div id="leftThemeContainer" class="span6"></div>');
    self.$preview = $('<div id="previewContainer" class="span4 boxed-group Info" data-title="Preview" style="float:right;"></div>');


    self.$themesInnerContainer.append(self.$left, self.$preview);
    if (!self.readOnly){
      $(window).scroll(function(){
        if(!self.scrolled){
          var navBarHeight = $('.navbar-inner').outerHeight();
          var headerHeight = $('#header').outerHeight();

          var offsetTop = navBarHeight + headerHeight;

          var rightElWidth = self.$preview.outerWidth();
          self.previewOffset = self.$preview.offset();

          self.$preview.css('width', rightElWidth);
          self.$preview.affix({offset: {top: self.previewOffset.top, bottom:0}});
          self.scrolled = true;
        }
      });

      $(window).resize(function(){
        self.$preview.css('width', "");
        self.scrolled = false;
        var currentlyAffixed = false;
        if(self.$preview.hasClass("affix")){
          currentlyAffixed = true;
          self.$preview.removeClass("affix");
        }

        if(!self.previewOffset){
          self.previewOffset = self.$preview.offset();
        }

        var rightElWidth = self.$preview.outerWidth();

        self.$preview.css('width', rightElWidth);
        self.$preview.affix({offset: {top: self.previewOffset.top, bottom:0}});

        if(currentlyAffixed){
          self.$preview.addClass("affix");
        }
      });
    }

    self.$themeFunctionalAreasTable= $(self.templates.$themeFunctionalAreasTable());

    var themeStructure = App.forms.themeCSSGenerator().styleStructure;

    _.each(themeStructure[self.CONSTANTS.THEME.SECTIONS], function(strThemeSection, strThemeSectionIdx){
      var sectionContainer = $(self.templates.$sectionContainer({strThemeSection: strThemeSection}));
      var sliderControl = sectionContainer.find('.sliderControl');
      sliderControl.click(function(e){
        var icon = $(this).find('.icon-4');
        if(icon.hasClass('icon-circle-arrow-up')){
          icon.addClass('icon-circle-arrow-down');
          icon.removeClass('icon-circle-arrow-up');
        } else {

          icon.addClass('icon-circle-arrow-up');
          icon.removeClass('icon-circle-arrow-down');
        }
        $(sectionContainer).find('.configSubSectionContainer').slideToggle('slow');
      });

      _.each(strThemeSection[self.CONSTANTS.THEME.SUBSECTIONS], function(strSubSection, strThemeSubSectionIdx){
        var fullSectionId = strThemeSection.id + "_" + strSubSection.id;
        var subSectionHeading = strSubSection.label;
        var functionAreasRow = $(self.templates.$themeStyleSection({fullSectionId: fullSectionId, subSectionHeading: subSectionHeading}));
        var typographyElement = "";
        var backgroundElement = "";
        var borderElement = "";
        var stylingContainer = functionAreasRow.find('.stylingContainer');

        //Adding sliders for styling
        var sliderControl = functionAreasRow.find('.sliderControlSubSection');
        sliderControl.click(function(e){
          var icon = $(this).find('.icon-2');
          if(icon.hasClass('icon-circle-arrow-up')){
            icon.addClass('icon-circle-arrow-down');
            icon.removeClass('icon-circle-arrow-up');
          } else {
            icon.addClass('icon-circle-arrow-up');
            icon.removeClass('icon-circle-arrow-down');
          }

          $(functionAreasRow).find('.stylingContainer').slideToggle('slow');
        });

        if(strSubSection.style.background){
          var backgroundInfo = self.getThemeElementVal(strThemeSectionIdx, strThemeSubSectionIdx, self.CONSTANTS.THEME.BACKGROUND);
          backgroundElement = self.renderColours(fullSectionId, backgroundInfo);
        } else {
          backgroundElement = "";
        }

        stylingContainer.append(backgroundElement);

        if(strSubSection.style.typography){
          var typographyInfo = self.getThemeElementVal(strThemeSectionIdx, strThemeSubSectionIdx, self.CONSTANTS.THEME.TYPOGRAPHY);
          typographyElement = self.renderTypography(fullSectionId, typographyInfo);
        } else {
          typographyElement = "";
        }

        stylingContainer.append(typographyElement);


        if(strSubSection.style.border){
          var borderInfo = self.getThemeElementVal(strThemeSectionIdx, strThemeSubSectionIdx, self.CONSTANTS.THEME.BORDERS);
          borderElement = self.renderBorders(fullSectionId, borderInfo);
        } else {
          borderElement = "";
        }

        var marginElement = null, paddingElement = null;

        if(strSubSection.style.margin){
          var marginInfo = self.getThemeElementVal(strThemeSectionIdx, strThemeSubSectionIdx, self.CONSTANTS.THEME.MARGIN);
          marginElement = self.templates.$styleSpacing({spacingInfo: marginInfo, title: "Margin", readOnly: self.readOnly});
          stylingContainer.append(marginElement);
        }

        if(strSubSection.style.padding){
          var paddingInfo = self.getThemeElementVal(strThemeSectionIdx, strThemeSubSectionIdx, self.CONSTANTS.THEME.PADDING);
          paddingElement = self.templates.$styleSpacing({spacingInfo: paddingInfo, title: "Padding", readOnly: self.readOnly});
          stylingContainer.append(paddingElement);
        }

        stylingContainer.append(borderElement);

        functionAreasRow.append(stylingContainer);
        sectionContainer.append(functionAreasRow);

        self.$themeFunctionalAreasTable.append(sectionContainer);
      });
    });

    self.$left.append(this.$themeFunctionalAreasTable);

    self.$container.append(self.$themesInnerContainer);

    if (!this.readOnly){
      self.$container.append(self.templates.$formSaveCancel());
    }
    var prevWrapper = self.$el.first("#themesInnerContainer");
    prevWrapper.find('style').remove();
    prevWrapper.append('<style id="themeStyle">'+this.theme.get("css")+'</style>');
    self.$el.find('.btn-preview-theme').trigger("click");

    self.$el.find('#leftThemeContainer').removeClass("span9").addClass("span6");
    //TODO: This doesn't belong here - form.preview.view.js should be capable of loading forms collection if none supplied..
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
      self.message('Error fetching forms ', 'danger');
    }});
    self.$el.append(self.$container);
    return self;
  },
  renderLogo : function(){
    var self = this;
    var logoBase64 = self.theme.get(this.CONSTANTS.THEME.LOGO).base64String;
    self.$themeLogo = $(self.templates.$themeLogo({ logoBase64 : logoBase64, readOnly: self.readOnly, name: self.theme.get(self.CONSTANTS.THEME.NAME)}));
    if(self.options.statsDiv){
      self.$themeLogo.find('.themeStatsContainer').append(self.options.statsDiv);
    }

    return self.$themeLogo;
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

    var themeStructure = App.forms.themeCSSGenerator().styleStructure;

    _.each(themeStructure[self.CONSTANTS.THEME.SECTIONS], function(strThemeSection, strThemeSectionIdx){

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

        var marginObj = {top: 0, right: 0, bottom: 0, left: 0};
        var paddingObj = {top: 0, right: 0, bottom: 0, left: 0};
        var key;
        var inputName;
        var marginEle = sectionContainer.find('.styleMargin');
        if(marginEle && marginEle.length > 0){
          for(key in marginObj){
            inputName = '.style' + key + 'Input input';
            var marginInputEle =  marginEle.find(inputName);
            if(marginInputEle && marginInputEle.length > 0){
              marginObj[key] = marginInputEle.val();
            }
          }
          subSectionObject[self.CONSTANTS.THEME.MARGIN] = marginObj;
        }


        var paddingEle = sectionContainer.find('.stylePadding');
        if(paddingEle && paddingEle.length > 0){
          for(key in paddingObj){
            inputName = '.style' + key + 'Input input';
            var paddingInputEle =  paddingEle.find(inputName);
            if(paddingInputEle && paddingInputEle.length > 0){
              paddingObj[key] = paddingInputEle.val();
            }
          }
          subSectionObject[self.CONSTANTS.THEME.PADDING] = paddingObj;
        }

        sectionObject.sub_sections.push(subSectionObject);
      });

      sectionVals.push(sectionObject);
    });

    self.theme.set(self.CONSTANTS.THEME.SECTIONS, sectionVals);
    self.theme.set(self.CONSTANTS.THEME.STRUCTURE, themeStructure);
    self.theme.set(self.CONSTANTS.THEME.NAME, themeName);
    var themeGenerationResult = App.forms.themeCSSGenerator(self.theme.toJSON()).generateThemeCSS();

    if(themeGenerationResult.generationResult.failed){
      console.error("Theme generation failed: ", themeGenerationResult.generationResult);
      return;
    }
    var css = themeGenerationResult.generatedCSS;
    self.theme.set(self.CONSTANTS.THEME.CSS, css);


    var prevWrapper = self.$el.first("#themesInnerContainer");
    prevWrapper.find('style').remove();
    prevWrapper.append('<style id="themeStyle">'+css+'</style>');

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
          preview:	[0, 0, 3, 1],
          hex:		[0, 1, 1, 1],
          alpha:		[1, 1, 2, 1],
          map:		[0, 2, 3, 3],	// Left, Top, Width, Height (in table cells).
          bar:		[3, 2, 1, 3]
        },
        inline: true,
        draggable: false,
        color : colorVal,
        buttonClass: "btn-primary",
        colorFormat: 'RGBA',
        rgb: false,
        hsv: false,
        title: "Choose A Color",
        select: function(formatted, colorpicker){
          self.colorChanged();
        },
        close: function(formatted, colorpicker){
          self.colorChanged();
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
  renderPreview: function () {
    var self = this;
    var themeInner = self.$el.find('.themesInnerContainer');
    var prevButton = self.$el.find('.btn-preview-theme');
    var prevVisible = prevButton.data("visible");
//    self.$left.removeClass("span4").addClass("span7");
    themeInner.find('#centerThemeContainer').removeClass('span4').addClass('span6');
    self.$preview.show().html(self.templates.$previewOutline());
    var formContainer = $('<div class="selectContainer"></div>');
    formContainer.append(self.templates.$formselect({"forms": self.formData}));
    self.$preview.append(formContainer);
    // Direct lookup on the thing that needs relative for some reason doesn't work
//    self.$el.find('#preview_wrapper').children('div').css('position', 'relative'); // new preview fix
    var firstFormId;

    if (self.formData) {
      firstFormId = self.formData[0]._id;
    }

    self.$preview.find('#formSelect option[value="' + firstFormId + '"]').attr("selected", "selected");
    self.$preview.find('#formSelect').trigger('change');
  }
});