Handlebars.registerHelper("hasLength", function (options, context){
  console.log("hasLength", options.length);
  if(options.length > 0){
    return context.fn(this);
  }
  return false;
});


Handlebars.registerHelper("createFormField", function (options, context){
  //"location", "locationMap", "sectionBreak", "matrix"
  var ret = "";
  var i;
  var template;
  var def;

  console.log("OPTIONS ARE : ", options);

  if(options){
    console.log("TYPE IS : ", options.type);
    switch (options.type){
      case "text":
      case "number":
      case "emailAddress":
      case "dateTime":
      case "url":
        template ="<div class='row-fluid'><input data-index='{idx}' disabled type='text' name='"+options._id+"' placeholder='no value present' value='{val}' /></div>";
        if(! options.values || options.values.length < 1){
          ret = template.replace("{val}","").replace('{idx}',0);
        }else{
          for(i=0; i < options.values.length; i++){
            var val = options.values[i];
            ret+=template.replace("{val}",val).replace('{idx}',i);
          }
        }
        break;
      case "textarea":
        template = "<div class='row-fluid'><textarea data-index='{idx}' name='"+options._id+"' placeholder='no value present' disabled>{val}</textarea></div>";
        if(!options.values || options.values.length < 1){
          ret = template.replace("{idx}",0).replace('{val}',"");
        }else{
          for( i=0; i < options.values.length; i++){
            ret+=template.replace("{val}",options.values[i]).replace('{idx}',i);
          }
        }
        break;
      case "dropdown":
        //todo revisit this as I think I need a select per answer.
        var selectOpts = options.fieldOptions.definition.options;
        ret = "<select disabled name='"+options._id+"' >";
        template = "<option value='{val}' data-index='{idx}' {selected} >{val}</option>";
        ret+=template.replace(/\{val\}/g,"");
        for(i=0; i < selectOpts.length; i++){

          if(options.values && options.values[0]){
            if(options.values[0] == selectOpts[i].label){
              ret+=template.replace(/\{val\}/g,selectOpts[i].label).replace("{selected}","selected");
            }else{
              ret+=template.replace(/\{val\}/g,selectOpts[i].label).replace("{selected}","");
            }
          }
        }
        ret+="</select>";
        break;
      case "photo":
      case "signature":
        template = "<div class='row-fluid'>{val} </div><input class='hide' data-index='{idx}' data-filehash='{hash}' data-groupid='{groupid}' disabled type='file' name='"+options._id+"' /> ";
        if(!options.values || options.values.length < 1){
          ret = template.replace("{val}","no "+options.type+" present").replace("{hash}","").replace("{groupid}","").replace('{idx}',0);
        }else{
          for( i=0; i < options.values.length; i++){
            ret+=template.replace("{val}","<img style='width: 40%' src='"+options.values[i].url+"?rand="+Math.random()+"'>")
              .replace("{hash}",options.values[i].hashName).replace("{groupid}",options.values[i].groupId).replace('{idx}',i);
          }
        }
        break;
      case "file":
        template = "<div class='row-fluid'>{val}</div> <input class='hide' data-filehash='{hash}' data-index='{idx}' data-exists='{exists}' data-groupid='{groupid}' disabled type='file' name='"+options._id+"'>";

        if(!options.values || options.values.length < 1){
          ret = template.replace("{val}","no "+options.type+" present").replace("{hash}","").replace("{exists}",false).replace("{groupid}","").replace('{idx}',0);
        }else{
          for( i=0; i < options.values.length; i++){
            ret+=template.replace("{val}","<a href='"+options.values[i].downloadUrl+"' class='btn-small downloadfile icon-download'>" +options.values[i].downloadUrl+"</a>")
              .replace("{hash}",options.values[i].hashName).replace('{exists}',true)
              .replace("{groupid}",options.values[i].groupId).replace('{idx}',i);
          }
        }

        break;
      case "checkboxes":

        template = "<div class='row-fluid'><input name='"+options._id+"' disabled type='checkbox' data-index='{idx}' {checked} value='{val}'> {label}</div>";
        if(! options.values || options.values.length < 1){
          def = options.fieldOptions.definition;
          for(i=0; i < def.options.length; i++){
            ret+=template.replace("{checked}","").replace("{label}",def.options[i].label).replace("{val}","").replace('{idx}',0);
          }
        }else{
          for( i=0; i < options.values.length; i++){
            var fValues = options.values[i];
            ret+="<div class='row-fluid'>";
            for(var k=0; k < fValues.selections.length; k++ ){
              ret+="<input name='"+options._id+"' data-index='"+k+"' disabled type='checkbox' checked value='"+fValues.selections[k]+"'> " +fValues.selections[k]+" ";
            }
            ret+="</div>";
          }
        }
        break;

      case "radio":

        template = "<div class='row-fluid'><input data-index='{idx}' name='"+options._id+"' disabled type='radio' {checked} value={val} > {label} </div>";

        if(! options.values || options.values.length < 1){
          def = options.fieldOptions.definition;
          for(i=0; i < def.options.length; i++){
            ret+=template.replace("{checked}","").replace("{label}",def.options[i].label).replace("{val}","").replace('{idx}',0);
          }
        }
        else{
          for( i=0; i < options.values.length; i++){
            ret+=template.replace(options.values[i]).replace("{checked}","checked").replace("{label}",options.values[i]).replace('{idx}',i);
          }
        }
        break;
      case "location":
        if(options.fieldOptions.definition && "northEast" === options.fieldOptions.definition.locationUnit){
          template = "<div class='row-fluid'><input name='"+options._id+"' disabled type='text' placeholder='no value present' value='{val}' data-index={idx} /></div>";
          if(! options.values || options.values.length < 1){
             ret = template.replace("{val}","").replace('{idx}',0);
          }else{
            for( i=0; i < options.values.length; i++){
              ret+=template.replace("{val}",options.values[i]['zone']+ ", eastings: " + options.values[i]['eastings'] + ", northings: " + options.values[i]['northings']).replace('{idx}',i);
            }
          }
        }else{
          template = "<div class='row-fluid'><input name='"+options._id+"' data-idx='{idx}' placeholder='no value present' disabled type='text' value='{val}' /></div>";
          if(! options.values || options.values.length < 1){
            ret = template.replace("{val}","").replace('{idx}',0);
          }else{
            for( i=0; i < options.values.length; i++){
              ret+=template.replace('{val}',options.values[i]['long']+ "," + options.values[i].lat).replace('{idx}',i);
            }
          }
        }
        break;
      case 'locationMap':
        console.log("location map opts ", options);
        template = "<div class='row-fluid'><input disabled placeholder='no value present' name='"+options._id+"' type='text' value='{val}' data-index='{idx}'></div>";
        if(! options.values || options.values.length < 1){
          ret=template.replace("{val}",'').replace('{idx}',0);
        }
        else if(options.fieldOptions && options.fieldOptions.definition && "northEast" === options.fieldOptions.definition.locationUnit){
          for( i=0; i < options.values.length; i++){
            ret+=template.replace("{val}","zone: "+options.values[i]['zone']+ ", eastings: " + options.values[i]['eastings'] + ", northings: " + options.values[i]['northings']).replace('{idx}',i);
          }
        }else{
          for( i=0; i < options.values.length; i++){
            ret+=template.replace("{val}",options.values[i]['long']+ "," + options.values[i].lat).replace('{idx}',i);
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

Handlebars.registerHelper('is', function() {
  var args = Array.prototype.splice.call(arguments, 0);
  if (args.length < 3) throw new Error("Handlebars helper error - must specify at least one field type to match, and the field type to check against e.g. {{#is 'text' fieldType}}foo{{/is}}");
  var options = args.pop();
  var fieldType = args.pop();
  if (args.indexOf(fieldType) > -1) {
    return options.fn(this);
  } else {
    if ('function' === typeof options.inverse) {
      return options.inverse(this);
    }
  }
});

Handlebars.registerHelper('createFormLabel', function (fieldType, options){

  var ret='<span class="symbol"><span class="icon {class}"></span></span>';

  switch (fieldType){
    case "text":
      ret = ret.replace("{class}","icon-font");
      break;
    case "emailAddress":
      ret = ret.replace("{class}","icon-envelope-alt");
      break;
    case "number":
      ret = ret.replace("{class}","icon-number");
      break;
    case "url":
      ret = ret.replace("{class}","icon-link");
      break;
    case "radio":
      ret = ret.replace("{class}","icon-circle-blank");
      break;
    case 'locationMap':
      ret = ret.replace("{class}","icon-map-marker");
      break;
    case "file":
      ret = ret.replace("{class}","icon-cloud-upload");
      break;
    case "location":
      ret = ret.replace("{class}","icon-location-arrow");
      break;
    case "dateTime":
      ret = ret.replace("{class}","icon-calendar");
      break;
    case "dropdown":
      ret = ret.replace("{class}","icon-caret-down");
      break;
    case "checkbox":
      ret = ret.replace("{class}","icon-check");
      break;
    case "textarea":
      ret = ret.replace("{class}","icon-align-justify");
      break;
  }

  return ret;
});
