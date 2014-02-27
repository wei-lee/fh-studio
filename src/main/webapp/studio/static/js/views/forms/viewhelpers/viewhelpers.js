Handlebars.registerHelper("createFormField", function (options, context){
  //"location", "locationMap", "sectionBreak", "matrix"
  var ret = "";
  var i;
  var def = {};

  if(options.fieldId){
    switch (options.fieldId.type){
      case "text":
      case "number":
      case "emailAddress":
      case "dateTime":
        for(i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><input disabled type='text' value='"+options.fieldValues[i]+"'></div>";
        }
        break;
      case "url":
        for(i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><a href='" + options.fieldValues[i] + "'>" + options.fieldValues[i] + "</a></div>";
        }
        break;
      case "textarea":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><textarea disabled>"+options.fieldValues[i]+"</textarea></div>";
        }
        break;
      case "dropdown":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<select disabled><option value='"+options.fieldValues[i]+"' selected >"+options.fieldValues[i]+"</option></select>";
        }
        break;
      case "photo":
      case "signature":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><img style='width: 40%' src='/api/v2/forms/submission/file/"+options.fieldValues[i].groupId+"'></div>";
        }
        break;
      case "file":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid '><a href='/api/v2/forms/submission/file/"+options.fieldValues[i].groupId+"' class='btn-small downloadfile icon-download'   data-groupid='"+options.fieldValues[i]+"' >Download</a></hr></div>";
        }
        break;
      case "checkboxes":
        for( i=0; i < options.fieldValues.length; i++){
          var fValues = options.fieldValues[i];
          ret+="<div class='row-fluid'>";
          for(var k=0; k < fValues.selections.length; k++ ){
            ret+="<input disabled type='checkbox' checked value='"+fValues.selections[k]+"'> " +fValues.selections[k]+" ";
          }
          ret+="<hr/></div>";
        }
        break;

      case "radio":
        for( i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><input disabled type='radio'  checked value='"+options.fieldValues[i]+"'> "+options.fieldValues[i]+ "<hr/></div>";
        }
        break;
      case "location":
        if(options.fieldId.fieldOptions.definition && "northEast" === options.fieldId.fieldOptions.definition.locationUnit){
          for( i=0; i < options.fieldValues.length; i++){
            ret+="<div class='row-fluid'><input disabled type='text' value='zone: "+options.fieldValues[i]['zone']+ ", eastings: " + options.fieldValues[i]['eastings'] + ", northings: " + options.fieldValues[i]['northings']+" '> <hr/></div>";
          }
        }else{
          for( i=0; i < options.fieldValues.length; i++){
            ret+="<div class='row-fluid'>LonLat: <input disabled type='text' value='"+options.fieldValues[i]['long']+ "," + options.fieldValues[i].lat + "'>  <hr/></div>";
          }
        }
        break;
      case 'locationMap':
        if(options.fieldId.fieldOptions.definition && "northEast" === options.fieldId.fieldOptions.definition.locationUnit){
          for( i=0; i < options.fieldValues.length; i++){
            ret+="<div class='row-fluid'><input disabled type='text' value='zone: "+options.fieldValues[i]['zone']+ ", eastings: " + options.fieldValues[i]['eastings'] + ", northings: " + options.fieldValues[i]['northings']+" '> <hr/></div>";
          }
        }else{
          for( i=0; i < options.fieldValues.length; i++){
            ret+="<div class='row-fluid'>LonLat: <input disabled type='text' value='"+options.fieldValues[i]['long']+ "," + options.fieldValues[i].lat + "'>  <hr/></div>";
          }

        }
        break;
      default:
        break;
    }
  }
  return ret;
});


Handlebars.registerHelper("checkRole", function (req, options){
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
