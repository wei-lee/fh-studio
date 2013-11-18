var App = App || {};
App.View = App.View || {};

App.View.FormFieldRules = App.View.Forms.extend({

  FIELD_RULES : {
    "date":["is on","is before","is after"],
    "select":["is","is not", "contains","does not contain","begins with","ends with"],
    "text":["is","is not","contains","does not contain","begins with","ends with"],
    "number":["is equal to","is greater than","is less than"],
    "textarea":["is","is not","contains","does not contain","begins with","ends with"],
    "checkbox":["is","is not"]
  },

  templates : {
    rulesTabs : '#formsRulesTab',
    addRule : '#fieldRuleTemplate'
  },

  events:{
    'click .createrule' : 'createRule'
  },

  initialize: function(options){
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
    this.collection = this.options.collection;
    this.fieldRules = this.options.form.get("fieldRules");
    this.pages = this.form.get("pages");



    this.$el.empty();
    this.$el.append(this.templates.$rulesTabs({"rulesHeading":"Show or hide fields based on these rules:"}));
    return this;
  },
  createRule : function (e){
    console.log("create rule");
    $('.rulesContent').append(this.templates.$addRule({"fields":[{
      "field":"test"
    }],"rules":this.FIELD_RULES}));
    return false;
  },

  aggreagateFields : function(){
    for(var i=0; i < this.pages.length; i++){

    }
  }

});
