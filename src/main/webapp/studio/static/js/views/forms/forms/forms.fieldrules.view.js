var App = App || {};
App.View = App.View || {};

App.View.FormFieldRules = App.View.Rules.extend({



  fields : [],

  initialize: function(options){

    App.View.Forms.CONSTANTS = App.View.Forms.CONSTANTS || {};
    App.View.Forms.CONSTANTS["FIELD_RULES"] = this.FIELD_RULES;

    this.constructor.__super__.initialize.apply(this, arguments);
    this.options = options;

    _.bindAll(this);

  },
  render : function(){
    var self = this,
      fields;
    this.form = this.options.form;
    this.fieldRules = this.options.form.get("fieldRules");
    this.pages = this.form.get("pages");
    this.aggreagateFields("fields");
    this.aggreagateShowFields();
    $('.formsContainer').remove();
    this.$el.empty();
    this.$el.append(self.templates.$rulesTabs({"rulesHeading":"Show or hide fields based on these rules:"}));
    this.collection = new App.Collection.FieldRules(this.fieldRules);
    self.renderExistingRules(this.collection, "field", this.collection);
    return this;
  },

  createRule : function (e){
    var self = this;
    var ruleCount =  self.$el.find('.rulesForm').length;
    ruleCount++;
    self.$el.find('.rulesContent').append(this.templates.$addRule({"fields":this.fields,"formType":"field","formId":self.form.get("_id"),ruleNum:ruleCount}));

    self.$el.find('#rule'+ruleCount+' .ruleDefintionContainer').append(this.templates.$ruleDefinitions({"fields":this.fields,"formType":"field","formId":self.form.get("_id"),ruleNum:ruleCount}));
    self.$el.find('#rule'+ruleCount+' .ruleResult').append(this.templates.$ruleResults({"fields":this.targetFields,"formType":"field","formId":self.form.get("_id"),ruleNum:ruleCount}));

    self.delegateEvents();
    return false;
  }

});
