var App = App || {};
App.dispatch = _.extend({}, Backbone.Events);

App.dispatch.topics = {
   "CMS" :{
     "SECTION_DISCARD_DRAFT":"cms.section.discarddraft",
     "SECTION_SAVE_DRAFT":"cms.section.savedraft",
     "SECTION_PUBLISH":"cms.section.publish",
     "SECTION_DELETE":"cms.sectiondelete",
     "SECTION_DIRTIED":"cms.section.unsaved",
     "SECTION_CHANGE":"cms.sectionchange",
     "AUDIT":"cms.audit"
   }
};