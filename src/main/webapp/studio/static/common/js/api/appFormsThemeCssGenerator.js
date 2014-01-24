
var FH_APPFORM_PREFIX = "fh_appform_";
var themeCSSFunctions = {};
var App = App || {};
App.forms = App.forms || {};



var FH_APPFORM_PREFIX = "fh_appform_";
var themeCSSFunctions = {};
var librariesNeeded = {}

themeCSSFunctions[FH_APPFORM_PREFIX] = {
  "logo" : function(themeJSON){
    var logoStr = "";
    var base64Image = themeJSON.logo.base64String;
    var imageHeight = themeJSON.logo.height;
    var imageWidth = themeJSON.logo.width;


    if(base64Image){
      logoStr += "background-image: url(\"" + base64Image + "\");"
      logoStr += "height: " + imageHeight + "px;";
      logoStr += "width:" + imageWidth + "px;";
      return logoStr;
    } else {
      return "";
    }
  },
  "button_navigation" : function(themeJSON){
    return this.get_button_css(themeJSON, "navigation", "buttons");
  },
  "button_navigation_active" : function(themeJSON){
    return this.get_button_css(themeJSON, "navigation_active", "buttons_active");
  },
  "button_action" : function(themeJSON){
    return this.get_button_css(themeJSON, "action", "buttons");
  },
  "button_action_active" : function(themeJSON){
    return this.get_button_css(themeJSON, "action_active", "buttons");
  },
  "button_cancel" : function(themeJSON){
    return this.get_button_css(themeJSON, "cancel", "buttons");
  },
  "button_cancel_active" : function(themeJSON){
    return this.get_button_css(themeJSON, "cancel_active", "buttons");
  },
  "navigation" : function(themeJSON){
    var navigationBarStr = "";
    var navigationBarColour = themeJSON.colours.backgrounds.navigationBar;

    if(navigationBarColour){
      navigationBarStr = navigationBarStr.concat(this.getBackgroundColour(navigationBarColour));
    } else {
      return null;
    }

    return navigationBarStr;
  },
  "header" : function(themeJSON){
    var headerStr = "";

    if(themeJSON.colours.backgrounds.headerBar){
      headerStr = headerStr.concat(this.getBackgroundColour(themeJSON.colours.backgrounds.headerBar));
    } else {
      return null;
    }

    return headerStr;
  },
  "body" : function(themeJSON){
    var bodyStr = "";

    if(themeJSON.colours.backgrounds.body){
      bodyStr = bodyStr.concat(this.getBackgroundColour(themeJSON.colours.backgrounds.body));
    } else {
      return null;
    }

    return bodyStr;
  },
  "form" : function(themeJSON){
    var formStr = "";


    //background
    if(themeJSON.colours.backgrounds.form){
      formStr = formStr.concat(this.getBackgroundColour(themeJSON.colours.backgrounds.form));
    } else {
      return null;
    }

    //Border
    if(themeJSON.borders.forms){
      if(this.getBorder(themeJSON.borders.forms) != null){
        formStr = formStr.concat(this.getBorder(themeJSON.borders.forms));
      } else {
        return null;
      }
    } else {
      return null;
    }

    return formStr;
  },
  "field_title": function(themeJSON){
    var fieldTitleStr = "";

    if(themeJSON.typography.fieldTitle){
      if(this.getFontDetails(themeJSON.typography.fieldTitle) != null){
        fieldTitleStr = fieldTitleStr.concat(this.getFontDetails(themeJSON.typography.fieldTitle));
      } else {
        return null;
      }
    } else {
      return null;
    }

    return fieldTitleStr;
  },
  "field_area": function(themeJSON){
    var fieldAreaStr = "";
    var fieldAreaBorder = themeJSON.borders.fieldArea;
    var fieldAreaBackgroundColor = themeJSON.colours.backgrounds.fieldArea;

    if(fieldAreaBackgroundColor){
      fieldAreaStr = fieldAreaStr.concat(this.getBackgroundColour(fieldAreaBackgroundColor));
    } else {
      return null;
    }

    if(fieldAreaBorder){
      fieldAreaStr = fieldAreaStr.concat(this.getBorder(fieldAreaBorder));
    } else {
      return null;
    }

    return fieldAreaStr;
  },
  "field_area_last_child" : function(themeJSON){
    //Needs to inherit the border styling from fh_appform_field_area
    var fieldAreaLastStr = "";
    var fieldAreaBorder = themeJSON.borders.fieldArea;

    if(fieldAreaBorder){
      fieldAreaLastStr = fieldAreaLastStr.concat(this.getBorder(fieldAreaBorder));
    } else {
      return null;
    }

    return fieldAreaLastStr;
  },
  "field_input": function(themeJSON){
    var fieldInputStr = "";

    //background
    if(themeJSON.colours.backgrounds.fieldInput){
      fieldInputStr = fieldInputStr.concat(this.getBackgroundColour(themeJSON.colours.backgrounds.fieldInput));
    } else {
      return null;
    }

    //font
    if(themeJSON.typography.fieldInput){
      if(this.getFontDetails(themeJSON.typography.fieldInput) != null){
        fieldInputStr = fieldInputStr.concat(this.getFontDetails(themeJSON.typography.fieldInput));
      } else {
        return null;
      }
    } else {
      return null;
    }

    //border
    if(themeJSON.borders.fieldInput){
      if(this.getBorder(themeJSON.borders.fieldInput) != null){
        fieldInputStr = fieldInputStr.concat(this.getBorder(themeJSON.borders.fieldInput));
      } else {
        return null;
      }
    } else {
      return null;
    }

    return fieldInputStr;
  },
  "field_instructions": function(themeJSON){ //TODO Functionalise this
    var fieldInstructionsStr = "";

    //background
    if(themeJSON.colours.backgrounds.fieldInstructions){
      fieldInstructionsStr = fieldInstructionsStr.concat(this.getBackgroundColour(themeJSON.colours.backgrounds.fieldInstructions));
    } else {
      return null;
    }

    //font
    if(themeJSON.typography.instructions){
      if(this.getFontDetails(themeJSON.typography.instructions) != null){
        fieldInstructionsStr = fieldInstructionsStr.concat(this.getFontDetails(themeJSON.typography.instructions));
      } else {
        return null;
      }
    } else {
      return null;
    }

    //border
    if(themeJSON.borders.instructions){
      if(this.getBorder(themeJSON.borders.instructions) != null){
        fieldInstructionsStr = fieldInstructionsStr.concat(this.getBorder(themeJSON.borders.instructions));
      } else {
        return null;
      }
    } else {
      return null;
    }

    return fieldInstructionsStr;
  },
  "title": function(themeJSON){
    var titleStr = "";

    if(themeJSON.typography.title){
      if(this.getFontDetails(themeJSON.typography.title) != null){
        titleStr = titleStr.concat(this.getFontDetails(themeJSON.typography.title));
      } else {
        return null;
      }
    } else {
      return null;
    }

    return titleStr;
  },
  "description": function(themeJSON){
    var descriptionStr = "";

    if(themeJSON.typography.description){
      if(this.getFontDetails(themeJSON.typography.description) != null){
        descriptionStr = descriptionStr.concat(this.getFontDetails(themeJSON.typography.description));
      } else {
        return null;
      }
    } else {
      return null;
    }

    return descriptionStr;
  },
  "error" : function(themeJSON){
    var errCss = "";

    var errorTypography = themeJSON.typography.error;
    var errorColor = themeJSON.colours.backgrounds.error;
    var errorBorder = themeJSON.borders.error;

    if(errorTypography){
      if(this.getFontDetails(errorTypography) != null){
        errCss = errCss.concat(this.getFontDetails(errorTypography));
      } else {
        return null;
      }
    } else {
      return null;
    }

    if(errorColor){
      errCss = errCss.concat(this.getBackgroundColour(errorColor));
    } else {
      return null;
    }

    if(errorBorder){
      errCss = errCss.concat(this.getBorder(errorBorder));
    } else {
      return null;
    }

    return errCss;
  },
  "field_section_break_title": function(themeJSON){
    var sectionBreakTitleCSS = "";
    var sectionBreakTitleTypography = themeJSON.typography.section_break_title;

    if(sectionBreakTitleTypography){
      sectionBreakTitleCSS = sectionBreakTitleCSS.concat(this.getFontDetails(sectionBreakTitleTypography));
    } else {
      return null;
    }

    return sectionBreakTitleCSS;
  },
  "field_section_break_description": function(themeJSON){
    var sectionBreakDescriptionCSS = "";
    var sectionBreakDescriptionTypography = themeJSON.typography.section_break_description;

    if(sectionBreakDescriptionTypography){
      sectionBreakDescriptionCSS = sectionBreakDescriptionCSS.concat(this.getFontDetails(sectionBreakDescriptionTypography));
    } else {
      return null;
    }

    return sectionBreakDescriptionCSS;
  },
  "page_title" : function(themeJSON){
    var pageTitleCSS = "";
    var pageTitleTypography = themeJSON.typography.page_title;

    if(pageTitleTypography){
      pageTitleCSS = pageTitleCSS.concat(this.getFontDetails(pageTitleTypography));
    } else {
      return null;
    }

    return pageTitleCSS;
  },
  "page_description" : function(themeJSON){
    var pageDescriptionCSS = "";
    var pageDescriptionTypography = themeJSON.typography.page_description;

    if(pageDescriptionTypography){
      pageDescriptionCSS = pageDescriptionCSS.concat(this.getFontDetails(pageDescriptionTypography));
    } else {
      return null;
    }

    return pageDescriptionCSS;
  },
  "progress_wrapper" : function(themeJSON){
    //No generated css for the progress_wrapper
    return "";
  },
  "progress_steps" : function(themeJSON){
    var progressStepsCSS = "";
    var progressStepsBackground = themeJSON.colours.backgrounds.progress_steps;
    var progressStepsBorder = themeJSON.borders.progress_steps;
    if(progressStepsBackground){
      progressStepsCSS = progressStepsCSS.concat(this.getBackgroundColour(progressStepsBackground));
    } else {
      return null;
    }

    if(progressStepsBorder){
      progressStepsCSS = progressStepsCSS.concat(this.getBorder(progressStepsBorder));
    } else {
      return null;
    }


    return progressStepsCSS;

  },
  "progress_steps_number_container" : function(themeJSON){
    var progressStepsContainerCSS = "";
    var progressStepsContainerBackground = themeJSON.colours.backgrounds.progress_steps_number_container;
    var progressStepsContainerBorder = themeJSON.borders.progress_steps_number_container;
    var progressStepsContainerTypography = themeJSON.typography.progress_steps_number_container;

    if(progressStepsContainerBackground){
      progressStepsContainerCSS = progressStepsContainerCSS.concat(this.getBackgroundColour(progressStepsContainerBackground));
    } else {
      return null;
    }

    if(progressStepsContainerBorder){
      progressStepsContainerCSS = progressStepsContainerCSS.concat(this.getBorder(progressStepsContainerBorder));
    } else {
      return null;
    }

    if(progressStepsContainerTypography){
      progressStepsContainerCSS = progressStepsContainerCSS.concat(this.getFontDetails(progressStepsContainerTypography));
    } else {
      return null;
    }

    return progressStepsContainerCSS;
  },
  "progress_steps_number_container_active" : function(themeJSON){
    var progressStepsContainerActiveCSS = "";
    var progressStepsContainerActiveBackground = themeJSON.colours.backgrounds.progress_steps_number_container_active;
    var progressStepsContainerActiveBorder = themeJSON.borders.progress_steps_number_container_active;
    var progressStepsContainerActiveTypography = themeJSON.typography.progress_steps_number_container_active;

    if(progressStepsContainerActiveBackground){
      progressStepsContainerActiveCSS = progressStepsContainerActiveCSS.concat(this.getBackgroundColour(progressStepsContainerActiveBackground));
    } else {
      return null;
    }

    if(progressStepsContainerActiveBorder){
      progressStepsContainerActiveCSS = progressStepsContainerActiveCSS.concat(this.getBorder(progressStepsContainerActiveBorder));
    } else {
      return null;
    }

    if(progressStepsContainerActiveTypography){
      progressStepsContainerActiveCSS = progressStepsContainerActiveCSS.concat(this.getFontDetails(progressStepsContainerActiveTypography));
    } else {
      return null;
    }

    return progressStepsContainerActiveCSS;
  },
  "field_required": function(themeJSON){
    //Required is a bit special --> it has a color associated with it only. Also has the 'content' bit. Stored in colours.backgrounds.
    var requiredCSS = "";
    var requiredColour = themeJSON.colours.backgrounds.field_required;

    //Background Color -->set to set the text color.
    if(requiredColour){
      requiredCSS += "color: " + requiredColour + ";";
    } else {
      return null;
    }

    return requiredCSS;
  },
  "action_bar" : function(themeJSON){
    //No theme generation needed for the fh_appform_action_bar.
    return "";
  },
  "section_area" : function(themeJSON){
    var sectionCSSString = "";

    var sectionBackgroundColour = themeJSON.colours.backgrounds.section_area;

    if(sectionBackgroundColour){
      sectionCSSString += this.getBackgroundColour(sectionBackgroundColour);
    } else {
      return null;
    }

    return sectionCSSString;
  },
  "hidden" : function(themeJSON){
    return "";
  },
  "getButtonFont" : function(themeJSON, active){
    var buttonFontCSS = "";
    var buttonName = active ? active : "buttons";
    var buttonTypography = themeJSON.typography[buttonName];

    if(buttonTypography){

      if(this.getFontDetails(buttonTypography) != null){
        buttonFontCSS = buttonFontCSS.concat(this.getFontDetails(buttonTypography));
      } else {
        return null;
      }
    } else {
      return null;
    }

    return buttonFontCSS;
  },
  "getBorder" : function(borderField){
    var borderStr = "";

    if(borderField.thickness){
      if(borderField.thickness == "none"){
        return borderStr.concat("border:" + borderField.thickness + ";" );
      } else {
        borderStr = borderStr.concat("border-width:" + borderField.thickness + ";" );
      }
    } else {
      return null;
    }

    if(borderField.style){
      borderStr = borderStr.concat("border-style:" + borderField.style + ";" );
    } else {
      return null;
    }

    if(borderField.colour){
      borderStr = borderStr.concat("border-color:" + borderField.colour + ";"  );
    } else {
      return null;
    }

    return borderStr;
  },
  "getFontDetails" : function(fontJSON){
    var fontCSS = "";

    if(fontJSON.fontSize){
      fontCSS = fontCSS.concat("font-size:" + fontJSON.fontSize + ";");
    } else {
      return null;
    }

    if(fontJSON.fontFamily){
      fontCSS = fontCSS.concat("font-family:" + fontJSON.fontFamily + ";");
    } else {
      return null;
    }

    if(fontJSON.fontColour){
      fontCSS = fontCSS.concat("color:" + fontJSON.fontColour + ";");
    } else {
      return null;
    }

    if(fontJSON.fontStyle){
      if(fontJSON.fontStyle === "italic"){
        fontCSS = fontCSS.concat("font-style:" + fontJSON.fontStyle + ";");
        fontCSS = fontCSS.concat("font-weight:normal;");
      } else if (fontJSON.fontStyle === "bold") {
        fontCSS = fontCSS.concat("font-weight:" + fontJSON.fontStyle + ";");
        fontCSS = fontCSS.concat("font-style:normal;");
      } else if (fontJSON.fontStyle === "normal"){
        fontCSS = fontCSS.concat("font-weight:normal;");
        fontCSS = fontCSS.concat("font-style:normal;");
      } else {
        return null;
      }
    } else {
      return null;
    }

    return fontCSS;
  },
  "getBackgroundColour" : function(colourField){
    return "background-color:" + colourField + ";"
  },
  "get_button_css": function(themeJSON, button_name, button_font){
    var buttonStr = "";
    var buttonColor = themeJSON.colours.buttons[button_name];

    if(buttonColor){
      buttonStr = buttonStr.concat(this.getBackgroundColour(buttonColor));
    } else {
      return null;
    }

    buttonStr = buttonStr.concat(this.getButtonFont(themeJSON, button_font));

    return buttonStr;
  }
};


