//$fw.getUserProp("roles");
var App = App || {};
App.View = App.View || {};

App.View.FormSubmissionsTabs = App.View.Forms.extend({
  events : {
    'click a#recentSubmissions':  'recentSubmissions',
    'click a#perFormSubmissions': 'perFormSubmissions',
    'click a#perAppSubmissions':  'perAppSubmissions'
  },

  templates : {
    'formsSubmissionsTab':'#formsSubmissionsTab',
    'submissionListExport':'#submissionListExport',
    'appSelect':'#appSelect',
    'formSelect':'#formSelect'
  },

  initialize :  function (){
    this.constructor.__super__.initialize.apply(this, arguments);
    _.bindAll(this);
  },

  render : function (){
    this.jsonForms = this.options.forms.toJSON();
    console.log("RENDER SUBMISSIONS TAB");
    this.$el.empty();
    this.$el.html(this.templates.$formsSubmissionsTab({forms:this.jsonForms}));
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

    var submissionsContainer = this.$el.find('.submissions');
    submissionsContainer.empty();//.append(this.submissions.render().$el);
    submissionsContainer.prepend(this.templates.$submissionListExport({"forms":this.jsonForms}));
    this.$el.find('.btn-success').remove();
    submissionsContainer.append(self.templates.$formSelect({"forms":self.jsonForms}));
    var formSelect = this.$el.find('select.formSelect');
    formSelect.show();
    this.$el.find('.btn-add-submission').show();
    formSelect.on('change', function(e){
      var selectTarget = $(e.target);
      submissionsContainer.find('.submissionslist').empty();
      self.submissions = new App.View.SubmissionList({"forms":this.options.forms, "listType":"singleForm","formId":selectTarget.val()});
      submissionsContainer.append(self.submissions.render().$el);
    });


  },

  perAppSubmissions : function (e){
    console.log("PER FORM SUBMISSIONS");
    var self = this;
    self.switchActive(e);

    if(this.submissions){
      this.submissions.remove();
    }


    var formApps =  new App.Collection.FormApps();

    console.log("got form apps ", formApps);

    var ret = {};

    ret.success = function (data){
      var appnames = [];
      console.log("data ret", data);
      for(var i=0; i < data.length; i++){
        appnames.push({
          "id":data[i].id,
          "title":data[i].title
        });
      }
      var submissionsContainer = self.$el.find('.submissions');
      submissionsContainer.empty();//.append(this.submissions.render().$el);
      submissionsContainer.append(self.templates.$appSelect({"apps":appnames}));
      submissionsContainer.append(self.templates.$formSelect({"forms":self.jsonForms}));
      var formSelect = self.$el.find('select.formSelect');
      var appSelect = $('.appSelect')
      var formid;
      var appid;
      formSelect.on('change', function(e){
        var selectTarget = $(e.target);
        formid = selectTarget.val();
        submissionsContainer.find('.submissionslist').empty();
        self.submissions = new App.View.SubmissionList({"forms":this.options.forms, "listType":"singleForm","formId":selectTarget.val(),"appId":appid});
        submissionsContainer.append(self.submissions.render().$el);
      });
      appSelect.unbind("change").on("change", function (e){
        var val= $(e.target).val();
        appid = val;
        submissionsContainer.find('.submissionslist').empty();
        self.submissions = new App.View.SubmissionList({"apps":appnames, "listType":"singleForm","appId":val,"formId":formid});
        submissionsContainer.append(self.submissions.render().$el);

      });
    };

    ret.error = function (err){

    };

    formApps.fetch(ret);
  },

  switchActive : function (e){
    var ele = $(e.target);
    ele.parent('li').addClass("active");
    ele.parent('li').siblings('li').removeClass("active");

  }



});