var App = App || {};
App.View = App.View || {};

App.View.SubmissionDetail = App.View.Forms.extend({

  templates : {
    "submissionEditActions":'#submissionEditActions',
    "submissionActions":'#submissionActions'
  },
  FILE_UPLOAD_URL : "/api/v2/forms/submission/file/", //note this is used here as we need to use the jquery fileupload plugin
  events : {
    'click .downloadfile' : "downloadFile",
    'click #editSubmission' : 'editSubmission',
    'click #cancelEdit' : 'cancelEdit'
  },

  initialize : function (){
    this.constructor.__super__.initialize.apply(this, arguments);
    var self = this;
    delete self.submission;
    if(self.options.submission){
      self.form = this.options.submission.get('formSubmittedAgainst');
      self.submission = self.options.submission.toJSON();
    }
  },
  editSubmission : function (e) {
    //make new edit submission view and render
    var self = this;
    self.editView = new App.View.SubmissionEdit({"preparedSubmission":self.viewData, "model":self.options.submission, "form":self.form, "el":self.$el});
    self.editView.render();
    //TODO: this would be better implemented with submissiondetail and submissionedit subclasses of a parent view with shared logic.
    //TODO: SubmissionEdit should be bound to a view by this.append(editView.render().$el), rather than passing this.$el and emptying it
    self.editView.on('saved', function(){
      self.editMode = false;
      self.render();
    });
  },

 render : function (){

    var self = this;
    var subData = {};
    if(self.options.submission){
      subData = self.options.submission.toJSON();
      subData.deviceFormTimestamp = moment(subData.deviceFormTimestamp).format('MMMM Do YYYY, h:mm:ss a');
    }else{
     console.log("no submission passed");
     return this;
    }

    async.parallel([
      function template (callback){
        self.loadTemplate("submissionTemplate",'/studio/static/js/views/forms/submission_template.handlebars',function (err, temp){
          self.submissionTemplate = temp;
          callback(err);
        });
      }
      ],function doRender (){
        self.processForm(self.form, subData, function (err, viewData){

          self.viewData = viewData;
          self.$el.empty();
          var html = self.submissionTemplate(viewData);
          self.$el.append(html);
        });
      });

    return this;
  },




  processForm : function (form, subData ,cb){
    var self = this;
    var merged = subData.formSubmittedAgainst;
    //need to turn this into a json object.
    var renderData = {"form":{"pages":[]},"sub":subData};
    var pages = merged.pages;
    pages.forEach(function (p, idx){
      if(!p.name) p.name = "page " + (idx +1);
      renderData.form.pages.push(p);
    });
    renderData._id = subData._id;
    renderData.controls = true;
    renderData.editMode = self.editMode;
    cb(undefined, renderData);
    self.enableSubmissionActions(subData._id);
  },

  cancelEdit : function (e){
    var self = this;
    self.editMode = false;
    return self.render();
  },

  enableSubmissionActions : function (subId){
    var self = this;
    self.$el.find('.submission-buttons').empty().append(self.templates.$submissionActions({"_id":subId}));
  },

  downloadFile : function (e){

    var btn = $(e.target);
    window.location.href = window.location.protocol+"//"+window.location.host+"/api/v2/forms/submission/file/"+btn.data("groupid");
  }

});
