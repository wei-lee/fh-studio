var App = App || {};
App.View = App.View || {};

App.View.FormSubmissionsTabs = App.View.Forms.extend({
  events : {
    'click a#recentSubmissions':  'recentSubmissions',
    'click a#perFormSubmissions': 'perFormSubmissions',
    'click a#perAppSubmissions':  'perAppSubmissions'
  },

  templates : {
    'formsSubmissionsTab':'#formsSubmissionsTab'
  },

  initialize :  function (){
    this.constructor.__super__.initialize.apply(this, arguments);
    _.bindAll(this);
  },

  render : function (){
    var jsonForms = this.options.forms.toJSON();
    console.log("RENDER SUBMISSIONS TAB");
    this.$el.empty();
    this.$el.html(this.templates.$formsSubmissionsTab({forms:jsonForms}));
    this.recentSubmissions();

    return this;
  },

  recentSubmissions : function (e){
    console.log("RECENT SUBMISSIONS");
    var self = this;
   if(e) self.switchActive(e);

    if(this.submissions){
      this.submissions.remove();
    }
    this.submissions = new App.View.SubmissionList({"forms":this.options.forms});
    this.$el.find('.submissions').empty().append(this.submissions.render().$el);
  },

  perFormSubmissions : function (e){
    console.log("PER FORM SUBMISSIONS");
    var self = this;
    self.switchActive(e);

    if(this.submissions){
      this.submissions.remove();
    }
    this.submissions = new App.View.SubmissionList({"forms":this.options.forms, "listType":"singleForm"});
    this.$el.find('.submissions').empty().append(this.submissions.render().$el);

  },

  perAppSubmissions : function (e){
    var self = this;
    self.switchActive(e);
    console.log("perAppSubmissions");
    if(this.submissions){
      this.submissions.remove();
    }
    this.submissions = new App.View.SubmissionList({"forms":this.options.forms, "listType":"appAndForm"});
    this.$el.find('.submissions').empty().append(this.submissions.render().$el);

  },

  switchActive : function (e){
    var ele = $(e.target);
    ele.parent('li').addClass("active");
    ele.parent('li').siblings('li').removeClass("active");

  }



});