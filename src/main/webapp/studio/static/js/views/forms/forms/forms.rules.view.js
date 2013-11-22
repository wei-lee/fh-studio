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
  },

  findField : function (id){
    for(var i=0; i < this.fields.length; i++){
      var f = this.fields[i];
      console.log("looking at ", f, id);
      if(f._id === id) return f;
    }
  },

  renderExistingRules : function (rules, type){
    if(! rules  || ! type){
      console.log("no rules passed");
      return;
    }
    var self = this;
    self.$el.find('.rulesContent').empty();
    var target = ("field" === type) ? "targetField" : "targetPage";

    if(rules && rules.length > 0){
      for(var r=0; r < rules.length; r++){
        var fr = rules[r].toJSON();
        console.log("Field Rule ", fr);
        var sf = self.findField(fr.sourceField);
        //all fields and the rule
        //jsonRules.push(fr);
        self.$el.find('.rulesContent').append(this.templates.$addRule({"fields":this.fields,"conditions":App.View.Forms.CONSTANTS.FIELD_RULES[sf.type]}));
        self.$el.find(".rulesFieldName option[data-_id='"+fr.sourceField+"']").last().attr("selected",true);
        self.$el.find("#targetField option[data-_id='"+fr[target]+"']").last().attr("selected",true);
        self.$el.find("#fieldConditionals option[value='"+fr.restriction+"']").last().attr("selected",true);
        self.$el.find("#targetAction options[value='"+fr.type+"']").last().attr("selected",true);
        self.$el.find("input[name='checkedValue']").last().val(fr.sourceValue);

      }
      self.$el.find('.btn-remove-rule').unbind().bind('click',self.removeRule);
      self.$el.find('.rulesFieldName').unbind().change(self.onFieldSelectChange);
    }
  }



});
