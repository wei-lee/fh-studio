Handlebars.registerHelper("createFormField", function (options, context){
  //"location", "locationMap", "sectionBreak", "matrix"
  console.log("got createFormField ", options);
  var ret = "";
  var i;
  if(options.fieldId){
    switch (options.fieldId.type){
      case "text":
      case "number":
      case "emailAddress":
      case "dateTime":
        for(i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><input type='text' value='"+options.fieldValues[i]+"'></div>";
        }
        break;
      case "textarea":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><textarea>"+options.fieldValues[i]+"</textarea></div>";
        }
        break;
      case "dropDown":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<select><option value='"+options.fieldValues[i]+"' >"+options.filedValues[i]+"</option></select>";
        }
        break;
      case "photo":
      case "signature":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><img style='width: 80%' src="+options.fieldValues[i]+"></div>";
        }
        break;
      case "file":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><a href='"+options.fieldValues[i]+"'><button class='btn-small icon-download'>Download</button></a></div>";
        }
        break;
      case "checkbox":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><input type='checkbox' checked value='"+options.fieldValues[i]+"'>"+options.fieldValues[i]+"</div>";
        }
        break;

      case "radio":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><input type='radio'  checked value='"+options.fieldValues[i]+"'>"+options.fieldValues[i]+"</div>";
        }
        break;
      default:
        break;
    }
  }
  return ret;
});


Handlebars.registerHelper("checkRole", function (req, options){
  console.log("required ", req);
  var reqRoles = req.split(",");
  var userRoles = $fw.getUserProp("roles");
  var hasPerm = false;
  for(var i =0; i < reqRoles.length; i++){
    if(userRoles.indexOf(reqRoles[i]) != -1){
      hasPerm = true;
      break;
    }
  }
  if(hasPerm)
    return options.fn(this);
  else{
    return false;
  }
});
