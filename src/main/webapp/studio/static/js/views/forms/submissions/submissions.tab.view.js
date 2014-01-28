//$fw.getUserProp("roles");
var App = App || {};
App.View = App.View || {};

App.View.FormSubmissionsTabs = App.View.Forms.extend({
  events : {
    'click a#recentSubmissions':  'recentSubmissions',
    'click a#perFormSubmissions': 'perFormSubmissions',
    'click a#perAppSubmissions':  'perAppSubmissions',
    'submit .submissionExportForm':'onExportSubmission'
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
    this.$el.addClass('span10');
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
    this.$el.find('.submissions').prepend(this.templates.$submissionListExport());
    this.active = 'recent';
  },

  perFormSubmissions : function (e){
    console.log("PER FORM SUBMISSIONS ", this.options);
    var self = this;
    self.switchActive(e);

    if(this.submissions){
      this.submissions.remove();
    }

    var submissionsContainer = this.$el.find('.submissions');
    submissionsContainer.empty();//.append(this.submissions.render().$el);
    submissionsContainer.prepend(this.templates.$submissionListExport());
    this.$el.find('.btn-success').remove();
    submissionsContainer.append(self.templates.$formSelect({"forms":self.jsonForms}));
    var formSelect = this.$el.find('select.formSelect');
    formSelect.show();
    this.$el.find('.btn-add-submission').show();
    this.selectMessage = new App.View.FullPageMessageView({ message : 'Select a form from the options above.', button : false });
    submissionsContainer.append(this.selectMessage.render().$el);
    formSelect.unbind('change').on('change', function(e){
      console.log("val is " + $(this).val() );
      if("" === $(this).val()){
         return $('a#perFormSubmissions').trigger('click');
      }
      submissionsContainer.find('.emptyContainer').remove();
      var selectTarget = $(e.target);
      submissionsContainer.find('.submissionslist').remove();
      self.submissions = new App.View.SubmissionList({"forms":self.options.forms, "listType":"singleForm","formId":selectTarget.val()});
      submissionsContainer.append(self.submissions.render().$el);
    });
    this.active = 'perform';

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

      for(var i=0; i < data.length; i++){
        appnames.push({
          "id":data.at(i).get("id"),
          "title":data.at(i).get("title")
        });
      }
      var submissionsContainer = self.$el.find('.submissions');
      submissionsContainer.empty();//.append(this.submissions.render().$el);
      submissionsContainer.append(self.templates.$appSelect({"apps":appnames}));
      submissionsContainer.append(self.templates.$formSelect({"forms":self.jsonForms}));
      submissionsContainer.append(self.templates.$submissionListExport());
      self.$el.find('.btn-add-submission').show();
      this.selectMessage = new App.View.FullPageMessageView({ message : 'Select a form and an app from the options above.', button : false });
      submissionsContainer.append(this.selectMessage.render().$el);
      var formSelect = self.$el.find('select.formSelect');
      var appSelect = $('.appSelect');
      var formid;
      var appid;
      formSelect.unbind('change').on('change', function(e){
        submissionsContainer.find('.emptyContainer').remove();
        //check app select has a value else wait.
        var selectTarget = $(e.target);
        console.log("appselect val", appSelect.val());
        if(appSelect.val() === ""){
          console.log("appselect val empty");
          self.selectMessage = new App.View.FullPageMessageView({ message : 'now Select an app from the options above.', button : false });
          submissionsContainer.append(self.selectMessage.render().$el);
          return;
        }
        formid = selectTarget.val();
        submissionsContainer.find('.submissionslist').remove();
        self.submissions = new App.View.SubmissionList({"forms":self.options.forms, "listType":"singleForm","formId":selectTarget.val(),"appId":appid});
        submissionsContainer.append(self.submissions.render().$el);
      });
      appSelect.unbind("change").on("change", function (e){
        var val= $(e.target).val();
        appid =val;
        submissionsContainer.find('.emptyContainer').remove();
        if(formSelect.val() === ""){
          console.log("appselect val empty");
          self.selectMessage = new App.View.FullPageMessageView({ message : 'Now select a form from the options above.', button : false });
          submissionsContainer.append(self.selectMessage.render().$el);
          return;
        }

        submissionsContainer.find('.submissionslist').remove();
        self.submissions = new App.View.SubmissionList({"apps":appnames, "listType":"singleForm","appId":val,"formId":formid});
        submissionsContainer.append(self.submissions.render().$el);

      });

      self.trigger('perAppSubmissionsRendered'); // Used by view controller to tell when we're ready to select the relevant app ID in the dropdown form
    };

    ret.error = function (err){
        console.log("error ", err);
        App.View.Forms.prototype.message("failed to get forms", "warning");
    };

    formApps.fetch(ret);
    this.active = 'perapp';
  },

  switchActive : function (e){
    var ele = $(e.target);
    ele.parent('li').addClass("active");
    ele.parent('li').siblings('li').removeClass("active");

  },
  onExportSubmission : function(e){
    var req = {},
    form = this.$el.find('.submissionExportForm'),
    formId, app, submission;


    if (this.active === "recent"){
      submission = this.submissions.index;
      if (typeof submission === "undefined"){
        return this.modal('Please select a submission to export', 'Error');
      }
      submission = this.submissions.collection.at(submission);
      submission = submission.get('_id');
      req.submission = submission;

    }else if (this.active === "perapp" || this.active === "perform"){
      formId = this.$el.find('select.formSelect').val();
      if (formId && formId !== ""){
        form.find('input[name=formId]').val(formId);
      }
    }

    if (this.active === "perapp"){
      app = this.$el.find('select.appSelect').val();
      form.find('input[name=appId]').val(app);
    }

    // Validation to make sure we have enough info to do an export
    if (this.active === "perform" && (!formId || formId === "")){
      e.preventDefault();
      return this.modal('Please select a form to export', 'Error');
    }

    if (this.active === "perapp" && (!app || app === "")){
      e.preventDefault();
      return this.modal('Please select an app to export', 'Error');
    }

  }
});