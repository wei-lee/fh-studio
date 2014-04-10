var App = App || {};
App.forms = App.forms || {};

/*! fh-forms - v0.5.3 -  */
/*! 2014-04-10 */

var themeCSSGenerator = function (themeJSON, styleStructure) {
  var FH_APPFORM_PREFIX = "fh_appform_";
  var FH_APPFORM_CONTAINER_CLASS_PREFIX = "." + FH_APPFORM_PREFIX + "container ";
  var fh_styleStructure = {
    "logo": {
      "staticCSS": [
        {"key": "background-position", "value": "center"},
        {"key": "background-repeat", "value": "no-repeat"},
        {"key": "width", "value": "100%"},
        {"key": "display", "value": "inline-block"}
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
              "border": false,
              "margin": false,
              "padding": false
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
              "border": true,
              "margin": false,
              "padding": false
            },
            "staticCSS": [
            ]
          },
          {
            "id": "title",
            "label": "Title",
            "style": {
              "typography": true,
              "background": false,
              "border": false,
              "margin": true,
              "padding": true
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
              "border": false,
              "margin": true,
              "padding": true
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
              "border": false,
              "margin": true,
              "padding": true
            },
            "staticCSS": [{
              "key": "text-align",
              "value": "center"
            },
              {
                "key": "width",
                "value": "100%"
              },
              {
                "key": "display",
                "value": "inline-block"
              }]
          },
          {
            "id": "description",
            "label": "Description",
            "style": {
              "typography": true,
              "background": false,
              "border": false,
              "margin": true,
              "padding": true
            },
            "staticCSS": []
          },
          {
            "id": "progress_steps",
            "label": "Page Area",
            "class_name": "progress_steps",
            "style": {
              "typography": false,
              "background": true,
              "border": true,
              "margin": true,
              "padding": true
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
                    "key": "display",
                    "value": "none"
                  }
                ]
              },
              {
                "classNameAddition": " .number",
                "cssAdditions": [
                  {
                    "key": "padding",
                    "value": "5px 10px 5px 10px"
                  }
                ]
              }
            ]
          },
          {
            "id": "progress_steps_number_container",
            "label": "Page Number Container",
            "class_name": "progress_steps .number_container",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": false,
              "padding": false
            },
            "staticCSS": [
              {
                "key": "display",
                "value": "inline-block"
              },
              {
                "key": "border-radius",
                "value": "13px"
              }
            ]
          },
          {
            "id": "progress_steps_number_container_active",
            "class_name": "progress_steps td.active .number_container",
            "label": "Page Number Container (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": false,
              "padding": false
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
              "border": false,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
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
              "background": false,
              "border": false,
              "margin": true,
              "padding": true
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
              "border": false,
              "margin": true,
              "padding": true
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
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
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
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
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
              "border": false,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "display",
                "value": "block"
              },
              {
                "key": "border-radius",
                "value": "5px"
              }
            ]
          },
          {
            "id": "input",
            "label": "Input Area",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              },
              {
                "key": "line-height",
                "value": "1.4em"
              },
              {
                "key": "display",
                "value": "inline-block"
              },
              {
                "key": "width",
                "value": "100%"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": " .radio",
                "cssAdditions": [
                ]
              },
              {
                "classNameAddition": " .checkbox",
                "cssAdditions": [
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
                    "key": "display",
                    "value": "inline"
                  },
                  {
                    "key": "margin-left",
                    "value": "5px"
                  }
                ]
              },
              {
                "classNameAddition": ".repeating",
                "cssAdditions": [

                ]
              },
              {
                "classNameAddition": ".non_repeating",
                "cssAdditions": [

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
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              }
            ]
          },
          {
            "id": "numbering",
            "label": "Numbering",
            "style": {
              "typography": true,
              "background": true,
              "border": false,
              "margin": false,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "display",
                "value": "inline"
              },
              {
                "key": "float",
                "value": "left"
              },
              {
                "key": "width",
                "value": "15%"
              },
              {
                "key": "text-align",
                "value": "center"
              }
            ]
          },
          {
            "id": "required",
            "label": "Required Symbol (*)",
            "style": {
              "typography": true,
              "background": false,
              "border": false,
              "margin": false,
              "padding": false
            },
            "staticCSS": [{
              "key": "content",
              "value": "\"*\""
            },
              {
                "key": "vertical-align",
                "value": "top"
              }],
            "class_name": "field_required:after"
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
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "text-align",
                "value": "center"
              }
            ]
          },
          {
            "id": "default",
            "label": "Default",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": ".fh_appform_two_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "45%!important"
                  }
                ]
              },
              {
                "classNameAddition": ".fh_appform_three_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "30%!important"
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
                    "value": "45%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_addInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "45%"
                  }
                ]
              }
            ]
          },
          {
            "id": "default_active",
            "class_name": "button_default:active",
            "label": "Default (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              }
            ],
            "classAdditions": [

            ]
          },
          {
            "id": "action",
            "label": "Action",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": ".fh_appform_two_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "45%!important"
                  }
                ]
              },
              {
                "classNameAddition": ".fh_appform_three_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "30%!important"
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
                    "value": "45%!important"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_addInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "45%!important"
                  }
                ]
              }
            ]
          },
          {
            "id": "action_active",
            "class_name": "button_action:active",
            "label": "Action (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              }
            ],
            "classAdditions": [

            ]
          },
          {
            "id": "cancel",
            "label": "Cancel",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              }
            ],
            "classAdditions": [
              {
                "classNameAddition": ".fh_appform_two_button",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "45%"
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
                    "value": "45%"
                  }
                ]
              },
              {
                "classNameAddition": ".special_button.fh_appform_addInputBtn",
                "cssAdditions": [
                  {
                    "key": "width",
                    "value": "45%"
                  }
                ]
              }
            ]
          },
          {
            "id": "cancel_active",
            "class_name": "button_cancel:active",
            "label": "Cancel (Active)",
            "style": {
              "typography": true,
              "background": true,
              "border": true,
              "margin": true,
              "padding": true
            },
            "staticCSS": [
              {
                "key": "border-radius",
                "value": "5px"
              }
            ],
            "classAdditions": [

            ]
          }
        ]
      }
    ]};


  styleStructure = styleStructure ? styleStructure : fh_styleStructure;

  var baseTheme = {
    "name":"Base Theme",
    "structure":fh_styleStructure,
    "sections":[
      {
        "id":"body",
        "label":"Body",
        "sub_sections":[
          {
            "id":"area",
            "label":"Area",
            "background":{
              "background_color":"rgba(255,255,255,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          }
        ]
      },
      {
        "id":"form",
        "label":"Form",
        "sub_sections":[
          {
            "id":"area",
            "label":"Background",
            "background":{
              "background_color":"rgba(254,253,252,1)"
            },
            "border":{
              "thickness":"none",
              "style":"solid",
              "colour":"rgba(255,255,255,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"title",
            "label":"Title",
            "typography":{
              "fontSize":"20pt",
              "fontFamily":"arial",
              "fontStyle":"bold",
              "fontColour":"rgba(3,2,2,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"description",
            "label":"Description",
            "typography":{
              "fontSize":"14pt",
              "fontFamily":"arial",
              "fontStyle":"italic",
              "fontColour":"rgba(0,0,0,1)"
            } ,
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          }
        ]
      },
      {
        "id":"page",
        "label":"Page",
        "sub_sections":[
          {
            "id":"title",
            "label":"Title",
            "typography":{
              "fontSize":"14pt",
              "fontFamily":"arial",
              "fontStyle":"bold",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"description",
            "label":"Description",
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"normal",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"progress_steps",
            "label":"Page Area",
            "background":{
              "background_color":"rgba(255,255,255,1)"
            },
            "border":{
              "thickness":"none",
              "style":"solid",
              "colour":"rgba(2,2,2,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"progress_steps_number_container",
            "label":"Page Number Container",
            "background":{
              "background_color":"rgba(255,255,255,1)"
            },
            "border":{
              "thickness":"thin",
              "style":"solid",
              "colour":"rgba(0,0,0,1)"
            },
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"normal",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"progress_steps_number_container_active",
            "label":"Page Number Container (Active)",
            "background":{
              "background_color":"rgba(0,0,0,1)"
            },
            "border":{
              "thickness":"thin",
              "style":"solid",
              "colour":"rgba(1,1,1,1)"
            },
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"normal",
              "fontColour":"rgba(255,254,254,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          }
        ]
      },
      {
        "id":"section",
        "label":"Section",
        "sub_sections":[
          {
            "id":"area",
            "label":"Area",
            "background":{
              "background_color":"rgba(255,255,255,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"title",
            "label":"Title",
            "typography":{
              "fontSize":"14pt",
              "fontFamily":"arial",
              "fontStyle":"bold",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"description",
            "label":"Description",
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"italic",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          }
        ]
      },
      {
        "id":"field",
        "label":"Field",
        "sub_sections":[
          {
            "id":"area",
            "label":"Area",
            "background":{
              "background_color":"rgba(255,255,255,1)"
            },
            "border":{
              "thickness":"thin",
              "style":"solid",
              "colour":"rgba(2,2,2,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"instructions",
            "label":"Instructions",
            "background":{
              "background_color":"rgba(255,255,255,1)"
            },
            "border":{
              "thickness":"none",
              "style":"solid",
              "colour":"rgba(2,2,2,1)"
            },
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"normal",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"title",
            "label":"Title",
            "background":{
              "background_color":"rgba(255,255,255,1)"
            },
            "typography":{
              "fontSize":"14pt",
              "fontFamily":"arial",
              "fontStyle":"normal",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"input",
            "label":"Input Area",
            "background":{
              "background_color":"rgba(231,230,230,1)"
            },
            "border":{
              "thickness":"thin",
              "style":"solid",
              "colour":"rgba(231,230,230,1)"
            },
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"normal",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"error",
            "label":"Error Highlighting",
            "background":{
              "background_color":"rgba(255,0,0,1)"
            },
            "border":{
              "thickness":"thin",
              "style":"solid",
              "colour":"rgba(246,16,16,1)"
            },
            "typography":{
              "fontSize":"11pt",
              "fontFamily":"arial",
              "fontStyle":"normal",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"numbering",
            "label":"Numbering",
            "typography":{
              "fontSize":"11pt",
              "fontFamily":"arial",
              "fontStyle":"normal",
              "fontColour":"rgba(0,0,0,1)"
            },
            "background":{
              "background_color":"rgba(255,0,0,0)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"required",
            "label":"Required Symbol (*)",
            "typography":{
              "fontSize":"8pt",
              "fontFamily":"arial",
              "fontStyle":"bold",
              "fontColour":"rgba(255,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          }
        ]
      },
      {
        "id":"button",
        "label":"Buttons",
        "sub_sections":[
          {
            "id":"bar",
            "label":"Button Bar",
            "background":{
              "background_color":"rgba(250,251,253,1)"
            },
            "border":{
              "thickness":"none",
              "style":"solid",
              "colour":"rgba(2,2,2,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"default",
            "label":"Default",
            "background":{
              "background_color":"rgba(42,114,217,1)"
            },
            "border":{
              "thickness":"none",
              "style":"solid",
              "colour":"rgba(2,2,2,1)"
            },
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"bold",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"default_active",
            "class_name": "button_default:active",
            "label":"Default (Active)",
            "background":{
              "background_color":"rgba(38,104,199,1)"
            },
            "border":{
              "thickness":"none",
              "style":"solid",
              "colour":"rgba(2,2,2,1)"
            },
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"bold",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"action",
            "label":"Action",
            "background":{
              "background_color":"rgba(42,114,217,1)"
            },
            "border":{
              "thickness":"none",
              "style":"solid",
              "colour":"rgba(2,2,2,1)"
            },
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"bold",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"action_active",
            "label":"Action (Active)",
            "background":{
              "background_color":"rgba(42,114,217,1)"
            },
            "border":{
              "thickness":"none",
              "style":"solid",
              "colour":"rgba(2,2,2,1)"
            },
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"bold",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"cancel",
            "label":"Cancel",
            "background":{
              "background_color":"rgba(252,3,3,1)"
            },
            "border":{
              "thickness":"none",
              "style":"solid",
              "colour":"rgba(2,2,2,1)"
            },
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"bold",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          },
          {
            "id":"cancel_active",
            "label":"Cancel (Active)",
            "background":{
              "background_color":"rgba(252,3,3,1)"
            },
            "border":{
              "thickness":"none",
              "style":"solid",
              "colour":"rgba(2,2,2,1)"
            },
            "typography":{
              "fontSize":"12pt",
              "fontFamily":"arial",
              "fontStyle":"bold",
              "fontColour":"rgba(0,0,0,1)"
            },
            "margin": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            },
            "padding": {
              "top": "5",
              "right": "5",
              "bottom": "5",
              "left": "5"
            }
          }
        ]
      }
    ],
    "logo":{
      "base64String":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPcAAAAjCAYAAABII5xqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxQjdBOTE5RjA3RTQxMUUzQTkzNENDQ0NCMzY5MjIxNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxQjdBOTFBMDA3RTQxMUUzQTkzNENDQ0NCMzY5MjIxNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFCN0E5MTlEMDdFNDExRTNBOTM0Q0NDQ0IzNjkyMjE3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFCN0E5MTlFMDdFNDExRTNBOTM0Q0NDQ0IzNjkyMjE3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+EXbGxwAADd1JREFUeNrsHQl0VNX1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",
      "height":37,
      "width":237
    },
    "css":".fh_appform_container .fh_appform_body_area{background-color:rgba(255,255,255,1);}.fh_appform_container .fh_appform_form_area{background-color:rgba(254,253,252,1);border:none;}.fh_appform_container .fh_appform_form_title{font-size:20pt;font-family:arial;color:rgba(3,2,2,1);font-weight:bold;font-style:normal;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;text-align:center;}.fh_appform_container .fh_appform_form_description{font-size:14pt;font-family:arial;color:rgba(0,0,0,1);font-style:italic;font-weight:normal;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;text-align:center;}.fh_appform_container .fh_appform_page_title{font-size:14pt;font-family:arial;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;text-align:center;width:100%;display:inline-block;}.fh_appform_container .fh_appform_page_description{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;}.fh_appform_container .fh_appform_progress_steps{background-color:rgba(255,255,255,1);border:none;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;width:100%;}.fh_appform_container .fh_appform_progress_steps td{text-align:center;}.fh_appform_container .fh_appform_progress_steps td .active .page_title{text-align:center;}.fh_appform_container .fh_appform_progress_steps .page_title{display:none;}.fh_appform_container .fh_appform_progress_steps .number{padding:5px 10px 5px 10px;}.fh_appform_container .fh_appform_progress_steps .number_container{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;background-color:rgba(255,255,255,1);border-width:thin;border-style:solid;border-color:rgba(0,0,0,1);display:inline-block;border-radius:13px;}.fh_appform_container .fh_appform_progress_steps td.active .number_container{font-size:12pt;font-family:arial;color:rgba(255,254,254,1);font-weight:normal;font-style:normal;background-color:rgba(0,0,0,1);border-width:thin;border-style:solid;border-color:rgba(1,1,1,1);}.fh_appform_container .fh_appform_section_area{background-color:rgba(255,255,255,1);margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;}.fh_appform_container .fh_appform_section_title{font-size:14pt;font-family:arial;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;text-align:center;}.fh_appform_container .fh_appform_section_description{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-style:italic;font-weight:normal;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;text-align:center;}.fh_appform_container .fh_appform_field_area{background-color:rgba(255,255,255,1);border-width:thin;border-style:solid;border-color:rgba(2,2,2,1);margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;}.fh_appform_container .fh_appform_field_instructions{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;background-color:rgba(255,255,255,1);border:none;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;}.fh_appform_container .fh_appform_field_title{font-size:14pt;font-family:arial;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;background-color:rgba(255,255,255,1);margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;display:block;border-radius:5px;}.fh_appform_container .fh_appform_field_input{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;background-color:rgba(231,230,230,1);border-width:thin;border-style:solid;border-color:rgba(231,230,230,1);margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;line-height:1.4em;display:inline-block;width:100%;}.fh_appform_container .fh_appform_field_input .radio{}.fh_appform_container .fh_appform_field_input .checkbox{display:inline;}.fh_appform_container .fh_appform_field_input .choice{display:inline;margin-left:5px;}.fh_appform_container .fh_appform_field_input.repeating{}.fh_appform_container .fh_appform_field_input.non_repeating{}.fh_appform_container .fh_appform_field_error{font-size:11pt;font-family:arial;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;background-color:rgba(255,0,0,1);border-width:thin;border-style:solid;border-color:rgba(246,16,16,1);margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;}.fh_appform_container .fh_appform_field_numbering{font-size:11pt;font-family:arial;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;background-color:rgba(255,0,0,0);padding:5px 5px 5px 5px;display:inline;float:left;width:15%;text-align:center;}.fh_appform_container .fh_appform_field_required:after{font-size:8pt;font-family:arial;color:rgba(255,0,0,1);font-weight:bold;font-style:normal;content:\"*\";vertical-align:top;}.fh_appform_container .fh_appform_button_bar{background-color:rgba(250,251,253,1);border:none;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;text-align:center;}.fh_appform_container .fh_appform_button_default{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;background-color:rgba(42,114,217,1);border:none;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;}.fh_appform_container .fh_appform_button_default.fh_appform_two_button{width:45%!important;}.fh_appform_container .fh_appform_button_default.fh_appform_three_button{width:30%!important;}.fh_appform_container .fh_appform_button_default.special_button{width:100%;}.fh_appform_container .fh_appform_button_default.special_button.fh_appform_removeInputBtn{width:45%;}.fh_appform_container .fh_appform_button_default.special_button.fh_appform_addInputBtn{width:45%;}.fh_appform_container .fh_appform_button_default:active{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;background-color:rgba(38,104,199,1);border:none;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;}.fh_appform_container .fh_appform_button_action{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;background-color:rgba(42,114,217,1);border:none;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;}.fh_appform_container .fh_appform_button_action.fh_appform_two_button{width:45%!important;}.fh_appform_container .fh_appform_button_action.fh_appform_three_button{width:30%!important;}.fh_appform_container .fh_appform_button_action.special_button{width:100%;}.fh_appform_container .fh_appform_button_action.special_button.fh_appform_removeInputBtn{width:45%!important;}.fh_appform_container .fh_appform_button_action.special_button.fh_appform_addInputBtn{width:45%!important;}.fh_appform_container .fh_appform_button_action:active{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;background-color:rgba(42,114,217,1);border:none;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;}.fh_appform_container .fh_appform_button_cancel{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;background-color:rgba(252,3,3,1);border:none;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;}.fh_appform_container .fh_appform_button_cancel.fh_appform_two_button{width:45%;}.fh_appform_container .fh_appform_button_cancel.fh_appform_three_button{width:33.3%;}.fh_appform_container .fh_appform_button_cancel.special_button{width:100%;}.fh_appform_container .fh_appform_button_cancel.special_button.fh_appform_removeInputBtn{width:45%;}.fh_appform_container .fh_appform_button_cancel.special_button.fh_appform_addInputBtn{width:45%;}.fh_appform_container .fh_appform_button_cancel:active{font-size:12pt;font-family:arial;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;background-color:rgba(252,3,3,1);border:none;margin:5px 5px 5px 5px;padding:5px 5px 5px 5px;border-radius:5px;}.fh_appform_container .fh_appform_logo{background-image:url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPcAAAAjCAYAAABII5xqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxQjdBOTE5RjA3RTQxMUUzQTkzNENDQ0NCMzY5MjIxNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxQjdBOTFBMDA3RTQxMUUzQTkzNENDQ0NCMzY5MjIxNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFCN0E5MTlEMDdFNDExRTNBOTM0Q0NDQ0IzNjkyMjE3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFCN0E5MTlFMDdFNDExRTNBOTM0Q0NDQ0IzNjkyMjE3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+EXbGxwAADd1JREFUeNrsHQl0VNX1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\");height:37px;width:237px;background-position:center;background-repeat:no-repeat;width:100%;display:inline-block;}.fh_appform_hidden{display:none;}.fh_appform_button_bar{text-align: center;}.fh_appform_field_button_bar{text-align: right;}.fh_appform_field_input_container.repeating{width:70%;float:left;}.fh_appform_field_input_container.non_repeating{width: 90%;float: left;text-align: center;margin: 0px 0px 0px 5px;padding: 0px 0px 0px 0px;}"
  };


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
      console.log("No section found for section id: ", sectionId);
      return null;
    }
  }

  function generateCSS(sectionId, subSectionId, styleDefinition) {

    function parseStyleNumber(numToValidate){
      if(numToValidate !== null && !isNaN(numToValidate)){
        var numToValidateInt = parseInt(numToValidate);
        if(numToValidateInt > -1){
          return numToValidate;
        } else {
          return "0";   //Margin and padding must be > 0
        }
      } else {
        return null;
      }
    };

    function generateSpacingCSS(type, spacingJSON){
      spacingJSON = spacingJSON ? spacingJSON : {};
      //top, right, bottom left
      var marginCSS = "";
      var marginValCSS = "";
      var marginUnit = "px";
      var parsedTop = parseStyleNumber(spacingJSON.top);
      var parsedRight = parseStyleNumber(spacingJSON.right);
      var parsedBottom = parseStyleNumber(spacingJSON.bottom);
      var parsedLeft = parseStyleNumber(spacingJSON.left);

      //Must have all 4 values assigned
      if(parsedTop !== null && parsedRight !== null && parsedBottom !== null && parsedLeft !== null){
        marginValCSS = parsedTop + marginUnit + " " + parsedRight + marginUnit + " " + parsedBottom + marginUnit + " " + parsedLeft + marginUnit;
        marginCSS = type + ":" + marginValCSS + ";";
        return marginCSS;
      } else {
        console.log("Error generating " + type + ". Invalid values: ", JSON.stringify(spacingJSON));
        return null;
      }
    };

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
        },
        "margin": function(marginJSON){
          return generateSpacingCSS("margin", marginJSON);
        },
        "padding": function(paddingJSON){
          return generateSpacingCSS("padding", paddingJSON);
        }
      };

      if (styleDefinition[styleType] === true) {
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
      } else if (styleDefinition[styleType] === false) {
        return "";//No style, return empty string
      } else {
        return null;
      }
    }

    var typographyCSS = generateStyleType("typography");
    var backgroundCSS = generateStyleType("background");
    var borderCSS = generateStyleType("border");
    var marginCSS = generateStyleType("margin");
    var paddingCSS = generateStyleType("padding");

    if (typographyCSS === null) {
      console.log("Typography css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    } else if (backgroundCSS === null) {
      console.log("Background css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    } else if (borderCSS === null) {
      console.log("Border css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    } else if (marginCSS === null){
      console.log("Margin css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    } else if (paddingCSS === null){
      console.log("Padding css was null for section ", sectionId, " and subsection ", subSectionId);
      return null;
    }

    return typographyCSS + backgroundCSS + borderCSS + marginCSS + paddingCSS;
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

    for (var cssObjIndex = 0; cssObjIndex < staticCSSArray.length; cssObjIndex++) {
      var cssObject = staticCSSArray[cssObjIndex];
      if (!cssObject.key) {
        return null;
      }

      if (!cssObject.value) {
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
      for (var classAddIndex = 0; classAddIndex < classAdditions.length; classAddIndex++) {
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

          logoStaticCSS = generateStaticCSS(styleStructure.logo.staticCSS);

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

    generatedCSS += ".fh_appform_hidden{display:none;}.fh_appform_button_bar{text-align: center;}.fh_appform_field_button_bar{text-align: right;}.fh_appform_field_input_container.repeating{width:70%;float:left;}.fh_appform_field_input_container.non_repeating{width: 90%;float: left;text-align: center;margin: 0px 0px 0px 5px;padding: 0px 0px 0px 0px;}";

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
    "styleStructure": styleStructure,
    "baseTheme": baseTheme
  };
};

App.forms.themeCSSGenerator = themeCSSGenerator;
