var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.CmsSection = Backbone.Model.extend({
});

App.Collection.CMS = Backbone.Collection.extend({
  initialize: function(models, options) {
    var url = options.url,
    key;
    this.urls = {
      readSections : '/mbaas/cms/sections',
      crupdateSection : '/mbaas/cms/section',
      field : '/mbaas/cms/section/field',
      fieldlist: '/mbaas/cms/section/list/field/',
      upload : '/mbaas/cms/{_id}/upload'
    };

    // Add in the URL prefix
    for (key in this.urls){
      if (this.urls.hasOwnProperty(key)){
        this.urls[key] = url + this.urls[key];
      }
    }
    this.urls.mock = '/studio/static/js/model/backbone/mocks/cms_sections.json';
    this.urls.app = options.url;
  },
  model: App.Model.CmsSection,
  remove : function(model, options){
    Backbone.Collection.prototype.remove.apply(this, arguments);
     var self = this,
     opts = {
       success : function(){
         self.trigger('reset');
         options.success.apply(self, arguments);
       }, error : options.error
     };
    this.sync('delete', model, opts);

  },
  sync: function (method, model, options) {
    var self = this;
    options = options || {};
    options.success = options.success || function(){

    };

    if (!options.success){
      options.success = function(){};
      console.warn('No success CB provided in Section Model on ' + method + ' operation');
    }
    if (!options.error){
      options.error = function(){};
      console.warn('No error CB provided in Section Model on ' + method + ' operation');
    }
    
    switch(method){
      case "read": // read sections
        this.read.apply(this, arguments);
        break;
      case "create": // create a new section
        this.create.apply(this, arguments);
        break;
      case "discarddraft": // Restore a section to it's published values
        //TODO
        break;
      case "draft": // Update section values
        this.draft.apply(this, arguments);
        break;
      case "publish": // Publish entire CMS (all drafts)
        //TODO
        break;
      case "delete": // Delete a section
        this.del.apply(this, arguments);
        break;
      default:
        break;
    }


  },
  /*
    User clicks the 'save draft' / 'save changes' button
   */
  draft : function(method, model, options){
    var self = this,
    url = this.urls.crupdateSection,
    filesToUpload = this.getFilesToUpload(model);

    console.log("MODEL SAVE ", model);
    delete model.__v;
    delete model.hash;
    delete model.status;
    model.fields = this.trimInternalIds(model.fields);
    model.modifiedBy = $fw.userProps.email;
    for(var i=0; i < model.fields.length; i++ ){
      model.fields[i].section = model.name;
      model.fields[i].modifiedBy = model.modifiedBy;
    }

    var inst = this.inst = $fw.data.get('inst');
    this.userApiKey = $fw.data.get("userapikey");
    this.guid = this.inst.guid;
    this.appkey = this.inst.apiKey;




    $.ajax({
      type: "PUT",
      url: url, contentType : "application/json",
      data: JSON.stringify(model),
      "headers":{
        "x-fh-auth-app":self.appkey,
        "x-fh-auth-user":self.userApiKey
      }
    }) .done(function(res){
      self.fetch({reset : true, silent : true, success : function(res){
        // Find this file's ID
        if (filesToUpload && filesToUpload.length>0){
          self.uploadFiles(model, filesToUpload, options, function(err, res){
            self.trigger('reset');
            if (err){
              return options.error(err);
            }
            return options.success(res);
          });
        }else{
          self.trigger('reset');
          return options.success(res);
        }
      }});
    }).error(options.error);
  },
  getFilesToUpload : function(model){
    // we need a copy as we want to retain some props that get stripped to go across the wire
    var self = this,
    filesToUpload = [],
    files = [],
    fieldLists;

    if (model.type && model.type === "list"){
      _.each(model.values, function(row){
        _.each(row, function(rowValue){
          if (typeof rowValue === 'object' && rowValue.type === 'file' && rowValue.needsUpload === true){
            rowValue.listName = model.name;
            files.push(_.clone(rowValue));
            delete rowValue.fieldEl;
          }
        });
      });
    }else{
      // We've been passed a full section - find the file fields
      files = _.where(model.fields, {type : 'file'});

    }

    // Now find any field lists we might need to do magix with
    fieldLists = _.where(model.fields, {type : 'list'});
    _.each(fieldLists, function(list){
      filesToUpload = filesToUpload.concat(self.getFilesToUpload(list));
    });

    _.each(files, function(f){
      if (f.needsUpload){
        filesToUpload.push(_.clone(f));
        delete f.fieldEl;
      }
    });

    return filesToUpload;
  },
  uploadFiles : function(section, files, options, cb){
    var inst = this.inst = $fw.data.get('inst');
    this.userApiKey = $fw.data.get("userapikey");
    this.guid = this.inst.guid;
    this.appkey = this.inst.apiKey;

    var self =  this,
    uploaders = [];
    for (var i=0; i<files.length; i++){
      var f = files[i];
      if (!f._id){
        // If we've just created this field, it hasn't yet got an ID - retrieve it from
        // our freshly re-fetched section definitions after the PUT
        f._id = self.findNewlyCreatedField(section, f);
      }

      var temp_form =  $('<form method="POST" enctype="multipart/form-data"></form>'),
      fileFieldEl = f.fieldEl[0];
      temp_form.append(fileFieldEl);
      $('body').append(temp_form);
      (function(self, f, fileFieldEl, temp_form){
        uploaders.push(function(cb){
          var data = {
            fileName :f.name
          },
          request_opts;

          if (f.hasOwnProperty('listFieldsIndex')){
            data.listFieldsIndex = f.listFieldsIndex;
            data.listFieldsName = f.listFieldsName;
          }

          request_opts = {
            fileInput : $(fileFieldEl),
            multipart : true,
            url: self.urls.upload.replace("{_id}", f._id),
            formData: data,
            "headers":{
              "x-fh-auth-app":self.appkey,
              "x-fh-auth-user":self.userApiKey
            },
            dataType: 'json',
            success: function(res) {
              temp_form.remove();
              return cb(null, res);
            },
            error : function(err){
              temp_form.remove();
              console.log("Error uploading files:");
              console.log(err);
              return cb("Error uploading files: " + err.error);
            }
          };

          $(temp_form).fileupload();
          $(temp_form).fileupload('send', request_opts).success(function (res, textStatus, jqXHR) {
            temp_form.remove();
            return cb(null, res);
          }).error(function (jqXHR, textStatus, errorThrown) {
            temp_form.remove();
            console.log("Error uploading files:");
            console.log(textStatus);
            return cb("Error uploading files");
          });

        });
      })(self, f, fileFieldEl, temp_form);

    }

    // Fix for race condition occuring in async proving tough to fix
    var raceFix = false;
    return async.series(uploaders, function(err, res){
      if (raceFix === true){
        return;
      }
      raceFix = true;
      if (err){
        return cb(err);
      }
      res = res || {};
      return cb(null, res);
    });
  },
  findNewlyCreatedField : function(section, f){
    var sectionId = section._id,
    fields = this.findWhere({ _id : sectionId }).get('fields'),
    field = _.findWhere(fields, { name :f.name });
    if (field){
      return field._id;
    }
    var lists = _.where(fields, {type : 'list'}),
    list = _.findWhere(lists, { name : f.listName });

    //field = _.findWhere(list.fields, { name : f.name });

    if (list){
      return list._id;
    }

    throw new Error("Could not find field id to upload");
  },
  /*
    Internally we use backbone CIDs to represent state until it reaches the SS.
    Since these are new fields according to the SS, we don't want to dispatch these
    fake internal IDs - it'll only trigger an update..
   */
  trimInternalIds : function(fields){
    var self = this;

    _.each(fields, function(f){
      if (f._id && f._id.length < 24){
        // If it's some arbitrary internal ID we assigned, not a node ObjectID, delete it before pushing
        delete f._id;
      }
      if (f.type && f.type==="file"){
        delete f.binaryContentType;
        delete f.binaryFileName;
        delete f.binaryHash;
        delete f.binaryContentType;
        delete f.fieldEl;
        delete f.value;
        delete f.needsUpload;
      }
      // Cater field lists by recursing - should only happen once..
      if (f.fields){
        f.fields = self.trimInternalIds(f.fields);
      }
      if (f.data){
        _.each(f.data, function(row){
          for (var key in row){
            if (row.hasOwnProperty(key)){
              var d = row[key];
              if (typeof d === 'object'){
                delete d.fieldEl;
                delete d.needsUpload;
                delete d.listFieldsIndex;
                delete d.listFieldsName;
              }
            }
          }
        });
      }
    });

    return fields;
  },
  read : function(method, model, options){
    var inst = this.inst = $fw.data.get('inst');
    this.userApiKey = $fw.data.get("userapikey");
    this.guid = this.inst.guid;
    this.appkey = this.inst.apiKey;

    var self = this,
    url = this.urls.readSections,
    body = {};

    $fw.server.get(url, body, function(res) {
      self.loaded = true;
      if ($.isFunction(options.success) && res.hasOwnProperty('sections')) {
        options.success(res.sections, options);
      }
    }, options.error, true);
  },
  create : function(method, section, options){
    var inst = this.inst = $fw.data.get('inst');
    this.userApiKey = $fw.data.get("userapikey");
    this.guid = this.inst.guid;
    this.appkey = this.inst.apiKey;

    var self = this,

    url = this.urls.crupdateSection;
    section.modifiedBy = $fw.userProps.email;
    var parent = false;

    delete section.hash;
    delete section.data;
    delete section._id;

    // If it isn't a root level item, validate it's parent exists
    if (section.parent && section.parent!==""){
      parent = self.findWhere({ name : section.parent });
      if (!parent){
        return options.error("Could not find parent with name " + section.parent);
      }
      parent = parent.toJSON();
    }

    $.ajax({
      type: "POST",
      url: url, contentType : "application/json",
      data: JSON.stringify(section),
      "headers":{
        "x-fh-auth-app":self.appkey,
        "x-fh-auth-user":self.userApiKey
      }
    }) .done(function(res){

      if (parent){
        // We also need to update it's parent's "children" property
        parent.children.push(res._id);
        self.sync('draft', parent, {success : function(){
          return options.success(res);
        }, error : function(err){
          return options.success(err);
        }});
      }else{
        return options.success(res);
      }

    }).error(options.error);

  },
  del : function(method, model, options){
    var inst = this.inst = $fw.data.get('inst');
    this.userApiKey = $fw.data.get("userapikey");
    this.guid = this.inst.guid;
    this.appkey = this.inst.apiKey;
    var self = this;
    var body = ( model.toJSON ) ? model.toJSON() : model, // no hasOwnProperty here - want to see if prototype chain has method toJSON
    url = this.urls.crupdateSection + '/' + body._id;

    $.ajax({
      type: "DELETE",
      "headers":{
        "x-fh-auth-app":self.appkey,
        "x-fh-auth-user":self.userApiKey
      },
      url: url, contentType : "application/json"
    }) .done(options.success).error(options.error);
  },
  findSectionByPath : function(path){
    console.log("find section by path " + path);
    var model = this.findWhere({path : path });
    if (!model){
      return undefined;
    }
    return model.toJSON();
  },
  removeBySectionPath : function(path){
    var self = this;
    var section = self.findWhere({"path":path});

    for(var i=0; i < self.models.length; i++){
      var m = self.models[i];
      var children = m.get('children');

      if(children && Array.isArray(children) && children.length > 0){
        //console.log("model has children " , children);
        var hasRem =section.get("hash");
        var refIndex = children.indexOf(hasRem);
        if(refIndex != -1){
          //console.log("found child ref for hash "+hasRem+" removing index " + refIndex);
          children.splice(refIndex,1);
        }
      }
    }
    section.destroy();
    self.remove(section);
  },

  findSectionByHash : function(hash, sections, sep){
    console.log("looking for hash ", hash, "in sections ", sections);
    sections = sections || this.toJSON();
    for (var i=0; i<sections.length; i++){
      var section = sections[i];
      if (section.hash === hash){
        return sections[i];
      }
    }
    return undefined;
  },
  toHTMLOptions : function(sections, level, parentTrail){
    level = level+1 || 0;
    sections = sections || this.toJSON();
    parentTrail = parentTrail || "";
    var html = [],
    spacer = _.times(level, function(){ return "&nbsp;&nbsp;"; }).join('');

    for (var i=0; i<sections.length; i++){
      var section = sections[i],
      parentString = (parentTrail === "") ? section.name : parentTrail + "." + section.name;
      var id = section.path ? section.path.replace(/\s+/g,'').replace(/\.+/g,'') : "";
      var pathData = section.path;

      html.push('<option value="' + parentString + '" data-id="'+id+'"  data-path="'+pathData+'">' + spacer + section.name + '</option>');

    }
    return html;
  }
});