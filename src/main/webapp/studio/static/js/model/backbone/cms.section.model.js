var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.CmsSection = Backbone.Model.extend({
  "setSectionName" : function (name){
    name = name.replace(/\./,"");
    this.name = name;
    return this.name;
  }
});

App.Model.CmsSection.CONST = {
  "CHILDREN" : "children"
};

App.Collection.CmsSection = Backbone.Collection.extend({
  initialize: function() {},
  model: App.Model.CmsSection,
  //todo change this to use property instead
  url: '/studio/static/js/model/backbone/mocks/cms_sections.json',
  sync: function (method, model, options) {
    var self = this;
    var url = self.url;
    $fw.server.post(url, {}, function(res) {
      if (res && res.sections && res.sections.length>0) {
        self.loaded = true;
        //self.addPathsAndParents(res.sections);
        if ($.isFunction(options.success)) {
          options.success(res.sections, options);
        }
      } else {
        if ($.isFunction(options.error)) {
          options.error(res.sections, options);
        }
      }
    }, options.error, true);
  },
  findSectionByPath : function(path){
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
      var id = section.path.replace(/\s+/g,'').replace(/\.+/g,'');
      var pathData = section.path.replace(/\s+/g,'');

      html.push('<option value="' + parentString + '" data-id="'+id+'"  data-path="'+pathData+'">' + spacer + section.name + '</option>');

    }
    return html;
  }
});