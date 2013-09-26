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

App.Collection.CmsSection = Backbone.Collection.extend({
  initialize: function() {},
  model: App.Model.CmsSection,
  //todo change this to use property instead
  url: '/studio/static/js/model/backbone/mocks/cms_flat_sections.json',
  sync: function (method, model, options) {
    var self = this;
    var url = self.url;
    $fw.server.post(url, {}, function(res) {
      if (res && res.sections && res.sections.length>0) {
        self.loaded = true;
        self.addPathsAndParents(res.sections);
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
  addPathsAndParents : function(sections, sep){
    sep = sep || "";
    for (var i=0; i<sections.length; i++){
      var section = sections[i],
      path = (sep === "") ? section.name : sep + "." + section.name;
      section.parent = sep; // Add in the section's parent in dot sep'd for convenience
      section.path = path;

      if (section.sections && section.sections.length > 0){
        sep = (sep === "") ? section.name : sep + "." + section.name;
        section.sections =  this.addPathsAndParents(section.sections, sep);
      }
    }
    return sections;
  },
  findSectionByPath : function(path){
    console.log("findSectionByPath " + path);
    var section = true,
    sections = this.toJSON(),
    i;

    if("root" == path) return sections[0];
    path = path.split(".");
    for (i=0; i<path.length && typeof section !== "undefined"; i++){
      section = _.findWhere(sections, {name : path[i]});
      sections = section.sections;
    }
    return section;
  },

  removeBySectionPath : function(path){

  },
  /*
    TODO: Deprecate - let's do this by path now
   */
  findSectionByHash : function(hash, sections, sep){
    console.log("looking for hash ", hash, "in sections ", sections);
    sections = sections || this.toJSON();
    sep = sep || "";
    for (var i=0; i<sections.length; i++){
      var section = sections[i];
      if (section.hash === hash){
        section.parent = sep; // Add in the section's parent in dot sep'd for convenience
        return sections[i];
      }
      if (section.sections && section.sections.length > 0){
        sep = (sep === "") ? section.name : sep + "." + section.name;
        return this.findSectionByHash(hash, section.sections || [], sep);
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
      html.push('<option value="' + parentString + '">' + spacer + section.name + '</option>');
      if (section.sections && section.sections.length > 0){
        var children = this.toHTMLOptions(section.sections, level, parentString);
        html = html.concat(children);
      }
    }
    return html;
  }
});