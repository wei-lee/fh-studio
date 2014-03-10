var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};


App.Model.FormTheme = App.Model.FormBase.extend({
  idAttribute: '_id',
  fetchURL: '/api/v2/forms/theme/{{id}}',
  urlUpdate: '/api/v2/forms/theme',
  save: function (attributes, options) {
    var self = this,
      id = this.get('_id');
    options.type = 'post'; // Always use POST for these operations
    this.url = this.urlUpdate.replace('{{id}}', id);
    Backbone.RelationalModel.prototype.save.apply(this, arguments);
  }
});

App.Model.FormThemeTemplate = App.Model.FormBase.extend({
  idAttribute: '_id',
  fetchURL: '/api/v2/forms/templates/theme/{{id}}'
});

App.Collection.FormThemes = App.Collection.FormBase.extend({
  initialize: function () {
  },
  pluralName: 'themes',
  model: App.Model.FormTheme,
  url: '/api/v2/forms/theme',
  urlUpdate: '/api/v2/forms/theme',
  create: function (method, model, options) {
    // Add in the default theme spec to this..
    var name = model.name;
    _.extend(model, this.baseTheme);
    model.name = name;
    model.updatedBy = $fw.userProps.email;
    model.lastUpdated = new Date();
    App.Collection.FormBase.prototype.create.apply(this, arguments);
  },
  baseTheme: {
    "sections": [
      {
        "id": "body",
        "label": "Body",
        "sub_sections": [
          {
            "id": "area",
            "label": "Area",
            "typography": {
              "fontSize": "11pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#321321"
            },
            "background": {
              "background_color": "#123456"
            },
            "border": {
              "thickness": "thin",
              "style": "double",
              "colour": "#123123"
            }
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

            "background": {
              "background_color": "#312312"
            },
            "border": {
              "thickness": "thick",
              "style": "dotted",
              "colour": "#3213c1"
            }
          },
          {
            "id": "title",
            "label": "Title",
            "typography": {
              "fontSize": "12pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#34df75"
            }

          },
          {
            "id": "description",
            "label": "Description",
            "typography": {
              "fontSize": "18pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#35df75"
            }

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
            "typography": {
              "fontSize": "16pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#43cf75"
            }

          },
          {
            "id": "description",
            "label": "Description",
            "typography": {
              "fontSize": "14pt",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "#123f75"
            }

          },
          {
            "id": "progress_steps",
            "label": "Progress Steps",
            "background": {
              "background_color": "#124356"
            },
            "border": {
              "thickness": "thin",
              "style": "double",
              "colour": "#1265c1"
            }

          },
          {
            "id": "progress_steps_number_container",
            "label": "Progress Steps Number Container",
            "typography": {
              "fontSize": "18pt",
              "fontFamily": "times",
              "fontStyle": "italic",
              "fontColour": "#635892"
            },
            "background": {
              "background_color": "#846790"
            },
            "border": {
              "thickness": "none",
              "style": "dashed",
              "colour": "#831678"
            }

          },
          {
            "id": "progress_steps_number_container_active",
            "label": "Progress Steps Number Container (Active)",
            "typography": {
              "fontSize": "12pt",
              "fontFamily": "arial",
              "fontStyle": "italic",
              "fontColour": "#457245"
            },
            "background": {
              "background_color": "#934562"
            },
            "border": {
              "thickness": "medium",
              "style": "double",
              "colour": "#153789"
            }

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

            "background": {
              "background_color": "#456784"
            }

          },
          {
            "id": "title",
            "label": "Title",
            "typography": {
              "fontSize": "12pt",
              "fontFamily": "times",
              "fontStyle": "bold",
              "fontColour": "#415126"
            }

          },
          {
            "id": "description",
            "label": "Description",
            "typography": {
              "fontSize": "12pt",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "#345123"
            }

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
            "background": {
              "background_color": "#523521"
            },
            "border": {
              "thickness": "thin",
              "style": "double",
              "colour": "#623442"
            }
          },
          {
            "id": "instructions",
            "label": "Instructions",
            "typography": {
              "fontSize": "18pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#521251"
            },
            "background": {
              "background_color": "#517564"
            },
            "border": {
              "thickness": "thick",
              "style": "double",
              "colour": "#623452"
            }
          },
          {
            "id": "title",
            "label": "Title",
            "typography": {
              "fontSize": "14pt",
              "fontFamily": "normal",
              "fontStyle": "italic",
              "fontColour": "#623512"
            },
            "background": {
              "background_color": "#642452"
            }
          },
          {
            "id": "input",
            "label": "Input Area",
            "typography": {
              "fontSize": "14pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#623321"
            },
            "background": {
              "background_color": "#842342"
            },
            "border": {
              "thickness": "thick",
              "style": "double",
              "colour": "#642346"
            }

          },
          {
            "id": "error",
            "label": "Error Highlighting",

            "typography": {
              "fontSize": "12pt",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "#235232"
            },
            "background": {
              "background_color": "#734453"
            },
            "border": {
              "thickness": "thick",
              "style": "dotted",
              "colour": "#542134"
            }

          },
          {
            "id": "required",
            "label": "Required Symbol (*)",

            "typography": {
              "fontSize": "13pt",
              "fontFamily": "times",
              "fontStyle": "bold",
              "fontColour": "#654234"
            }

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

            "background": {
              "background_color": "#523421"
            },
            "border": {
              "thickness": "thin",
              "style": "double",
              "colour": "#523465"
            }

          },
          {
            "id": "default",
            "label": "Default",

            "typography": {
              "fontSize": "14pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#526321"
            },
            "background": {
              "background_color": "#723623"
            },
            "border": {
              "thickness": "thick",
              "style": "double",
              "colour": "#463235"
            }

          },
          {
            "id": "default_active",
            "label": "Default (Active)",

            "typography": {
              "fontSize": "18pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#643462"
            },
            "background": {
              "background_color": "#686234"
            },
            "border": {
              "thickness": "thick",
              "style": "dotted",
              "colour": "#236723"
            }

          },
          {
            "id": "action",
            "label": "Action",

            "typography": {
              "fontSize": "14pt",
              "fontFamily": "arial",
              "fontStyle": "normal",
              "fontColour": "#623453"
            },
            "background": {
              "background_color": "#634453"
            },
            "border": {
              "thickness": "thick",
              "style": "dashed",
              "colour": "#634523"
            }

          },
          {
            "id": "action_active",
            "label": "Action (Active)",

            "typography": {
              "fontSize": "18pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#623412"
            },
            "background": {
              "background_color": "#156122"
            },
            "border": {
              "thickness": "thin",
              "style": "double",
              "colour": "#523412"
            }

          },
          {
            "id": "cancel",
            "label": "Cancel",

            "typography": {
              "fontSize": "13pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#623523"
            },
            "background": {
              "background_color": "#634523"
            },
            "border": {
              "thickness": "thick",
              "style": "double",
              "colour": "#235623"
            }

          },
          {
            "id": "cancel_active",
            "label": "Cancel (Active)",

            "typography": {
              "fontSize": "18pt",
              "fontFamily": "arial",
              "fontStyle": "bold",
              "fontColour": "#523643"
            },
            "background": {
              "background_color": "#642342"
            },
            "border": {
              "thickness": "thin",
              "style": "double",
              "colour": "#235263"
            }

          }
        ]
      }
    ],
    "structure": {
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
              ],
              "classAdditions": [
                {
                  "classNameAddition": " button.fh_appform_two_button",
                  "cssAdditions": [
                    {
                      "key": "width",
                      "value": "50%"
                    }
                  ]
                },
                {
                  "classNameAddition": " button.fh_appform_three_button",
                  "cssAdditions": [
                    {
                      "key": "width",
                      "value": "33.3%"
                    }
                  ]
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
              "staticCSS": []
            },
            {
              "id": "default_active",
              "label": "Default (Active)",
              "style": {
                "typography": true,
                "background": true,
                "border": true
              },
              "staticCSS": []
            },
            {
              "id": "action",
              "label": "Action",
              "style": {
                "typography": true,
                "background": true,
                "border": true
              },
              "staticCSS": []
            },
            {
              "id": "action_active",
              "label": "Action (Active)",
              "style": {
                "typography": true,
                "background": true,
                "border": true
              },
              "staticCSS": []
            },
            {
              "id": "cancel",
              "label": "Cancel",
              "style": {
                "typography": true,
                "background": true,
                "border": true
              },
              "staticCSS": []
            },
            {
              "id": "cancel_active",
              "label": "Cancel (Active)",
              "style": {
                "typography": true,
                "background": true,
                "border": true
              },
              "staticCSS": []
            }
          ]
        }
      ],
      "logo": {
        "staticCSS": [
          {"key": "background-position", "value": "center"},
          {"key": "background-repeat", "value": "no-repeat"},
          {"key": "width", "value": "100%"}
        ]
      }
    },
    "logo": {
      "base64String": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPcAAAAjCAYAAABII5xqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxQjdBOTE5RjA3RTQxMUUzQTkzNENDQ0NCMzY5MjIxNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxQjdBOTFBMDA3RTQxMUUzQTkzNENDQ0NCMzY5MjIxNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFCN0E5MTlEMDdFNDExRTNBOTM0Q0NDQ0IzNjkyMjE3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFCN0E5MTlFMDdFNDExRTNBOTM0Q0NDQ0IzNjkyMjE3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+EXbGxwAADd1JREFUeNrsHQl0VNX1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",
      "height": "37",
      "width": "237"
    }
  }
});

App.Collection.FormThemeTemplate = App.Collection.FormBase.extend({
  pluralName: 'themes',
  initialize: function () {
  },
  model: App.Model.FormThemeTemplate,
  urlUpdate: '/api/v2/forms/theme',
  url: '/api/v2/forms/templates/theme/list'
});