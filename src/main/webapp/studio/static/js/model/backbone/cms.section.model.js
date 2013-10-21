var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.CmsSection = Backbone.Model.extend({
});

App.Model.CmsSection.CONST = {
  "CHILDREN" : "children"
};

App.Collection.CMS = Backbone.Collection.extend({
  initialize: function(models, options) {
    var url = options.url,
    key;
    this.urls = {
      readSections : '/mbaas/cms/sections',
      crupdateSection : '/mbaas/cms/section',
      field : '/mbaas/cms/section/field',
      fieldlist: '/mbaas/cms/section/list/field/'
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
    this.sync('delete', model, options);
    this.trigger('reset');
  },
  sync: function (method, model, options) {
    var self = this;

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
        //TODO
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
    fieldsToCreate, fieldsToUpdate;

    $fw.server.put(url, model, options.success, options.error, true);
    // TODO: Confirm & delete following code
//    async.series({
//      createFields : function(cb){
//        // 1. Find all fields that need to be added
//        fieldsToCreate = _.where(model.fields, { needsCreate : true } );
//        self.bulkUpdate({fields : fieldsToCreate, url : self.urls.mock, method : 'POST'}, cb);
//      },
//      updateFields : function(cb){
//        // 2. Find all fields that need to be updated
//        fieldsToUpdate = _.where(model.fields, { needsUpdate : true } );
//        self.bulkUpdate({fields : fieldsToUpdate, url : self.urls.mock, method : 'PUT'}, cb);
//      },
//      deleteFields : function(cb){
//        // 3. Find all fields that have been removed
//        if (model.hasOwnProperty('fieldsToDelete') && model.fieldsToDelete.length > 0){
//          self.bulkUpdate({fields : model.fieldsToDelete, url : self.urls.mock, method : 'DELETE'}, function(err, res){
//            delete model.fieldsToDelete;
//            cb(err, res);
//          });
//        }else{
//          // return success
//          return cb(null, true);
//        }
//      },
//      updateSection : function(cb){
//        // 4. Call setSection with any changes to field values(?), and section title, publish date or parent
//        $fw.server.put(this.urls.self.urls.mock, model, function(res) {
//          return cb(null, res);
//        }, function(err){
//          return cb(err);
//        }, true);
//      }
//    }, function(err, res){
//      // Finally - done with all requests needed for a save draft
//      if (err){
//        if ($.isFunction(options.success)) {
//          return options.error(err);
//        }
//        return err;
//      }
//
//      if ($.isFunction(options.success)) {
//        options.success(res);
//      }
//    });

  },
  read : function(method, model, options){
    //TODO These go in "read" - leave here for now so we post to a blank thingy
    var self = this,
    url = this.urls.mock,
    body = {};

    $fw.server.get(url, body, function(res) {
      self.loaded = true;
      if ($.isFunction(options.success) && res.hasOwnProperty('sections')) {
        options.success(res.sections, options);
      }
    }, options.error, true);
  },
  create : function(method, section, options){
    var url = this.urls.crupdateSection,
    body = { //TODO: Fill these in
      "name": section.name,
      "parent": "", // TODO: ??
      "path":section.path,
      "modifiedBy": "test@example.com" // TODO: ??
    };
    $fw.server.put(url, body, options.success, options.error, true);
  },
  bulkUpdate : function(opts, cb){
    //TODO: Confirm & Delete - no longer used
    var workers = [],
    asyncMethod = (opts.series === true) ? 'series' : 'parallel',
    httpMethod = opts.method.toLowerCase() || 'post';
    httpMethod = (httpMethod === 'delete') ? 'del' : httpMethod; // delete is reserved keyword - filter this out

    _.each(opts.fields, function(field){
      delete field.needsUpdate;
      delete field.needsCreate;
      workers.push(function(cb){
        $fw.server[httpMethod](opts.url, field, function(res) {
          cb(null, res);
        }, function(err){
          cb(err, null);
        }, true);
      });
    });
    async[asyncMethod](workers, cb);
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
    var childrenKey = App.Model.CmsSection.CONST.CHILDREN;
    var section = self.findWhere({"path":path});

    for(var i=0; i < self.models.length; i++){
      var m = self.models[i];
      var children = m.get(childrenKey);

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