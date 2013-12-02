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
    'appSelect':'#appSelect'
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

    var submissionsContainer = this.$el.find('.submissions');
    submissionsContainer.empty();//.append(this.submissions.render().$el);
    submissionsContainer.prepend(this.templates.$submissionListExport({"forms":this.jsonForms}));
    this.$el.find('.btn-success').remove();
    var formSelect = this.$el.find('select.formSelect');
    formSelect.show();
    this.$el.find('.btn-add-submission').show();

    formSelect.unbind("change").on('change', function(e){
      var selectTarget = $(e.target);
//      //get apps for form and show apps dropdown
      submissionsContainer.find('.submissionslist').empty();
      var appsUsingFormColl = new App.Collection.AppsUsingThisForm({"id":selectTarget.val()});
//
      appsUsingFormColl.fetch({"success": function (res){

        var appnames = [];
        if(res && res[0] && "ok" == res[0].status){
          for(var i=0; i < res.length; i++){
              appnames.push({
                "title":res[i].inst.title,
                "id":res[i].inst.guid
              });
          }
          console.log("setting up appinfo",appnames);
          submissionsContainer.append(self.templates.$appSelect({"apps":appnames}));
          var appSelect = $('.appSelect').unbind("change").on("change", function (e){
            var val= $(e.target).val();
            submissionsContainer.find('.submissionslist').empty();
            console.log("appid ", val);
            self.submissions = new App.View.SubmissionList({"apps":appnames, "listType":"singleForm","formId":selectTarget.val(),"appId":val});
            submissionsContainer.append(self.submissions.render().$el);
          });
        }
      },
      "error":function (err){
        console.log("error apps using form ", err);
      }});
    });
  },

  switchActive : function (e){
    var ele = $(e.target);
    ele.parent('li').addClass("active");
    ele.parent('li').siblings('li').removeClass("active");

  }



});