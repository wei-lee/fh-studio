var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};

App.Model.CmsSection = Backbone.Model.extend({
  "setSectionName" : function (name){
    name = name.replace(/\./,"");
    this.name = name;
  }
});

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
  findSectionByHash : function(hash, sections, sep){
    sections = sections || this.toJSON();
    sep = sep || "";
    for (var i=0; i<sections.length; i++){
      var section = sections[i];
      if (section.hash === hash){
        section.parent = sep; // Add in the section's parent in dot sep'd for convenience
        return section;
      }
      if (section.sections && section.sections.length > 0){
        sep = (sep === "") ? section.name : "." + section.name;
        return this.findSectionByHash(hash, section.sections || [], sep);
      }
    }
    return undefined;
  },

  findSectionByPath: function(path, sections){
    sections = sections || this.toJSON();
    for (var i=0; i<sections.length; i++){
      var section = sections[i];
      if (section.path === path){
        return section;
      }
    }
  },

  toHTMLOptions : function(sections, level, parentTrail){
    level = level+1 || 0;
    sections = sections || this.toJSON();
    parentTrail = parentTrail || "";
    var html = [],
    spacer = _.times(level, function(){ return "&nbsp;&nbsp;"; }).join('');

    for (var i=0; i<sections.length; i++){
      var section = sections[i];
      parentTrail = (parentTrail === "") ? section.name : parentTrail + "." + section.name;
      if (level === 0 ){
        // Reset the parent trail if we're at root
        parentTrail = "";
      }
      html.push('<option value="' + parentTrail + '">' + spacer + section.name + '</option>');
      if (section.sections && section.sections.length > 0){
        var children = this.toHTMLOptions(section.sections, level, parentTrail);
        html = html.concat(children);
      }
    }
    return html;
  }
});