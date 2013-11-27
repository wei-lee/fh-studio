var App = App || {};
App.View = App.View || {};

App.View.FormPageRules = App.View.Rules.extend({


  createRule : function (e){
    var self = this;
    var self = this;
    console.log("self pages ", self.pages);
    var pages = [];
    for(var i=0; i < self.pages.length; i++){
      var pn = i + 1;
      pages.push({"name":"page" + i +pn, "_id":self.pages.at(i).get("_id")});
    }
    var ruleCount =  self.$el.find('.rulesForm').length;
    ruleCount++;
    self.$el.find('.rulesContent').append(this.templates.$addRule({"fields":this.fields,"formType":"page","formId":self.form.get("_id"),ruleNum:ruleCount}));

    self.$el.find('#rule'+ruleCount+' .ruleDefintionContainer').append(this.templates.$ruleDefinitions({"fields":this.fields,"formType":"field","formId":self.form.get("_id"),ruleNum:ruleCount}));
    self.$el.find('#rule'+ruleCount+' .ruleResult').append(this.templates.$ruleResults({"fields":this.fields,"formType":"field","formId":self.form.get("_id"),ruleNum:ruleCount}));
    self.$el.find('select#targetField:visible').replaceWith(this.templates.$targetFieldSelect({"pages":pages}));
    self.delegateEvents();
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
    console.log("init form page rule view ",this.form, this.pages);
    this.aggreagateFields("page");
    this.aggreagateShowFields();

    _.bindAll(this);

  },

  render : function (){
    console.log("called render in pagerules");
    var self = this;
    $('.formsContainer').remove();
    this.$el.empty();
    this.$el.append(self.templates.$rulesTabs({"rulesHeading":"Show or hide pages based on these rules:"}));
    this.collection = new App.Collection.PageRules(this.pageRules);
    self.renderExistingRules(this.collection, "page",this.pages);

    return this;
  }

});
