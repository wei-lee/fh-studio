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
    url = this.urls.crupdateSection;

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
    //model.fields = [];

    $.ajax({
      type: "PUT",
      url: url, contentType : "application/json",
      data: JSON.stringify(model)
    }) .done(options.success).error(options.error);
  },
  /*
    Internally we use backbone CIDs to represent state until it reaches the SS.
    Since these are new fields according to the SS, we don't want to dispatch these
    fake internal IDs - it'll only trigger an update..
   */
  trimInternalIds : function(fields){
    for (var i=0; i<fields.length; i++){
      var f = fields[i];
      if (f._id.length < 24){
        // If it's some arbitrary internal ID we assigned, not a node ObjectID, delete it before pushing
        delete f._id;
      }
      // Cater field lists by recursing - should only happen once..
      if (f.fields){
        f.fields = this.trimInternalIds(f.fields);
      }
    }
    return fields;
  },
  read : function(method, model, options){
    //TODO These go in "read" - leave here for now so we post to a blank thingy
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
    var self = this,
    url = this.urls.crupdateSection;
    section.modifiedBy = $fw.userProps.email,
    parent = false;
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
      data: JSON.stringify(section)
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
    var body = ( model.toJSON ) ? model.toJSON() : model, // no hasOwnProperty here - want to see if prototype chain has method toJSON
    url = this.urls.crupdateSection + '/' + body._id;

    $.ajax({
      type: "DELETE",
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