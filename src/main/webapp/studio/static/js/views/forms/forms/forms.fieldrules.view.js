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
  },
  render : function(){
    var self = this,
      fields;
    this.form = this.options.form;
    this.fieldRules = this.options.form.get("fieldRules");
    this.collection = new App.Collection.FieldRules(this.fieldRules);
    this.pages = this.form.get("pages");
    this.aggreagateFields();
    $('.formsContainer').remove();
    this.$el.empty();
    this.$el.append(self.templates.$rulesTabs({"rulesHeading":"Show or hide fields based on these rules:"}));
    self.renderExistingRules(this.collection, "field");

    return this;
  },

  createRule : function (e){
    var self = this;
    self.$el.find('.rulesContent').append(this.templates.$addRule({"fields":this.fields,"formType":"field","formId":self.form.get("_id")}));
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
