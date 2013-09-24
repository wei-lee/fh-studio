var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};

App.Model.CmsSection = Backbone.Model.extend({
});

App.Collection.CmsSection = Backbone.Collection.extend({
  initialize: function() {},
  model: App.Model.CmsSection,
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
  findSectionByHash : function(hash, sections){
    sections = sections || this.toJSON();
    for (var i=0; i<sections.length; i++){
      var section = sections[i];
      if (section.hash === hash){
        return section;
      }
      if (section.sections && section.sections.length > 0){
        return this.findSectionByHash(hash, section.sections || []);
      }
    }
    return undefined;
  }
});