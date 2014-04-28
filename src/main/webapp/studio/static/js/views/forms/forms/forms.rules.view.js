var App = App || {};
App.View = App.View || {};

App.View.Rules = App.View.Forms.extend({
  targets : {
    "targetField":[],
    "targetPage":[]
  },

  "EXCLUDED_FIELD_TYPES" : ["checkboxes"],

  templates: {
    rulesTabs: '#formsRulesTab',
    addRule: '#fieldRuleTemplate',
    ruleResults: "#ruleResult",
    ruleDefinitions: '#ruleDefinitions',
    addedRuleCondition: '#addedRuleCondition',
    targetFieldSelect: '#targetPage'

  },

  events: {
    'click .createrule': 'createRule',
    'click .btn-add-condition': 'createCondition',
    'click .btn-remove-condition': 'removeCondition',
    'click .btn-remove-rule': 'removeRule',
    'click .btn-add-rule': 'createRule',
    'change .rulesFieldName': 'onFieldSelectChange',
    'change select.conditional': 'selectConditionalChange',
    'click .saverules' : 'saveRules',
    'change #targetField' : 'checkTarget'
  },

  checkTarget : function (e){
    var self = this;
    var checked = [];
    self.$el.find('select#targetField:visible').each(function (){
      var val = $(this).val();
      if(checked.indexOf(val) != -1){
        console.log("duplicate target found");
        App.View.Forms.prototype.message('Warning duplicate target for ' + val + ' found.' );
        $(this).closest('.rulesForm').find('.icon-warning-sign').show();
      }else{
        checked.push(val);
        $(this).closest('.rulesForm').find('.icon-warning-sign').hide();
      }
    });
  },

  aggreagateShowFields : function (){
    this.targetFields = [{
      "name":"select a field",
      "type" :""
    }];
    for(var i=0; i < this.pages.length; i++){
      var page = this.pages.models[i];

      var pageFields = page.get("fields");
      for(var p=0; p < pageFields.length; p++){
        var fieldType = pageFields[p].type.trim();
        this.targetFields.push(pageFields[p]);
      }
    }
  },

  removeRule: function (e) {
    var self = this;
    this.$el.find('.btn-small').tooltip('hide');
    this.$el.find('.btn-large').tooltip('hide');
    var ruleNumber = $(e.target).data("rulenum");
    var form = self.$el.find('#rule' + ruleNumber);
    var container = form.parent('.formRuleContainer');
    var ruleid = form.data("ruleid");
    console.log("looking for model with id ", ruleid, self.collection.models);
    container.remove();
    if (ruleid) {
      var model = self.collection.findWhere({"_id": ruleid});
      self.collection.remove(model, {
        "success": function () {

        },
        "error": function (er) {
          console.log("failed to remove from model ", er);
        }});
    }

    return false;
  },

  createCondition : function (e){
    var self=this;
    var ruleCount =  self.$el.find('.rulesForm:visible').length;
    var formId = $(e.target).data("rulenum");
    var form = self.$el.find('#rule'+formId);
    var container = form.parent('.formRuleContainer');
    var ruleid = form.data("ruleid");
    //data-conditionnum
    var condNum = $('.conditioncontainer').length;
    container.find('.condition').show().append(this.templates.$addedRuleCondition({"condNum":condNum}));
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
    console.log("this.fields ", this.fields);

    container.find('.conditioncontainer').last().append("<div style=\"margin-top:6px;\" class=\"ruleDefintionContainer\" id='cond"+condNum+"'>" + this.templates.$ruleDefinitions({"fields":this.fields,"formType":"field","formId":self.form.get("_id"),ruleNum:formId,"condNum":condNum}) + " </div>");
    container.find('.btn-add-condition').hide();
    container.find('.btn-remove-condition').first().hide();
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





  formatPages: function (toFormat) {
    var pages = [];
    for (var i = 0; i < toFormat.length; i++) {
      var pn = i + 1;
      pages.push({"name": "page" + i + pn, "_id": toFormat.at(i).get("_id")});
    }
    return pages;
  },

  saveRules: function () {

    var rules = [],
      errors = [];
    var self = this;
    var type = self.$el.find('.saverules').data("type");
    //go through each visible rule and build a new model for each need to check for existing rules and update them
    this.$el.find('.rule:visible').each(function (idx, form) {
      form = $(form);
      var type = form.data("type"), // either page or field..
        ruleId = form.data('ruleid'), // unpopulated for new rules
        target = ("field" === type) ? "targetField" : "targetPage",
        existingRule = self.collection.findWhere({"_id": ruleId}),

        data = {
          "type": form.find('select#targetAction option:selected').val(),
          "ruleConditionalOperator": form.find('select.conditional').val() || "and",
          "ruleConditionalStatements": []
        },
      // ID of the field which this rule is to apply to
        topLevelSourceField = form.find('select.rulesFieldName').first('.sourceField').find('option:selected').data("_id"),
      // condition, e.g. is, is not, greater than..
        topLevelCondition = form.find('select.fieldConditionals').find('option:selected').val(),
      // Value to check against in this field
        topLevelCheckedVal = form.find(':input[name="checkedValue"]').val();

      if( !topLevelCheckedVal || "" === topLevelCheckedVal ){
        return errors.push('Please enter a value for this rule to apply to');
      }

      data.ruleConditionalStatements.push({
        sourceField: topLevelSourceField,
        restriction: topLevelCondition,
        sourceValue: topLevelCheckedVal
      });


      form.find('div.conditioncontainer:visible').each(function () {
        var statement = {
          sourceField: $(this).find('.sourceField option:selected').data("_id"),
          restriction: $(this).find('select.fieldConditionals option:selected').val(),
          sourceValue: $(this).find(':input[name="checkedValue"]').val()
        };
        if((! statement.sourceField || "" === statement.sourceField) || (! statement.sourceValue || "" === statement.sourceValue)){
          $(this).css("border",'red dashed');
          return errors.push('Please ensure all values are filled in correctly');
        }else {
          data.ruleConditionalStatements.push(statement);
        }
      });

      var targetFieldOrPage = form.find('.targetField option:selected').data("_id");
      if (!targetFieldOrPage || targetFieldOrPage === ''){
        return errors.push('Error - please select a target field for this rule');
      }


      if ("field" == type) {
        data["targetField"] = targetFieldOrPage;
      } else if ("page" == form.data("type")) {
        data["targetPage"] = targetFieldOrPage;
      }

      if (existingRule) {
        existingRule.set("type", data.type);
        existingRule.set("ruleConditionalStatements", data.ruleConditionalStatements);
        existingRule.set("ruleConditionalOperator", data.ruleConditionalOperator);
        existingRule.set(target, data[target]);
      } else {
        var rule;
        if("field" == type){
          rule = new App.Model.FieldRule(data);
        }else if("page" == type){
          rule = new App.Model.PageRule(data);
        }
        self.collection.add(rule);
      }
    }); // ends foreach on this div element

    if (errors.length > 0){
      return this.message(errors.join('\n<br />'), 'danger');
    }

    var rulesModel = new Backbone.Model({"rules": self.collection, "formId": self.form.get("_id"),"type":type});
    self.collection.sync("update", rulesModel, {"success": function (data) {

      if("field" == type){
        self.options.form.set("fieldRules", data);
      }else if("page" == type){
        self.options.form.set("pageRules", data);
      }
      self.collection.reset(data, {silent:true});
      App.View.Forms.prototype.message('Updated rules successfully');
      self.render();

    }
      ,"error":function (data){
        App.View.Forms.prototype.message('Failed to update rules');
      }});
  },

  onFieldSelectChange: function (e) {
    var self = this;
    var type = $(e.target).find('option').filter(':selected').data("type").trim();
    var rulesSelect = $(e.target).next('select');
    rulesSelect.empty();
    var conditionals = this.CONSTANTS.FIELD_RULES[type];
    if (!conditionals) {

    } else {
      var html = "";
      for (var i = 0; i < conditionals.length; i++) {
        html += "<option value='" + conditionals[i] + "'>" + conditionals[i] + "</option>";
      }
      rulesSelect.append(html);
    }
  },

  removeCondition: function (e) {

    this.$el.find('.btn-small').tooltip('hide');
    this.$el.find('.btn-large').tooltip('hide');
    var condId = $(e.target).data("conditionnum");
    var container = this.$el.find('.conditioncontainer#' + condId);
    var ruleContainer = container.parent().prev('.ruleDefintionContainer');
    ruleContainer.find('.btn-add-condition').last().show();
    container.remove();
    this.delegateEvents();

  },


  renderExistingRules: function (rules, type, pages) {

    if (!rules || !type) {
      console.log("no rules passed");
      return;
    }

    var self = this;
    self.$el.find('.rulesContent').empty();

    var target = ("field" === type) ? "targetField" : "targetPage";

    rules = rules.toJSON();

    pages = self.formatPages(pages);

    self.ruleCount = self.$el.find('.rulesForm:visible').length;
    self.ruleCount = ( self.ruleCount === 0 ) ? 1 : self.ruleCount; // RuleCount index starts at 1, not zero

    function setTargetField(rule) {
      var rFieldName = self.$el.find('select.rulesFieldName').last('.sourceField');
      rFieldName.find('option[data-_id="' + rule.sourceField + '"]').attr("selected", true);
      rFieldName.trigger("change");
    }

    function setFieldConditional(rule) {
      self.$el.find('select.fieldConditionals').last().find('option').each(function () {
        if ($(this).val() == rule.restriction) {
          $(this).attr("selected", true);
        } else {
          $(this).attr("selected", false);
        }
      });
    }

    function setValue(rule) {
      self.$el.find(':input[name="checkedValue"]').last().val(rule.sourceValue);
    }
    if (rules && rules.length > 0) {

      //each rule now has  ruleConditionalStatements and a ruleConditionalOperator the first ruleConditionalStatement is the top level then any after that are sub rules.
      for (var r = 0; r < rules.length; r++) {

        var rule = rules[r];
        var fr = rules[r].ruleConditionalStatements;
        var isFieldRule = this.options.active === 'field';
        //recreate rule;
        self.$el.find('.rulesContent').last().append(this.templates.$addRule({"fields": this.fields, "formType": type, "formId": self.form.get("_id"), ruleNum: self.ruleCount, ruleId: rule._id}));
        self.$el.find('#rule' + self.ruleCount + ' .ruleDefintionContainer').append(this.templates.$ruleDefinitions({"fields": this.fields, "formType": type, "formId": self.form.get("_id"), ruleNum: self.ruleCount}));
        self.$el.find('#rule' + self.ruleCount + ' .ruleResult').append(this.templates.$ruleResults({ "fieldRule": isFieldRule, "fields": this.targetFields, "formType": type, "formId": self.form.get("_id"), ruleNum: self.ruleCount}));

        // if its a page rule swap out the select type.
        if (type == "page") {
          self.$el.find('select#targetField').replaceWith(this.templates.$targetFieldSelect({"pages": pages}));
        }
        var firstRuleCondition = fr[0];

        setTargetField(firstRuleCondition);
        setFieldConditional(firstRuleCondition);
        setValue(firstRuleCondition);


        self.$el.find('select#targetAction option').each(function () {
          if ($(this).val() === rule.type) {
            $(this).attr("selected", true);
          } else {
            $(this).attr("selected", false);
          }
        });
        self.$el.find('form[data-ruleid="'+rule._id+'"] select#targetField option').each(function () {
          if ($(this).data("_id") == rule[target]) {
            $(this).attr("selected", true);
          } else {
            $(this).attr("selected", false);
          }
        });

        var condNum = 0;
        for (var k = 1; k < fr.length; k++) {
          var subCondition = fr[k];
          var form = self.$el.find('#rule' + self.ruleCount);
          var container = form.parent('.formRuleContainer');
          self.condNum = k;
          form.find('div.condition').show().append(this.templates.$addedRuleCondition({"condNum":k}));
          form.find('.conditioncontainer').last().append("<div style=\"margin-top:6px;\" class=\"ruleDefintionContainer\" id='cond" + k + "'>" + this.templates.$ruleDefinitions({"fields": this.fields, "formType": "field", "formId": self.form.get("_id"), ruleNum: self.ruleCount, "condNum": k}) + " </div>");
          setFieldConditional(subCondition);
          setTargetField(subCondition);
          setValue(subCondition);
        }

        self.$el.find('#rule'+self.ruleCount+'select.conditional option').each(function () {
          console.log("setting conditional " , $(this).val(), rule.ruleConditionalOperator);
          if ($(this).val() == rule.ruleConditionalOperator) {
            $(this).attr("selected", true);
          }else{
            $(this).attr('selected', false);
          }
        });
        self.ruleCount++;


      }


      self.$el.find('.rulesForm').each(function (){
        console.log("looking at visible rulesForm ", this);
        $(this).find('.btn-add-condition').hide().last().show();
        $(this).find('.btn-remove-condition').first().hide();
        $(this).find('.btn-add-rule').hide().first().show();
        $(this).find('.btn-remove-rule').hide().first().show();
      });


      self.delegateEvents();
    }
  },

  selectConditionalChange : function (e){
    var changedVal = $(e.target).val();
    this.$el.find('select.conditional:visible option').each(function (){
      if ($(this).val() == changedVal) {
        $(this).attr("selected", true);
      } else {
        $(this).attr("selected", false);
      }
    });
  }
});
