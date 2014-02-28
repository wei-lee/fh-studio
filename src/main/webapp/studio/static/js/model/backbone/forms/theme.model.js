var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FormTheme = App.Model.FormBase.extend({
  idAttribute: '_id',
  fetchURL : '/api/v2/forms/theme/{{id}}'
});

App.Model.FormThemeTemplate = App.Model.FormBase.extend({
  idAttribute: '_id',
  fetchURL : '/api/v2/forms/templates/theme/{{id}}'
});

App.Collection.FormThemes = App.Collection.FormBase.extend({
  initialize: function() {},
  pluralName : 'themes',
  model: App.Model.FormTheme,
  url: '/api/v2/forms/theme',
  urlUpdate: '/api/v2/forms/theme',
  create : function(method, model, options){
    // Add in the default theme spec to this..
    var name = model.name;
    _.extend(model, this.baseTheme);
    model.name = name;
    model.updatedBy = $fw.userProps.email;
    model.lastUpdated = new Date();
    App.Collection.FormBase.prototype.create.apply(this, arguments);
  },
  baseTheme : {
    "name":"Base Theme",
    "borders":{
      "progress_steps_number_container_active":{
        "thickness":"thin",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "progress_steps_number_container":{
        "thickness":"thin",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "progress_steps":{
        "thickness":"none",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "error":{
        "thickness":"none",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "instructions":{
        "thickness":"none",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "fieldInput":{
        "thickness":"none",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "fieldArea":{
        "thickness":"none",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "forms":{
        "thickness":"none",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "button_cancel":{
        "thickness":"none",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "button_action":{
        "thickness":"none",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "button_navigation":{
        "thickness":"none",
        "style":"solid",
        "colour":"rgba(0,0,0,1)"
      },
      "navigationBar_active":{
        "thickness":"thin",
        "style":"solid",
        "colour":"rgba(0,0,0,0.5)"
      },
      "navigationBar":{
        "thickness":"thin",
        "style":"solid",
        "colour":"rgba(0,0,0,0.5)"
      }
    },
    "typography":{
      "navigationBar_active":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(255,255,255,1)"
      },
      "navigationBar":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(255,255,255,1)"
      },
      "progress_steps_number_container_active":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(255,255,255,1)"
      },
      "progress_steps_number_container":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(0,0,0,1)"
      },
      "section_break_description":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"normal",
        "fontColour":"rgba(0,0,0,1)"
      },
      "section_break_title":{
        "fontSize":"14pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(0,0,0,1)"
      },
      "error":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(0,0,0,1)"
      },
      "buttons_active":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(0,0,0,1)"
      },
      "buttons":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(255,255,255,1)"
      },
      "instructions":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"normal",
        "fontColour":"rgba(0,0,0,1)"
      },
      "fieldInput":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"normal",
        "fontColour":"rgba(0,0,0,1)"
      },
      "fieldTitle":{
        "fontSize":"14pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(0,0,0,1)"
      },
      "page_description":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"italic",
        "fontColour":"rgba(0,0,0,1)"
      },
      "page_title":{
        "fontSize":"14pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(0,0,0,1)"
      },
      "description":{
        "fontSize":"12pt",
        "fontFamily":"times",
        "fontStyle":"italic",
        "fontColour":"rgba(0,0,0,1)"
      },
      "title":{
        "fontSize":"18pt",
        "fontFamily":"times",
        "fontStyle":"bold",
        "fontColour":"rgba(0,0,0,1)"
      }
    },
    "colours":{
      "backgrounds":{
        "headerBar":"rgba(30,176,233,1)",
        "navigationBar":"rgba(30,176,233,1)",
        "navigationBar_active":"rgba(9,113,206,1)",
        "body":"rgba(238,238,238,1)",
        "form":"rgba(255,255,255,1)",
        "fieldArea":"rgba(255,255,255,1)",
        "fieldInput":"rgba(213,199,220,1)",
        "fieldInstructions":"rgba(254,254,254,1)",
        "error":"rgba(255,1,1,1)",
        "progress_steps":"rgba(255,255,255,1)",
        "progress_steps_number_container":"rgba(255,255,255,1)",
        "progress_steps_number_container_active":"rgba(0,0,0,1)",
        "field_required":"rgba(255,0,0,1)",
        "section_area":"rgba(255,255,255,1)"
      },
      "buttons":{
        "navigation":"rgba(197,198,196,1)",
        "navigation_active":"rgba(197,198,196,1)",
        "action":"rgba(30,176,233,1)",
        "action_active":"rgba(9,113,206,1)",
        "cancel":"rgba(255,0,0,1)",
        "cancel_active":"rgba(249,14,14,1)"
      }
    },
    "logo":{
      "base64String":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPcAAAAjCAYAAABII5xqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxQjdBOTE5RjA3RTQxMUUzQTkzNENDQ0NCMzY5MjIxNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxQjdBOTFBMDA3RTQxMUUzQTkzNENDQ0NCMzY5MjIxNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFCN0E5MTlEMDdFNDExRTNBOTM0Q0NDQ0IzNjkyMjE3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFCN0E5MTlFMDdFNDExRTNBOTM0Q0NDQ0IzNjkyMjE3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+EXbGxwAADd1JREFUeNrsHQl0VNX1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",
      "height":"37",
      "width":"237"
    },
    "css":".fh_appform_container .fh_appform_button_navigation{background-color:rgba(197,198,196,1);border:none;font-size:12pt;font-family:times;color:rgba(255,255,255,1);font-weight:bold;font-style:normal;border-radius:5px;padding:10px 12px;}.fh_appform_container .fh_appform_button_navigation:active{background-color:rgba(197,198,196,1);font-size:12pt;font-family:times;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;border-radius:5px;padding:10px 12px;}.fh_appform_container .fh_appform_button_action{background-color:rgba(30,176,233,1);border:none;font-size:12pt;font-family:times;color:rgba(255,255,255,1);font-weight:bold;font-style:normal;border-radius:5px;padding:10px 12px;}.fh_appform_container .fh_appform_button_action.special_button{width:100%;margin-top:10px;line-height:28px;}.fh_appform_container .fh_appform_button_action.special_button.fh_appform_removeInputBtn{width:50%;margin-top:10px;line-height:28px;}.fh_appform_container .fh_appform_button_action.special_button.fh_appform_addInputBtn{width:50%;margin-top:10px;line-height:28px;}.fh_appform_container .fh_appform_button_action:active{background-color:rgba(9,113,206,1);font-size:12pt;font-family:times;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;border-radius:5px;padding:10px 12px;}.fh_appform_container .fh_appform_button_cancel{background-color:rgba(255,0,0,1);border:none;font-size:12pt;font-family:times;color:rgba(255,255,255,1);font-weight:bold;font-style:normal;border-radius:5px;padding:10px 12px;}.fh_appform_container .fh_appform_button_cancel:active{background-color:rgba(249,14,14,1);font-size:12pt;font-family:times;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;border-radius:5px;padding:10px 12px;}.fh_appform_container .fh_appform_navigation li{background-color:rgba(30,176,233,1);font-size:12pt;font-family:times;color:rgba(255,255,255,1);font-weight:bold;font-style:normal;border-width:thin;border-style:solid;border-color:rgba(0,0,0,0.5);}.fh_appform_container .fh_appform_navigation li.active{background-color:rgba(9,113,206,1);font-size:12pt;font-family:times;color:rgba(255,255,255,1);font-weight:bold;font-style:normal;border-width:thin;border-style:solid;border-color:rgba(0,0,0,0.5);}.fh_appform_container .fh_appform_header{background-color:rgba(30,176,233,1);}.fh_appform_body{background-color:rgba(238,238,238,1);}.fh_appform_container .fh_appform_form{background-color:rgba(255,255,255,1);border:none;padding:5px;}.fh_appform_container .fh_appform_field_title{font-size:14pt;font-family:times;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;display:block;}.fh_appform_container .fh_appform_field_title.fh_appform_field_numbering{display:inline-block;}.fh_appform_container .fh_appform_field_area{background-color:rgba(255,255,255,1);border:none;padding:5px;border-bottom:none;border-radius:5px;}.fh_appform_container .fh_appform_field_area:last-child{border:none;}.fh_appform_container .fh_appform_field_area.fh_appform_field_section_break{border:none;background:transparent;}.fh_appform_container .fh_appform_field_input{background-color:rgba(213,199,220,1);font-size:12pt;font-family:times;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;border:none;width:100%;border-radius:5px;line-height:1.4em;padding:5px 0px 5px 5px;}.fh_appform_container .fh_appform_field_input .radio{margin-right:10px;}.fh_appform_container .fh_appform_field_input .checkbox{margin-right:10px;display:inline;}.fh_appform_container .fh_appform_field_input .choice{margin-right:10px;display:inline;}.fh_appform_container .fh_appform_field_instructions{background-color:rgba(254,254,254,1);font-size:12pt;font-family:times;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;border:none;margin-bottom:10px;border-radius:5px;}.fh_appform_container .fh_appform_title{font-size:18pt;font-family:times;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;text-align:center;}.fh_appform_container .fh_appform_description{font-size:12pt;font-family:times;color:rgba(0,0,0,1);font-style:italic;font-weight:normal;text-align:center;}.fh_appform_container .fh_appform_error{font-size:12pt;font-family:times;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;background-color:rgba(255,1,1,1);border:none;}.fh_appform_container .fh_appform_field_section_break_title{font-size:14pt;font-family:times;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;text-align:center;}.fh_appform_container .fh_appform_field_section_break_description{font-size:12pt;font-family:times;color:rgba(0,0,0,1);font-weight:normal;font-style:normal;text-align:center;}.fh_appform_container .fh_appform_page_title{font-size:14pt;font-family:times;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;}.fh_appform_container .fh_appform_page_description{font-size:12pt;font-family:times;color:rgba(0,0,0,1);font-style:italic;font-weight:normal;}.fh_appform_container .fh_appform_progress_wrapper{padding-top:20px;padding-bottom:10px;}.fh_appform_container .fh_appform_progress_steps{background-color:rgba(255,255,255,1);border:none;width:100%;}.fh_appform_container .fh_appform_progress_steps td{text-align:center;}.fh_appform_container .fh_appform_progress_steps td .active .page_title{text-align:center;}.fh_appform_container .fh_appform_progress_steps .page_title{padding-left:10px;display:none;}.fh_appform_container .fh_appform_progress_steps .number{padding-top:4px;}.fh_appform_container .fh_appform_progress_steps .number_container{background-color:rgba(255,255,255,1);border-width:thin;border-style:solid;border-color:rgba(0,0,0,1);font-size:12pt;font-family:times;color:rgba(0,0,0,1);font-weight:bold;font-style:normal;display:inline-block;border-radius:13px;padding-left:10px;padding-right:10px;margin-top:5px;margin-bottom:5px;}.fh_appform_container .fh_appform_progress_steps td.active .number_container{background-color:rgba(0,0,0,1);border-width:thin;border-style:solid;border-color:rgba(0,0,0,1);font-size:12pt;font-family:times;color:rgba(255,255,255,1);font-weight:bold;font-style:normal;}.fh_appform_container .fh_appform_field_required:first-child:after{color:rgba(255,0,0,1);content:' *';display:inline;}.fh_appform_container .fh_appform_action_bar{padding:18px 20px 18px 20px;}.fh_appform_container .fh_appform_action_bar button.fh_appform_two_button{width:50%;}.fh_appform_container .fh_appform_action_bar button.fh_appform_three_button{width:33.3%;}.fh_appform_container .fh_appform_section_area{background-color:rgba(255,255,255,1);padding:5px;border-radius:5px;margin-top:5px;}.fh_appform_container .fh_appform_hidden{display:none;}.fh_appform_container .fh_appform_logo{background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPcAAAAjCAYAAABII5xqAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxQjdBOTE5RjA3RTQxMUUzQTkzNENDQ0NCMzY5MjIxNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxQjdBOTFBMDA3RTQxMUUzQTkzNENDQ0NCMzY5MjIxNyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjFCN0E5MTlEMDdFNDExRTNBOTM0Q0NDQ0IzNjkyMjE3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjFCN0E5MTlFMDdFNDExRTNBOTM0Q0NDQ0IzNjkyMjE3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+EXbGxwAADd1JREFUeNrsHQl0VNX1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\");height: 37px;width:237px;background-position:center;background-repeat:no-repeat;width:100%;}"
  }
});

App.Collection.FormThemeTemplate = App.Collection.FormBase.extend({
  pluralName : 'themes',
  initialize: function() {},
  model: App.Model.FormThemeTemplate,
  urlUpdate: '/api/v2/forms/theme',
  url: '/api/v2/forms/templates/theme/list'
});