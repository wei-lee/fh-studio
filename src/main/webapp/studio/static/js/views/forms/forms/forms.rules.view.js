var App = App || {};
App.View = App.View || {};

App.View.Rules = App.View.Forms.extend({

  FIELD_RULES : {
    "date":["is on","is before","is after"],
    "select":["is","is not", "contains","does not contain","begins with","ends with"],
    "text":["is","is not","contains","does not contain","begins with","ends with"],
    "emailAddress":["is","is not","contains","does not contain","begins with","ends with"],
    "number":["is equal to","is greater than","is less than"],
    "textarea":["is","is not","contains","does not contain","begins with","ends with"],
    "checkbox":["is","is not"]
  },
  //todo all the rules seem to be the same in wufoo so just have one set of rules?
  PAGE_RULES  : {
    "date":["is on","is before","is after"],
    "select":["is","is not", "contains","does not contain","begins with","ends with"],
    "text":["is","is not","contains","does not contain","begins with","ends with"],
    "emailAddress":["is","is not","contains","does not contain","begins with","ends with"],
    "number":["is equal to","is greater than","is less than"],
    "textarea":["is","is not","contains","does not contain","begins with","ends with"],
    "checkbox":["is","is not"]
  },

  templates : {
    rulesTabs : '#formsRulesTab',
    addRule : '#fieldRuleTemplate',
    pageRule : '#pageRuleTemplate'
  },

  events:{
    'click .createrule' : 'createRule',
    'click .saverules' : 'saveRules',
    'click a#fieldRules' : 'fieldRulesTab',
    'click a#pageRules' : 'pageRulesTab'
  },


  fieldRulesTab : function (){
    console.log("fieldRulesTab click");
    var self = this;
    var editFormRules = new App.View.FormFieldRules({ form : self.form, $pagesMenuEl : self.options.$pagesMenuEl });
    //this.editForm.bind('back', $.proxy(this.back, this));
    self.$el.append(editFormRules.render().$el);
    self.$el.find('a#fieldRules').parent('li').addClass("active");
    self.$el.find('a#pageRules').parent('li').removeClass("active");

  },

  pageRulesTab : function (){
    var self = this;
    var editPageRules = new App.View.FormPageRules({form:self.form,$pagesMenuEl:self.options.$pagesMenuEl});
    self.$el.append(editPageRules.render().$el);
    self.$el.find('a#fieldRules').parent('li').removeClass("active");
    self.$el.find('a#pageRules').parent('li').addClass("active");
  },


  saveRules : function (){

    var rules = [];
    console.log("save rules");
    var self = this;

    console.log("the collection of rules ", self.collection);

    //go through each visible rule and build a new model for each need to check for existing rules and update them
    this.$el.find('.rulesForm:visible').each(function (idx, form){
      var form = $(form);
      console.log("RULE ID ", form.data("ruleid"));
      var existingRule = self.collection.findWhere({"_id":form.data("ruleid")});
      var data ={
        "type":form.find('#targetAction option:selected').val(),
        "sourceField" : form.find('.sourceField option:selected').data("_id"),
        "restriction" : form.find('.fieldConditionals option:selected').val(),
        "sourceValue" : form.find('input[name="checkedValue"]').val(),
        "formId": self.form.get("_id")
      };
      if("field" == form.data("type")){
        data["targetField"] =  form.find('.targetField option:selected').data("_id");
      }else if("page" == form.data("type")){
        data["targetPage"] =  form.find('.targetField option:selected').data("_id");
      }

      if(existingRule){
       console.log("updating existing rule ", existingRule);
       existingRule.set("type",data.type);
       existingRule.set("sourceField",data.sourceField);
       existingRule.set("restriction",data.restriction);
       existingRule.set("sourceValue",data.sourceValue);
      }else{
        var rule = new App.Model.FieldRule(data);
        self.collection.add(rule);
      }
    });

    self.collection.sync("update",{"rules":self.collection,"formid":self.form.get("_id")},{"success":function (){
      console.log("called back to success function");
      App.View.Forms.prototype.message('updated rules successfully');
    }});
    console.log("saving rules ", self.collection);
  },


  findField : function (id){
    for(var i=0; i < this.fields.length; i++){
      var f = this.fields[i];
      console.log("looking at ", f, id);
      if(f._id === id) return f;
    }
  },


  onFieldSelectChange : function (e){
    var self = this;
    var type = $(this).find('option').filter(':selected').data("type").trim();
    var rulesSelect = $(this).next('select');
    rulesSelect.empty();
    var conditionals = App.View.Forms.CONSTANTS.FIELD_RULES[type];
    if(! conditionals){

    }else{
      var html = "";
      for(var i = 0; i < conditionals.length; i++){
        html+="<option>"+conditionals[i]+"</option>";
      }
      console.log("html ", html);
      rulesSelect.append(html);
    }
  },

  renderExistingRules : function (rules, type){
    console.log("render existing")
    if(! rules  || ! type){
      console.log("no rules passed");
      return;
    }

    var self = this;
    self.$el.find('.rulesContent').empty();
    var target = ("field" === type) ? "targetField" : "targetPage";
    rules = rules.toJSON();
    var pages = self.pages.toJSON();

    console.log("render existing rules ", rules, pages);

    if(rules && rules.length > 0){
      for(var r=0; r < rules.length; r++){
        var fr = rules[r];
        console.log("Field Rule ", fr);
        var sf = self.findField(fr.sourceField);
        //all fields and the rule
        //jsonRules.push(fr);
        if("field" ==  type){
          self.$el.find('.rulesContent').append(this.templates.$addRule({"fields":this.fields,"conditions":App.View.Forms.CONSTANTS.FIELD_RULES[sf.type],"formType":type,"formId":self.form.get("_id"),"ruleId":fr["_id"]}));
        }else{
          self.$el.find('.rulesContent').append(this.templates.$pageRule({"fields":this.fields,"conditions":App.View.Forms.CONSTANTS.FIELD_RULES[sf.type],"formType":type,"formId":self.form.get("_id"),"ruleId":fr["_id"]}));
        }
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
