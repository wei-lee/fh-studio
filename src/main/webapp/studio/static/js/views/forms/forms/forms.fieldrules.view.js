var App = App || {};
App.View = App.View || {};

App.View.FormFieldRules = App.View.Rules.extend({



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

    _.bindAll(this);


  },
  render : function(){
    console.log("called render in fieldrules");
    var self = this,
      fields;
    this.form = this.options.form;
    this.fieldRules = this.options.form.get("fieldRules");

    console.log("RENDERING FIELD RULES ", this.fieldRules);

    this.pages = this.form.get("pages");
    this.aggreagateFields();
    $('.formsContainer').remove();
    this.$el.empty();
    this.$el.append(self.templates.$rulesTabs({"rulesHeading":"Show or hide fields based on these rules:"}));
    this.collection = new App.Collection.FieldRules(this.fieldRules);
    self.renderExistingRules(this.collection, "field", this.collection);
    self.$el.find('.saverules').unbind('click').bind('click',function(){
      self.saveRules();
    });

    return this;
  },

  createRule : function (e){
    var self = this;
    var ruleCount =  self.$el.find('.rulesForm').length;
    ruleCount++;
    self.$el.find('.rulesContent').append(this.templates.$addRule({"fields":this.fields,"formType":"field","formId":self.form.get("_id"),ruleNum:ruleCount}));

    self.$el.find('#rule'+ruleCount+' .ruleDefintionContainer').append(this.templates.$ruleDefinitions({"fields":this.fields,"formType":"field","formId":self.form.get("_id"),ruleNum:ruleCount}));
    self.$el.find('#rule'+ruleCount+' .ruleResult').append(this.templates.$ruleResults({"fields":this.fields,"formType":"field","formId":self.form.get("_id"),ruleNum:ruleCount}));

    self.delegateEvents();
    return false;
  },


  createCondition : function (e){
    console.log("called createCondition");
    var self=this;
    var ruleCount =  self.$el.find('.rulesForm').length;
    var formId = $(e.target).data("rulenum");
    var form = self.$el.find('#rule'+formId);
    var container = form.parent('.formRuleContainer');
    var ruleid = form.data("ruleid");
    var condNum = container.find('.rulesFieldName').length;
    condNum++;
    container.find('.condition').show().append(this.templates.$addedRuleCondition());
    //if there are previous conditions set the select to the same value
    var conditionalSelects = container.find('select.conditional');
    var conditionalOpts = container.find('select.conditional option');
    var prevVal = conditionalSelects.first().val();

    conditionalOpts.each(function (){
      if($(this).val() === prevVal){
        $(this).attr("selected",true);
      }else{
        $(this).attr("selected",false);
      }
    });

    container.find('.conditioncontainer').last().append("<div style=\"margin-top:6px;\" class=\"ruleDefintionContainer\" id='cond"+condNum+"'>" + this.templates.$ruleDefinitions({"fields":this.fields,"formType":"field","formId":self.form.get("_id"),ruleNum:ruleCount,"condNum":condNum}) + " </div>");
    container.find('.btn-add-condition').hide();
    container.find('.btn-add-condition').last().show();
    container.find('.btn-add-rule').hide().first().show();
    container.find('.btn-remove-rule').hide().first().show();

    conditionalSelects.unbind('change').bind('change',function (){
      var val = $(this).val();
      conditionalOpts.each(function (){
        if($(this).val() === val){
          $(this).attr("selected",true);
        }else{
          $(this).attr("selected",false);
        }
      });
    });
    self.delegateEvents();

  },

//  removeCondition : function (e){
//
//    var condId = $(e.target).data("conditionnum");
//    console.log("remove condition" , condId );
//
//    var container = this.$el.find('#cond'+condId).parent('.conditioncontainer');
//    var ruleContainer = container.parent().prev('.ruleDefintionContainer');
//    console.log("rule container ", ruleContainer);
//    ruleContainer.find('.btn-add-condition').last().show();
//    container.remove();
//    this.delegateEvents();
//  },

  selectConditionalChange : function (e){
    console.log("select cond change");
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
        var fieldType = pageFields[p].type.trim();
        if(this.FIELD_RULES[fieldType]){
          console.log("rules for this field type", this.FIELD_RULES[fieldType]);
          pageFields[p].rules = this.FIELD_RULES[fieldType];
          this.fields.push(pageFields[p]);
        }
      }
    }
  }

});
