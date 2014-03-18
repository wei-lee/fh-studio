Handlebars.registerHelper("hasLength", function (options, context){
  if(options.length > 0){
    return context.fn(this);
  }
  return false;
});

Handlebars.registerHelper("createFormField", function (options, editMode, context){
  //"location", "locationMap", "sectionBreak", "matrix"
  var i= 0,
  template;

  if (!options){
    return;
  }

  // Apply context data to each template so we can effectively render it
  var definition = options && options.fieldOptions && options.fieldOptions.definition || false; // convenience property
  options.data = [];

  if(options.values.length < 1 || (options.values && options.values.selections)){           //no values
    options.data.push({"_id":options._id});
    buildMulti(options.data[0],definition,[],0);
  }

  function buildMulti(data, definition, val, index){
    data.options = []; // Tempalte iterates over these to draw the radios or checkboxes or dropdown options
    for (var j=0; definition.options && j<definition.options.length; j++){
      var opt = definition.options[j],
        optData = {
          label : opt.label,
          _id : options._id,
          idx : index
        };
      // Some use the checked prop, some use selected..
      if (options.type === 'checkboxes'){
        val.selections = val.selections || [];
        // NB Checkboxes has a "selections" object where the array lives, unlike radio and dropdown because who needs to be consistant
        optData.checked = val.selections.indexOf(opt.label)>-1 ? 'checked' : '';
      }else{
        optData.selected = val.indexOf(opt.label)>-1 ? 'selected' : '';
        optData.checked = val.indexOf(opt.label)>-1 ? 'checked' : '';
      }
      data.options.push(optData);
    }
  }



  // Iterate over field values (in case of multi-field form) - often this is just a single element in the array.
  for (i=0; i<options.values.length; i++){

    var val = options.values[i],
    data = {};
    data.val = val; // Could be a number of things - just a string, array of strings, object - all depends on options.type
    data._id = options._id;
    data.missingText = (options.missing) ? "This field has been removed from the form":"";
    data.idx = i;
    data.disabled = editMode===true ? '' : 'disabled';
    if (definition && definition.options){
      data.label = options.fieldOptions.definition.options[i].label;
    }

    // Multiple input fields, within a type which can already have many arrays of fields (hasMultiple)
    if (options.type === 'radio' || options.type === 'checkboxes' || options.type === "dropdown"){
      data.options = []; // Tempalte iterates over these to draw the radios or checkboxes or dropdown options
      buildMulti(data,definition,val,i);

    }

    if (options.type === 'location' || options.type === 'locationMap'){
      if (definition && definition.locationUnit==='latlong'){
        if (val && val.lat && val['long']){
          data.maplink = "http://maps.google.com/maps?z=12&t=m&q=loc:" + val.lat + "+" + val['long'];
        }else{
          data.maplink = false;
          val = {};
          val['lat'] = 'No value';
          val['long'] = 'No value';
        }

        data.lat = val.lat;
        data['long'] = val['long'];
      }else if ('locationMap' === options.type){
        data.lat = val.lat;
        data['long'] = val['long'];
      }else{
        val = val || {eastings : 'No value', northings: 'No value', zone : 'No value'};
        data.zone = val.zone;
        data.eastings = val.eastings;
        data.northings = val.northings;
      }
    }

    if (options.type === 'photo' || options.type === 'signature' || options.type === 'file'){
      data.url = val.downloadUrl || val.url;
      //only need random seed for photo

      if('photo' === options.type){
        data.url+= '?rand=' + Math.random();
      }
      data.val = val.url || val.downloadUrl;
      data.groupid = val.groupId;
      data.hash = val.hashName;
    }
    options.data.push(data);
  }


  template = Handlebars.compile(_templateForField(options));
  options.hide = (editMode) ? "formVal" : "hide formVal";

  template = template(options);
  return template;


  function _templateForField(options){
    var template;
    switch (options.type){
      case "text":
      case "number":
      case "emailAddress":
      case "dateTime":
      case "url":
        template = (editMode) ? "<input data-index='{{idx}}' {{disabled}} type='text' name='{{_id}}' placeholder='No value present' value='{{val}}' class='formVal' data-_id='{{_id}}'  />" : "{{val}} <span class='help-inline' style='color: orange;'>{{missingText}}</span>";
        break;
      case "url":
        for(i=0; i < options.fieldValues.length; i++){
          ret+="<div class='row-fluid'><a href='" + options.fieldValues[i] + "'>" + options.fieldValues[i] + "</a></div>";
        }
        break;
      case "textarea":
        template = (editMode) ? "<textarea data-index='{{idx}}' name='{{_id}}' placeholder='No value present' {{disabled}} class='formVal' data-_id='{{_id}}'  >{{val}}</textarea>" : "<p>{{val}}</p>";
        break;
      case "dropdown":
        template = "<select class='formVal' data-_id='{{_id}}'  {{disabled}} name='{{_id}}' >" +
          "{{#each options}}" +
            "<option value='{{label}}' data-index='{{idx}}' {{selected}}>{{label}}</option>" +
          "{{/each}}"+
        "</select>";
        break;
      case "photo":
      case "signature":
        template = "<img style='width: 40%' src='{{url}}'><input class='{{hide}}' data-index='{{idx}}' data-filehash='{{hash}}' data-groupid='{{groupid}}' {{disabled}} type='file' name='{{_id}}' />";
        break;
      case "file":
        template = "<a class='btn-small downloadfile icon-download' href='{{url}}' class='btn-small downloadfile icon-download'>{{url}}</a>" +
        "<input class='{{hide}}' data-filehash='{{hash}}' data-index='{{idx}}' data-exists='{{exists}}' data-groupid='{{groupid}}' {{disabled}} type='file' name='{{_id}}'>";
        break;
      case "checkboxes":
        template = "{{#each options}}" +
            "<input data-checkbox-index='{{@index}}' name='{{_id}}' {{disabled}} class='formVal' data-_id='{{_id}}'  type='checkbox' data-index='{{idx}}' {{checked}} value='{{label}}'> {{label}}<br />" +
          "{{/each}}";
        break;
      case "radio":
        template = "{{#each options}}" +
          "<input data-index='{{idx}}' class='formVal' data-_id='{{_id}}'  data-_id='{{_id}}' name='radio{{idx}}' {{disabled}} type='radio' {{checked}} value={{label}} > {{label}}<br />" +
        "{{/each}}";
        break;
      case "location":
      case 'locationMap':
        if(options.fieldOptions && options.fieldOptions.definition && "northEast" === options.fieldOptions.definition.locationUnit){
          if (editMode){
            template = "Eastings: <input class='formVal' data-_id='{{_id}}'  name='eastings' {{disabled}} type='text' placeholder='No value present' value='{{eastings}}' data-index={{idx}} /><br />" +
            "Northings: <input class='formVal' data-_id='{{_id}}'  name='northings' {{disabled}} type='text' placeholder='No value present' value='{{northings}}' data-index={{idx}} /><br />" +
            "Zone: <input name='zone' class='formVal' data-_id='{{_id}}'  {{disabled}} type='text' placeholder='No value present' value='{{zone}}' data-index={{idx}} /><br />";
          }else{
            template = "<label>Eastings:</label> {{eastings}}, <br />" +
            "<label>Northings:</label> {{northings}}, <br />" +
            "<label>Zone:</label> {{zone}}";
          }
        }else{
          // Map link for non-northings eastings for convenience
          template = "{{#if maplink}}<a class='maplink pull-right' target='_blank' href='{{maplink}}'><i class='icon icon-map-marker'></i></a>{{/if}}";
          if (editMode){
            template += "<label>Latitude:</label> <input name='lat' data-subtype='location' class='formVal' data-_id='{{_id}}'  data-idx='{{idx}}' placeholder='No value present' {{disabled}} type='text' value='{{lat}}' /><br/>"+
            "<label>Longitude:</label> <input data-subtype='location' name='long' data-_id='{{_id}}'  data-idx='{{idx}}' class='formVal' placeholder='No value present' {{disabled}} type='text' value='{{long}}' />";
          }else{
            template += "<label>Latitude:</label> {{lat}},<br /> <label>Longitude:</label> {{long}}";
          }

        }
        break;
      default:
        break;
    }
    if (options.repeating && options.repeating === true){
      template = "<i class='pull-left icon icon-repeat'></i>" +
      "<ol>" +
      "{{#each data}}" +
      "<li>" +
      template +
      "</li>" +
      "{{/each}}" +
      "</ol>";
    }else{
      template = "{{#each data}}" +
      template +
      "{{/each}}";
    }

    return template;
  }

});


Handlebars.registerHelper("checkRole", function (req, options){
  var reqRoles = req.split(",");
  var userRoles = $fw.getUserProp("roles");
  var hasPerm = false;
  for(var i =0; i < reqRoles.length; i++){
    if(userRoles.indexOf(reqRoles[i]) !== -1){
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
