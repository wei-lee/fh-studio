var App = App || {};
App.View = App.View || {};

App.View.FormFieldRules = App.View.Rules.extend({




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
    var fakeRule2 = new App.Model.FieldRule({
      "type":"hide",
      "sourceField" : "528a0a7eb40f178253000001",
      "targetField":"528a0a7fb40f178253000002",
      "restriction" : "is",
      "sourceValue" : "ten"
    });



    //************

    this.collection = this.options.collection;
    this.fieldRules = this.options.form.get("fieldRules");
    this.fieldRules.push(fakeRule);
    this.fieldRules.push(fakeRule2);
    this.pages = this.form.get("pages");


    this.aggreagateFields();


    console.log("called render pages ", self);

    $('.formsContainer').remove();
    this.$el.empty();
    this.$el.append(self.templates.$rulesTabs({"rulesHeading":"Show or hide fields based on these rules:"}));

    //RENDER EXISTING RULES

    self.renderExistingRules(this.fieldRules, "field");

    return this;
  },

  createRule : function (e){
    console.log("create rule");
    var self = this;
    self.$el.find('.rulesContent').append(this.templates.$addRule({"fields":this.fields}));
    var conditionalSel = self.$el.find('.rulesContent').find('#fieldConditionals');
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
    var rules = [];
    console.log("save rules");
    var self = this;
    this.$el.find('.rulesForm').each(function (idx, form){
       console.log("creating rule ", form);
      var form = $(form);
      var rule = new App.Model.FieldRule({
        "type":form.find('#targetAction option:selected').val(),
        "sourceField" : form.find('.sourceField option:selected').data("_id"),
        "targetField":form.find('.targetField option:selected').data("_id"),
        "restriction" : form.find('.fieldConditionals option:selected').val(),
        "sourceValue" : form.find('input[name="checkedValue"]').val(),
        "formId": self.form.get("_id")
      });
      self.collection.add(rule);
    });

    self.collection.sync("update",self.collection);
    console.log("saving rules ", rules);
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
