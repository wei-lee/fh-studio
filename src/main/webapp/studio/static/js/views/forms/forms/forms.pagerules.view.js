var App = App || {};
App.View = App.View || {};

App.View.FormPageRules = App.View.Rules.extend({



  createRule : function (e){
    var self = this;
    self.$el.find('.rulesContent').append(this.templates.$addRule({"fields":this.fields,"formType":"page","formId":self.form.get("_id")}));
    $('.rulesFieldName').unbind().change(this.onFieldSelectChange);
    $('.btn-add-rule').unbind().bind('click',function (){
      self.createRule.apply(self);
    });
    $('.btn-remove-rule').unbind().bind('click',self.removeRule);
    return false;
  },


  initialize: function(options){
    var self = this;
    this.constructor.__super__.initialize.apply(this, arguments);
    this.options = options;
    this.form = this.options.form;
    this.collection = this.options.collection;
    this.pageRules = this.options.form.get("pageRules");
    this.pages = this.form.get("pages");
    this.aggreagateFields();
  },

  render : function (){
    var self = this;
    $('.formsContainer').remove();
    this.$el.empty();
    this.$el.append(self.templates.$rulesTabs({"rulesHeading":"Show or hide pages based on these rules:"}));
    self.renderExistingRules(this.collection, "page");
    return this;
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
        if(this.PAGE_RULES[fieldType]){
          console.log("rules for this field type", this.PAGE_RULES[fieldType]);
          pageFields[p].rules = this.PAGE_RULES[fieldType];
          this.fields.push(pageFields[p]);
        }
      }
    }
  }

});
