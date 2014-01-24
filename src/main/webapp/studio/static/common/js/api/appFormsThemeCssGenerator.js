
var FH_APPFORM_PREFIX = "fh_appform_";
var themeCSSFunctions = {};
var App = App || {};
App.forms = App.forms || {};


themeCSSFunctions[FH_APPFORM_PREFIX] = {
  "logo" : function(themeJSON){
    var logoStr = "background-image:url(\"data:image/png;base64,";
    if(themeJSON.logo){
      logoStr = logoStr.concat(themeJSON.logo.toString());
    } else {
      return "";
    }

    logoStr = logoStr.concat("\");");
    return logoStr;
  },
  "button_navigation" : function(themeJSON){
    var navButtonStr = "";

    if(themeJSON.colours.buttons.navigation){
      navButtonStr = navButtonStr.concat(this.getBackgroundColour(themeJSON.colours.buttons.navigation));
    } else {
      return null;
    }

    navButtonStr = navButtonStr.concat(this.getButtonFont(themeJSON));

    return navButtonStr;
  },
  "button_action" : function(themeJSON){
    var actionButtonStr = "";

    if(themeJSON.colours.buttons.action){
      actionButtonStr = actionButtonStr.concat(this.getBackgroundColour(themeJSON.colours.buttons.action));
    } else {
      return null;
    }

    actionButtonStr = actionButtonStr.concat(this.getButtonFont(themeJSON));
    return actionButtonStr;
  },
  "button_cancel" : function(themeJSON){
    var cancelButtonStr = "";

    if(themeJSON.colours.buttons.cancel){
      cancelButtonStr = cancelButtonStr.concat(this.getBackgroundColour(themeJSON.colours.buttons.cancel));
    } else {
      return null;
    }

    cancelButtonStr = cancelButtonStr.concat(this.getButtonFont(themeJSON));

    return cancelButtonStr;
  },
  "navigation" : function(themeJSON){
    var navigationBarStr = "";

    if(themeJSON.colours.backgrounds.navigationBar){
      navigationBarStr = navigationBarStr.concat(this.getBackgroundColour(themeJSON.colours.backgrounds.navigationBar));
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

    if(themeJSON.colours.backgrounds.fieldArea){
      fieldAreaStr = fieldAreaStr.concat(this.getBackgroundColour(themeJSON.colours.backgrounds.fieldArea));
    } else {
      return null;
    }

    if(themeJSON.borders.fieldArea){
      fieldAreaStr = fieldAreaStr.concat(this.getBorder(themeJSON.borders.fieldArea));
    } else {
      return null;
    }

    return fieldAreaStr;
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
  "field_instructions": function(themeJSON){
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
  "getButtonFont" : function(themeJSON){
    var buttonFontCSS = "";

    if(themeJSON.typography.buttons){

      if(this.getFontDetails(themeJSON.typography.buttons) != null){
        buttonFontCSS = buttonFontCSS.concat(this.getFontDetails(themeJSON.typography.buttons));
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
      borderStr = borderStr.concat("border-width:" + borderField.thickness + ";" );
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
  }
};

App.forms.themeCSSGenerator = function(themeJSON){
  var generatedCSSJSON = {};

  generatedCSSJSON[FH_APPFORM_PREFIX] = {
    "logo" : "",
    "button_navigation" : "",
    "button_action" : "",
    "button_cancel" : "",
    "navigation" : "",
    "header" : "",
    "body" : "",
    "form" : "",
    "field_title": "",
    "field_area": "",
    "field_input": "",
    "field_instructions": "",
    "title": "",
    "description": ""
  };

  function processThemeJSON(){

    for(var cssClass in generatedCSSJSON[FH_APPFORM_PREFIX]){
      var generatedCSS = themeCSSFunctions[FH_APPFORM_PREFIX][cssClass](themeJSON);

      if(generatedCSS === null){
        console.log(new Error("Class " + cssClass + " generation is invalid"));
        generatedCSS = "";
      }

      generatedCSSJSON[FH_APPFORM_PREFIX][cssClass] = generatedCSS;
    }

    //Finished generating css --> now combine all of the strings

    var cssStr = "";
    for(var cssClass in generatedCSSJSON[FH_APPFORM_PREFIX]){
      cssStr += "." + FH_APPFORM_PREFIX + cssClass + "{" + generatedCSSJSON[FH_APPFORM_PREFIX][cssClass] + "}";
    }

    return cssStr;

  }

  return processThemeJSON;
};

