var App = App || {};
App.View = App.View || {};

App.View.Rules = App.View.Forms.extend({

  FIELD_RULES : {
    "date":["is on","is before","is after"],
    "select":["is","is not", "contains","does not contain","begins with","ends with"],
    "text":["is","is not","contains","does not contain","begins with","ends with"],
    "email":["is","is not","contains","does not contain","begins with","ends with"],
    "number":["is equal to","is greater than","is less than"],
    "textarea":["is","is not","contains","does not contain","begins with","ends with"],
    "checkbox":["is","is not"]
  },

  PAGE_RULES  : {

  },

  templates : {
    rulesTabs : '#formsRulesTab',
    addRule : '#fieldRuleTemplate'
  }


});
