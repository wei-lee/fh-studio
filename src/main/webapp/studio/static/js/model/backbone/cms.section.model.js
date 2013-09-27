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
  "addPathsAndChildren":function (sections){




    function correctPathAndChildren(section){

    }


  },
  findSectionByPath : function(path){
    console.log("findSectionByPath " + path);
    var section = true,
    sections = this.toJSON(),
    i;

    for(i=0; i < sections.length; i++){
      if(sections[i] && sections[i].path && path === sections[i].path){
        return sections[i];
      }
    }
  },

  removeBySectionPath : function(path){

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
      html.push('<option value="' + parentString + '">' + spacer + section.name + '</option>');
      if (section.sections && section.sections.length > 0){
        var children = this.toHTMLOptions(section.sections, level, parentString);
        html = html.concat(children);
      }
    }
    return html;
  }
});