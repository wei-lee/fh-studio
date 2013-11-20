var App = App || {};
App.View = App.View || {};

App.View.FormFieldRules = App.View.Forms.extend({

  FIELD_RULES : {
    "date":["is on","is before","is after"],
    "select":["is","is not", "contains","does not contain","begins with","ends with"],
    "text":["is","is not","contains","does not contain","begins with","ends with"],
    "email":["is","is not","contains","does not contain","begins with","ends with"],
    "number":["is equal to","is greater than","is less than"],
    "textarea":["is","is not","contains","does not contain","begins with","ends with"],
    "checkbox":["is","is not"]
  },

//  "type": {type: String, required: true, enum: ["show", "hide"]},
//  "sourceField": { type: Schema.Types.ObjectId, ref: MODELNAMES.FIELD, required: true},
//  "restriction": {type: String, required: true, enum: ["is", "isNot", "contains", "doesNotContain", "beginsWith", "endsWith","is equal to","is greater than","is less than"]},
//  "sourceValue": {type: String, required: true},
//  "targetField": { type: Schema.Types.ObjectId, ref: MODELNAMES.FIELD, required: true }

  templates : {
    rulesTabs : '#formsRulesTab',
    addRule : '#fieldRuleTemplate'
  },

  events:{
    'click .createrule' : 'createRule',
    'click .saverules' : 'saveRules'
  },

  fields : [],

  initialize: function(options){
    App.View.Forms.CONSTANTS = App.View.Forms.CONSTANTS || {};
    App.View.Forms.CONSTANTS["FIELD_RULES"] = this.FIELD_RULES;

    Handlebars.registerHelper('addFieldRule', function (context,options){
      var html = "<option>";
      console.log("context", context , " " , options);
      html+="</option>";
      return html;
    });

    this.constructor.__super__.initialize.apply(this, arguments);
    this.options = options;
  },
  render : function(){
    var self = this,
      fields;
    this.form = this.options.form;
    console.log("FORM DEF ", this.form);
    //********** for testing only

    var fakeRule = new App.Model.FieldRule({
      "type":"show",
      "sourceField" : "528a0a7eb40f178253000001",
      "targetField":"528a0a7fb40f178253000002",
      "restriction" : "is not",
      "sourceValue" : "ten"
    });



    //************

    this.collection = this.options.collection;
    this.fieldRules = this.options.form.get("fieldRules");
    this.fieldRules.push(fakeRule);
    this.pages = this.form.get("pages");


    this.aggreagateFields();


    console.log("called render pages ", this.fieldRules);

    $('.formsContainer').remove();
    this.$el.empty();
    this.$el.append(this.templates.$rulesTabs({"rulesHeading":"Show or hide fields based on these rules:"}));

    var jsonRules = [];

    if(this.fieldRules && this.fieldRules.length > 0){
      for(var fr=0; fr < this.fieldRules.length; fr++){
        var fr = this.fieldRules[fr].toJSON();
        console.log("Field Rule ", fr);
        var sf = self.findField(fr.sourceField);
        var tf = self.findField(fr.targetField);
        console.log("found fields ", sf, tf);
        jsonRules.push(fr);
      }
    }
    console.log("jsonrules ", jsonRules);
    $('.rulesContent').append(this.templates.$addRule({"fields":jsonRules}));


    return this;
  },


  findField : function (id){
    for(var i=0; i < this.fields.length; i++){
      var f = this.fields[i];
      console.log("looking at ", f, id);
      if(f._id === id) return f;
    }
  },

  createRule : function (e){
    console.log("create rule");
    var self = this;
    $('.rulesContent').append(this.templates.$addRule({"fields":this.fields}));
    var conditionalSel = $('.rulesForm').find('#fieldConditionals');
    $('.rulesFieldName').unbind().change(this.onFieldSelectChange);
    $('.btn-add-rule').unbind().bind('click',function (){
      self.createRule.apply(self);
    });
    $('.btn-remove-rule').unbind().bind('click',self.removeRule);

    return false;
  },

  removeRule : function (e){
    $(this).parent('.rulesForm').remove();
  },

  onFieldSelectChange : function (e){
    var self = this;
    var type = $(this).find('option').filter(':selected').data("type").trim();
    var rulesSelect = $(this).next('select');
    rulesSelect.empty();

    console.log("changed select field val ", type, "rules select ", rulesSelect);
    var conditionals = App.View.Forms.CONSTANTS.FIELD_RULES[type];
    console.log("conditionals",conditionals);
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

  saveRules : function (){
    console.log("save rules");
  },

  aggreagateFields : function(){
    this.fields = [{
      "name":"select a field",
      "type" :""
    }];
    console.log("pages ", this.pages);
    for(var i=0; i < this.pages.length; i++){
       var page = this.pages.models[i];
      console.log("page ", page);
      var pageFields = page.get("fields");
      for(var p=0; p < pageFields.length; p++){
        var fieldType = pageFields[p].type.trim().toLowerCase();
        if(this.FIELD_RULES[fieldType]){
          console.log("rules for this field type", this.FIELD_RULES[fieldType]);
          pageFields[p].rules = this.FIELD_RULES[fieldType];
          this.fields.push(pageFields[p]);
        }
      }


    }
    console.log("fields == ", this.fields);
  }

});