App.forms.themeCSSGenerator = function(themeJSON){
  var generatedCSSJSON = {};

  //All of these have to build values that are customizable.
  generatedCSSJSON[FH_APPFORM_PREFIX] = {
    "button_navigation" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "border-radius": "5px"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "button_navigation_active": {
      "generatedCSS": "",
      "parentClass" : "button_navigation",
      "staticCSSAdditions": {
        "border-radius": "5px"
      },
      "classNameAdditions": [":active"],
      "classAdditions": {}
    },
    "button_action" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "border-radius": "5px"
      },
      "classNameAdditions": [],
      "classAdditions": {
        ".special_button" :{
          "width": "100\%",
          "margin-top": "10px",
          "line-height": "28px"
        },
        ".special_button.fh_appform_removeInputBtn" :{
          "width": "50\%",
          "margin-top": "10px",
          "line-height": "28px"
        },
        ".special_button.fh_appform_addInputBtn" :{
          "width": "50\%",
          "margin-top": "10px",
          "line-height": "28px"
        }
      }
    },
    "button_action_active" : {
      "generatedCSS": "",
      "parentClass" : "button_action",
      "staticCSSAdditions": {
        "border-radius": "5px"
      },
      "classNameAdditions": [":active"],
      "classAdditions": {}
    },
    "button_cancel" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "border-radius": "5px"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "button_cancel_active" : {
      "generatedCSS": "",
      "parentClass" : "button_cancel",
      "staticCSSAdditions": {
        "border-radius": "5px"
      },
      "classNameAdditions": [":active"],
      "classAdditions": {}
    },
    "navigation" : {
      "generatedCSS": "",
      "staticCSSAdditions": {},
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "header" : {
      "generatedCSS": "",
      "staticCSSAdditions": {},
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "body" : {
      "generatedCSS": "",
      "staticCSSAdditions": {},
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "form" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "padding": "5px"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "field_title": {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "display": "block"
      },
      "classNameAdditions": [],
      "classAdditions": {
        ".fh_appform_field_numbering":{
          "display" : "inline-block"
        }
      }
    },
    "field_area": {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "padding": "5px",
        "border-bottom": "none",
        "border-radius": "5px"
      },
      "classNameAdditions": [],
      "classAdditions": {
        ":last-child" : {
          "inheritedCSS" : themeCSSFunctions[FH_APPFORM_PREFIX].field_area_last_child(themeJSON)
        },
        ".fh_appform_field_section_break" : {
          "border" : "none",
          "background" : "transparent"
        }
      }
    },
    "field_input": {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "width": "100%",
        "border-radius": "5px",
        "line-height": "1.4em",
        "padding": "5px 0px 5px 5px"
      },
      "classNameAdditions": [],
      "classNameAdditionsChildren": [],
      "classAdditions": {}
    },
    "field_instructions": {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "margin-bottom": "10px",
        "border-radius": "5px"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "title": {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "text-align": "center"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "description": {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "text-align": "center"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "error": {
      "generatedCSS": "",
      "staticCSSAdditions": {
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "field_section_break_title": {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "text-align" : "center"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "field_section_break_description": {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "text-align" : "center"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "page_title": {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "text-align": "center"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "page_description" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "text-align": "center"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "progress_wrapper" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "padding-top": "20px",
        "padding-bottom": "10px"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "progress_steps" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "width" : "100\%"
      },
      "classNameAdditions": [],
      "classAdditions": {
        " td": {
          "text-align": "center"
        },
        " td.active .fh_appform_page_title": {
          "text-align": "center",
          "display": "inline"
        },
        " .fh_appform_page_title" : {
          "padding-left": "10px",
          "display": "none"
        },
        " .number" : {
          "padding-top": "4px"
        }
      }
    },
    "progress_steps_number_container" : {
      "generatedCSS": "",
      "parentClass" : "progress_steps",
      "staticCSSAdditions": {
        "display": "inline-block",
        "border-radius": "13px",
        "padding-left": "10px",
        "padding-right": "10px",
        "margin-top": "5px",
        "margin-bottom" : "5px"
      },
      "classNameAdditions": [" .number_container"],
      "classAdditions": {}
    },
    "progress_steps_number_container_active" : {
      "generatedCSS": "",
      "parentClass" : "progress_steps",
      "staticCSSAdditions": {},
      "classNameAdditions": [" td.active .number_container"],
      "classAdditions": {}
    },
    "field_required" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "content": "' *'",
        "display" : "inline"
      },
      "classNameAdditions": [":first-child:after"],
      "classAdditions": {}
    },
    "action_bar": {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "padding": "18px 20px 18px 20px"
      },
      "classNameAdditions": [],
      "classAdditions": {
        " button.fh_appform_two_button" : {
          "width": "50%"
        },
        " button.fh_appform_three_button" : {
          "width": "33.3%"
        }
      }
    },
    "section_area" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "padding": "5px",
        "border-radius": "5px",
        "margin-top": "5px"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "hidden" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "display": "none"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    },
    "logo" : {
      "generatedCSS": "",
      "staticCSSAdditions": {
        "background-position" : "center",
        "background-repeat" : "no-repeat",
        "width" : "100\%"
      },
      "classNameAdditions": [],
      "classAdditions": {}
    }
  };

  function processThemeJSON(){

    var fullThemeCSSString = "";

    for(var cssClass in generatedCSSJSON[FH_APPFORM_PREFIX]){
      var generatedCSS = themeCSSFunctions[FH_APPFORM_PREFIX][cssClass](themeJSON);

      if(generatedCSS === null){
        console.log(new Error("Class " + cssClass + " generation is invalid"));
        generatedCSS = "";
      }

      //Have generated all of the css dynamic content, need to add in the static content.
      generatedCSS += getStaticCSSString(generatedCSSJSON[FH_APPFORM_PREFIX][cssClass].staticCSSAdditions);

      var cssStr = "";
      var printCSSClass = generatedCSSJSON[FH_APPFORM_PREFIX][cssClass].parentClass ? generatedCSSJSON[FH_APPFORM_PREFIX][cssClass].parentClass : cssClass;
      var cssClassName = "." + FH_APPFORM_PREFIX + printCSSClass;
      var classNameAdditions = "";

      //Building the css class name
      for(var classAdditionIndex = 0; classAdditionIndex < generatedCSSJSON[FH_APPFORM_PREFIX][cssClass].classNameAdditions.length; classAdditionIndex++){
        classNameAdditions += generatedCSSJSON[FH_APPFORM_PREFIX][cssClass].classNameAdditions[classAdditionIndex];
      }

      if(generatedCSSJSON[FH_APPFORM_PREFIX][cssClass].classNameAdditionsChildren){
        for(var classAdditionIndex = 0; classAdditionIndex < generatedCSSJSON[FH_APPFORM_PREFIX][cssClass].classNameAdditionsChildren.length; classAdditionIndex++){
          classNameAdditions += cssClassName + generatedCSSJSON[FH_APPFORM_PREFIX][cssClass].classNameAdditionsChildren[classAdditionIndex];
        }
      }

      cssStr = cssClassName + classNameAdditions + "{" + generatedCSS + "}";

      fullThemeCSSString += cssStr;

      fullThemeCSSString += generateSubClassCSS(cssClassName, generatedCSSJSON[FH_APPFORM_PREFIX][cssClass].classAdditions);


      generatedCSSJSON[FH_APPFORM_PREFIX][cssClass].generatedCSS = generatedCSS;
    }

    fullThemeCSSString = addAdditionalLibraries(fullThemeCSSString);

    return fullThemeCSSString;
  }

  function addAdditionalLibraries(fullThemeCSSString){
    for(var libraryName in librariesNeeded){
      fullThemeCSSString += librariesNeeded[libraryName];
    }

    return fullThemeCSSString;
  }

  function generateSubClassCSS(superCSSClassName, classAdditions){
    var subCSSStr = "";
    for(var subClass in classAdditions){
      var subClassCSS = "";
      var subClassName = superCSSClassName + subClass;
      var subClassDetails = classAdditions[subClass];

      for(var subClassKey in subClassDetails){
        if(subClassKey != "inheritedCSS"){
          subClassCSS += subClassKey + ":" + subClassDetails[subClassKey] + ";";
        } else {
          subClassCSS += subClassDetails[subClassKey];
        }
      }

      subCSSStr += subClassName + "{" + subClassCSS + "}";
    }
    return subCSSStr;
  }

  function getStaticCSSString(staticJSON){
    var staticCSSString = "";
    for(var styleKey in staticJSON){
      staticCSSString += styleKey + ":" + staticJSON[styleKey] + ";";
    }
    return staticCSSString;
  }

  return processThemeJSON;
};

