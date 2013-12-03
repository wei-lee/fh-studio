var App = App || {};
App.View = App.View || {};

App.View.SubmissionDetail = App.View.Forms.extend({

  templates : {
    "submissionDetail" : '#formSubmissionDetail'
  },

  initialize : function (){
    this.constructor.__super__.initialize.apply(this, arguments);

    Handlebars.registerHelper("createFormField", function (options, context){
      //"text", "textarea", "number", "emailAddress", "dropdown", "radio", "checkboxes", "location", "locationMap", "photo", "signature", "file", "dateTime", "sectionBreak", "matrix"
       console.log("got createFormField ", options);
      var ret = "";
      if(options.fieldId){
        switch (options.fieldId.type){
          case "text":
          case "number":
          case "emailAddress":
            for(var ii=0; ii < options.fieldValues.length; ii++){
              ret+="<div class='row-fluid'><input type='text' value='"+options.fieldValues[ii]+"'></div>";
            }
          break;
          case "textarea":
            for(var ij=0; ij < options.fieldValues.length; ij++){
              ret+="<div class='row-fluid'><textarea>"+options.fieldValues[ij]+"</textarea></div>";
            }
            break;
          case "dropDown":
            for(var ik=0; ik < options.fieldValues.length; ik++){
              ret+="<select><option value='"+options.fieldValues[ik]+"' >"+options.filedValues[ik]+"</option></select>";
            }
            break;
//          case "photo":
//          case "signature":
//            for(var il=0; il < options.fieldValues.length; il++){
//              ret+="<div class='row-fluid'><img src="options.fieldValues[il]"></div>";
//            }
          default:
            break;
        }
      }
      return ret;
    });

    _.bindAll(this);
  },

  render : function (){
    var self = this;
    var container = $('.emptyContainer');
    container.empty();
    console.log("container ", self.options);
    var data = self.options.submission.toJSON();
    console.log("data is ", data);
    data.deviceFormTimestamp = moment(data.deviceFormTimestamp).format('MMMM Do YYYY, h:mm:ss a');
    container.append(self.templates.$submissionDetail(data));
  }

});
