var App = App || {};
App.forms = App.forms || {};

var themeCSSGenerator = function (themeJSON, styleStructure) {
  var FH_APPFORM_PREFIX = "fh_appform_";
  var FH_APPFORM_CONTAINER_CLASS_PREFIX = "." + FH_APPFORM_PREFIX + "container ";
  var fh_styleStructure = {
    "logo": {
      "staticCSS": [
        {"key": "background-position", "value": "center"},
        {"key": "background-repeat", "value": "no-repeat"},
        {"key": "width", "value": "100%"}
      ]
    },
    "sections": [
      {
        "id": "body",
        "label": "Body",
        "sub_sections": [
          {
            "id": "area",
            "label": "Area",
            "style": {
              "typography": false,
              "background": true,
              "border": false
            },
            "staticCSS": []
          }
        ]
      },
      {
        "id": "form",
        "label": "Form",
        "sub_sections": [
          {
            "id": "area",
            "label": "Background",
            "style": {
              "typography": false,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "padding",
                "value": "5px"
              }
            ]
          },
          {
            "id": "title",
            "label": "Title",
            "style": {
              "typography": true,
              "background": false,
              "border": false
            },
            "staticCSS": [
              {
                "key": "text-align",
                "value": "center"
              }
            ]
          },
          {
            "id": "description",
            "label": "Description",
            "style": {
              "typography": true,
              "background": false,
              "border": false
            },
            "staticCSS": [
              {
                "key": "text-align",
                "value": "center"
              }
            ]
          }
        ]
      },
      {
        "id": "page",
        "label": "Page",
        "sub_sections": [
          {
            "id": "title",
            "label": "Title",
            "style": {
              "typography": true,
              "background": false,
              "border": false
            },
            "staticCSS": []
          },
          {
            "id": "description",
            "label": "Description",
            "style": {
              "typography": true,
              "background": false,
              "border": false
            },
            "staticCSS": []
          },
          {
            "id": "progress_steps",
            "label": "Progress Steps",
            "class_name": "progress_steps",
            "style": {
              "typography": false,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "width",
                "value": "100%"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": " td",
                "cssAdditions": [
                  {
                    "key": "text-align",
                    "value": "center"
                  }
                ]
              },
              {
                "classNameAddition": " td .active .page_title",
                "cssAdditions": [
                  {
                    "key": "text-align",
                    "value": "center"
                  }
                ]
              },
              {
                "classNameAddition": " .page_title",
                "cssAdditions": [
                  {
                    "key": "padding-left",
                    "value": "10px"
                  },
                  {
                    "key": "display",
                    "value": "none"
                  }
                ]
              },
              {
                "classNameAddition": " .number",
                "cssAdditions": [
                  {
                    "key": "padding-top",
                    "value": "4px"
                  }
                ]
              }
            ]
          },
          {
            "id": "progress_steps_number_container",
            "label": "Progress Steps Number Container",
            "class_name": "progress_steps .number_container",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "display",
                "value": "inline-block"
              },
              {
                "key": "border-radius",
                "value": "13px"
              },
              {
                "key": "padding-left",
                "value": "10px"
              },
              {
                "key": "padding-right",
                "value": "10px"
              },
              {
                "key": "margin-top",
                "value": "5px"
              },
              {
                "key": "margin-bottom",
                "value": "5px"
              }
            ]
          },
          {
            "id": "progress_steps_number_container_active",
            "class_name": "progress_steps td.active .number_container",
            "label": "Progress Steps Number Container (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": []
          }
        ]
      },
      {
        "id": "section",
        "label": "Section",
        "sub_sections": [
          {
            "id": "area",
            "label": "Area",
            "style": {
              "typography": false,
              "background": true,
              "border": false
            },
            "staticCSS": [
              {
                "key": "margin-bottom",
                "value": "5px"
              },
              {
                "key": "border-radius",
                "value": "5px"
              },
              {
                "key": "margin-top",
                "value": "5px"
              }
            ]
          },
          {
            "id": "title",
            "label": "Title",
            "style": {
              "typography": true,
              "background": false,
              "border": false
            },
            "staticCSS": [
              {
                "key": "text-align",
                "value": "center"
              }
            ]
          },
          {
            "id": "description",
            "label": "Description",
            "style": {
              "typography": true,
              "background": false,
              "border": false
            },
            "staticCSS": [
              {
                "key": "text-align",
                "value": "center"
              }
            ]
          }
        ]
      },
      {
        "id": "field",
        "label": "Field",
        "sub_sections": [
          {
            "id": "area",
            "label": "Area",
            "style": {
              "typography": false,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "padding",
                "value": "5px"
              },
              {
                "key": "border-bottom",
                "value": "none"
              },
              {
                "key": "border-radius",
                "value": "5px"
              }
            ]
          },
          {
            "id": "instructions",
            "label": "Instructions",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "margin-bottom",
                "value": "10px"
              },
              {
                "key": "border-radius",
                "value": "5px"
              }
            ]
          },
          {
            "id": "title",
            "label": "Title",
            "style": {
              "typography": true,
              "background": true,
              "border": false
            },
            "staticCSS": [
              {
                "key": "display",
                "value": "block"
              }
            ]
          },
          {
            "id": "input",
            "label": "Input Area",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "width",
                "value": "100%"
              },
              {
                "key": "border-radius",
                "value": "5px"
              },
              {
                "key": "line-height",
                "value": "1.4em"
              },
              {
                "key": "padding",
                "value": "5px 0px 5px 5px"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": " .radio",
                "cssAdditions": [
                  {
                    "key": "margin-right",
                    "value": "10px"
                  }
                ]
              },
              {
                "classNameAddition": " .checkbox",
                "cssAdditions": [
                  {
                    "key": "margin-right",
                    "value": "10px"
                  },
                  {
                    "key": "display",
                    "value": "inline"
                  }
                ]
              },
              {
                "classNameAddition": " .choice",
                "cssAdditions": [
                  {
                    "key": "margin-right",
                    "value": "10px"
                  },
                  {
                    "key": "display",
                    "value": "inline"
                  }
                ]
              }
            ]
          },
          {
            "id": "error",
            "label": "Error Highlighting",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": []
          },
          {
            "id": "required",
            "label": "Required Symbol (*)",
            "style": {
              "typography": true,
              "background": false,
              "border": false
            },
            "staticCSS": []
          }
        ]
      },
      {
        "id": "button",
        "label": "Buttons",
        "sub_sections": [
          {
            "id": "bar",
            "label": "Button Bar",
            "style": {
              "typography": false,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "padding",
                "value": "18px 20px 18px 20px"
              }
            ]
          },
          {
            "id": "default",
            "label": "Default",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              },
              {
                "key": "padding",
                "value": "5px 5px 5px 5px"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": ".fh_appform_two_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  }
                ]
              },
              {
                "classNameAddition": ".fh_appform_three_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "33.3%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "100%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_removeInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  },
                  {
                    "key": "margin-top",
                    "value": "10px"
                  },
                  {
                    "key": "line-height",
                    "value": "28px"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_addInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  },
                  {
                    "key": "margin-top",
                    "value": "10px"
                  },
                  {
                    "key": "line-height",
                    "value": "28px"
                  }
                ]
              }
            ]
          },
          {
            "id": "default_active",
            "label": "Default (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              },
              {
                "key": "padding",
                "value": "5px 5px 5px 5px"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": ".fh_appform_two_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  }
                ]
              },
              {
                "classNameAddition": ".fh_appform_three_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "33.3%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "100%"
                  }
                ]
              }
            ]
          },
          {
            "id": "action",
            "label": "Action",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              },
              {
                "key": "padding",
                "value": "5px 5px 5px 5px"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": ".fh_appform_two_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  }
                ]
              },
              {
                "classNameAddition": ".fh_appform_three_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "33.3%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "100%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_removeInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  },
                  {
                    "key": "margin-top",
                    "value": "10px"
                  },
                  {
                    "key": "line-height",
                    "value": "28px"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_addInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  },
                  {
                    "key": "margin-top",
                    "value": "10px"
                  },
                  {
                    "key": "line-height",
                    "value": "28px"
                  }
                ]
              }
            ]
          },
          {
            "id": "action_active",
            "label": "Action (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              },
              {
                "key": "padding",
                "value": "5px 5px 5px 5px"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": ".fh_appform_two_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  }
                ]
              },
              {
                "classNameAddition": ".fh_appform_three_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "33.3%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "100%"
                  }
                ]
              }
            ]
          },
          {
            "id": "cancel",
            "label": "Cancel",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              },
              {
                "key": "padding",
                "value": "5px 5px 5px 5px"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": ".fh_appform_two_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  }
                ]
              },
              {
                "classNameAddition": ".fh_appform_three_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "33.3%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "100%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_removeInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  },
                  {
                    "key": "margin-top",
                    "value": "10px"
                  },
                  {
                    "key": "line-height",
                    "value": "28px"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_addInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  },
                  {
                    "key": "margin-top",
                    "value": "10px"
                  },
                  {
                    "key": "line-height",
                    "value": "28px"
                  }
                ]
              }
            ]
          },
          {
            "id": "cancel_active",
            "label": "Cancel (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              },
              {
                "key": "padding",
                "value": "5px 5px 5px 5px"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": ".fh_appform_two_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  }
                ]
              },
              {
                "classNameAddition": ".fh_appform_three_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "33.3%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "100%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_removeInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  },
                  {
                    "key": "margin-top",
                    "value": "10px"
                  },
                  {
                    "key": "line-height",
                    "value": "28px"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_addInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "50%"
                  },
                  {
                    "key": "margin-top",
                    "value": "10px"
                  },
                  {
                    "key": "line-height",
                    "value": "28px"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]};

  styleStructure = styleStructure ? styleStructure : fh_styleStructure;

  var generatedCSS = "";
  var generationFailed = {"failed": false, "failedSections": []};

  function findSection(sectionId, subSectionId) {
    var themeSections = themeJSON.sections;
    var foundThemeSections = themeSections.filter(function (themeSection) {
      return themeSection.id == sectionId;
    });

    if (foundThemeSections.length > 0) {
      var foundThemeSubSections = foundThemeSections[0].sub_sections.filter(function (themeSubSection) {
        return themeSubSection.id == subSectionId;
      });

      if (foundThemeSubSections.length > 0) {
        return foundThemeSubSections[0];
      } else {
        console.log("No sub section found for sub section id: ", subSectionId);
        return null;
      }
    } else {
      console.log("No section found for section id: ", sectionId)
      return null;
    }
  }

  function generateCSS(sectionId, subSectionId, styleDefinition) {
    function generateStyleType(styleType) {
      var styleFunctions = {
        "background": function (backgroundJSON) {
          if (backgroundJSON.background_color) {
            return "background-color:" + backgroundJSON.background_color + ";";
          } else {
            return null;
          }
        },
        "typography": function (fontJSON) {
          var fontCSS = "";

          if (fontJSON.fontSize) {
            fontCSS = fontCSS.concat("font-size:" + fontJSON.fontSize + ";");
          } else {
            return null;
          }

          if (fontJSON.fontFamily) {
            fontCSS = fontCSS.concat("font-family:" + fontJSON.fontFamily + ";");
          } else {
            return null;
          }

          if (fontJSON.fontColour) {
            fontCSS = fontCSS.concat("color:" + fontJSON.fontColour + ";");
          } else {
            return null;
          }

          if (fontJSON.fontStyle) {
            if (fontJSON.fontStyle === "italic") {
              fontCSS = fontCSS.concat("font-style:" + fontJSON.fontStyle + ";");
              fontCSS = fontCSS.concat("font-weight:normal;");
            } else if (fontJSON.fontStyle === "bold") {
              fontCSS = fontCSS.concat("font-weight:" + fontJSON.fontStyle + ";");
              fontCSS = fontCSS.concat("font-style:normal;");
            } else if (fontJSON.fontStyle === "normal") {
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
        "border": function (borerJSON) {
          var borderStr = "";

          if (borerJSON.thickness) {
            if (borerJSON.thickness == "none") {
              return borderStr.concat("border:" + borerJSON.thickness + ";");
            } else {
              borderStr = borderStr.concat("border-width:" + borerJSON.thickness + ";");
            }
          } else {
            return null;
          }

          if (borerJSON.style) {
            borderStr = borderStr.concat("border-style:" + borerJSON.style + ";");
          } else {
            return null;
          }

          if (borerJSON.colour) {
            borderStr = borderStr.concat("border-color:" + borerJSON.colour + ";");
          } else {
            return null;
          }

          return borderStr;
        }
      };

      if (styleDefinition[styleType] == true) {
        var subSectionStyleDefinition = findSection(sectionId, subSectionId);
        if (subSectionStyleDefinition == null) {
          console.log("Expected style definition for section id: ", sectionId, " and subsection id: ", subSectionId);
          return null;
        }

        if (!subSectionStyleDefinition[styleType]) {
          console.log("No style definition for expected: ", styleType, subSectionStyleDefinition);
          return null;
        }

        if (styleFunctions[styleType]) {
          return styleFunctions[styleType](subSectionStyleDefinition[styleType]);
        } else {
          console.log("Expected style function for type: ", styleType);
          return null;
        }
      } else if (styleDefinition[styleType] == false) {
        return "";//No style, return empty string
      } else {
        return null
      }
    }

    var typographyCSS = generateStyleType("typography");
    var backgroundCSS = generateStyleType("background");
    var borderCSS = generateStyleType("border");

    if (typographyCSS == null) {
      console.log("Typography css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    } else if (backgroundCSS == null) {
      console.log("Background css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    } else if (borderCSS == null) {
      console.log("Border css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    }

    return typographyCSS + backgroundCSS + borderCSS;
  }

  function generateCSSClassName(sectionId, subSectionId, className) {
    if (className) {
      return FH_APPFORM_CONTAINER_CLASS_PREFIX + "." + FH_APPFORM_PREFIX + className;
    } else {
      return FH_APPFORM_CONTAINER_CLASS_PREFIX + "." + FH_APPFORM_PREFIX + sectionId + "_" + subSectionId;
    }
  }

  function generateStaticCSS(staticCSSArray) {
    var staticCSSStr = "";
    staticCSSArray = staticCSSArray ? staticCSSArray : [];
    console.log("staticCSSArray:  ", staticCSSArray);

    for (var cssObjIndex = 0; cssObjIndex < staticCSSArray.length; cssObjIndex++) {
      var cssObject = staticCSSArray[cssObjIndex];
      console.log("cssObject: ", cssObject);
      if(!cssObject.key){
        return null;
      }

      if(!cssObject.value){
        return null;
      }
      staticCSSStr += cssObject.key + ":" + cssObject.value + ";";
    }

    return staticCSSStr;
  }

  function generateClassAdditions(className, classAdditions) {
    var classAdditionCSS = "";

    classAdditions = classAdditions ? classAdditions : [];

    if (classAdditions) {
      for (var classAddIndex =0; classAddIndex < classAdditions.length;classAddIndex ++) {
        var classAdditionObject = classAdditions[classAddIndex];
        var fullClassName = className + classAdditionObject.classNameAddition;
        var staticCSS = generateStaticCSS(classAdditionObject.cssAdditions);

        classAdditionCSS += fullClassName + "{" + staticCSS + "}";
      }
    }

    return classAdditionCSS;
  }

  function generateLogoCSS() {
    if (styleStructure.logo) { //Only intend to generate a logo if it exists in the theme structure.
      if (themeJSON.logo) {
        var logoStr = "";
        var logoStaticCSS = "";
        var logoClassName = "";
        var base64Image = themeJSON.logo.base64String;
        var imageHeight = themeJSON.logo.height;
        var imageWidth = themeJSON.logo.width;


        if (base64Image && imageHeight && imageWidth) {
          logoStr += "background-image:url(\"" + base64Image + "\");";
          logoStr += "height:" + imageHeight + "px;";
          logoStr += "width:" + imageWidth + "px;";

          logoStaticCSS = generateStaticCSS(themeJSON.logo.staticCSS);

          logoStr = logoStr + logoStaticCSS;

          logoClassName = generateCSSClassName("logo", "logo", "logo");

          var fullLogoCSS = logoClassName + "{" + logoStr + "}";

          return fullLogoCSS;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return "";
    }
  }

  function generateThemeCSS() {

    if (!styleStructure.sections || !Array.isArray(styleStructure.sections)) {
      return null;
    }

    var logoCSS = generateLogoCSS();

    if (logoCSS == null) {
      generatedCSS = null;
      generationFailed.failed = true;
      generationFailed.failedSections.push({"section": "logo", "subSection": "logo" });
      return;
    }

    styleStructure.sections.forEach(function (themeSection) {
      var sectionId = themeSection.id;

      var subSections = themeSection.sub_sections ? themeSection.sub_sections : [];
      subSections.forEach(function (subSection) {
        var subSectionId = subSection.id;
        var subSectionStyle = subSection.style;

        var cssGenerated = generateCSS(sectionId, subSectionId, subSectionStyle);
        if (cssGenerated == null) {
          console.log("Error generating css for section: ", sectionId, " and subsection: ", subSectionId);
          generatedCSS = null;
          generationFailed.failed = true;
          generationFailed.failedSections.push({"section": sectionId, "subSection": subSectionId });
          return;
        }

        var staticCSS = generateStaticCSS(subSection.staticCSS);
        if (staticCSS == null) {
          console.log("Error getting statics css for section: ", sectionId, " and subsection: ", subSectionId);
          generatedCSS = null;
          generationFailed.failed = true;
          generationFailed.failedSections.push({"section": sectionId, "subSection": subSectionId });
          return;
        }

        var cssClassName = generateCSSClassName(sectionId, subSectionId, subSection.class_name);
        if (cssClassName == null) {
          console.log("Error getting css class name for section: ", sectionId, " and subsection: ", subSectionId);
          generatedCSS = null;
          generationFailed.failed = true;
          generationFailed.failedSections.push({"section": sectionId, "subSection": subSectionId });
          return;
        }

        var fullClassDefinition = cssClassName + "{" + cssGenerated + staticCSS + "}";

        var additionalClassCSS = generateClassAdditions(cssClassName, subSection.classAdditions);

        fullClassDefinition += additionalClassCSS;

        generatedCSS += fullClassDefinition;
      });
    });
    generatedCSS += logoCSS;
    return {
      "generatedCSS": generatedCSS,
      "generationResult": generationFailed
    };
  }

  var generationFunctions = {
    "findSection": findSection,
    "generateCSS": generateCSS,
    "generateCSSClassName": generateCSSClassName,
    "generateStaticCSS": generateStaticCSS,
    "generateClassAdditions": generateClassAdditions,
    "generateLogoCSS": generateLogoCSS
  };

  return {
    "generationFunctions": generationFunctions,
    "generateThemeCSS": generateThemeCSS,
    "styleStructure": styleStructure
  };
};

App.forms.themeCSSGenerator = themeCSSGenerator;
