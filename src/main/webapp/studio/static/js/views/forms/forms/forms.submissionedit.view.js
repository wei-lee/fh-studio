App.View.SubmissionEdit = App.View.Forms.extend({

  initialize : function (){
    this.constructor.__super__.initialize.apply(this, arguments);
    console.log("options ", this.options);
    this.submission = this.options.model;
    this.form = this.options.form;
    _.bindAll(this);
  },

  el : '.submissionDetail',

  FILE_UPLOAD_URL : "/api/v2/forms/submission/file/", //note this is used here as we need to use the jquery fileupload plugin
  events : {
    'click .downloadfile' : "downloadFile",
    'click #editSubmission' : 'editSubmission',
    'click #updateSubmission' : 'updateSubmission',
    'blur .formVal' : 'updateModel'
  },

  templates : {
    "submissionEditActions":'#submissionEditActions',
    "submissionActions":'#submissionActions'
  },

  getFormField : function (id){
    var self = this;
    var field;
    console.log("no field found try get the form field def");
    var pages = self.form.get("pages");
    console.log("form pages ", pages);
    for(var i=0; i < pages.length; i++){
      var page = pages.at(i);
      var fields = page.get("fields");
      fields.forEach(function (f){
        console.log('field ', f);
        if(f._id === id){
          console.log('field found ', f);
          field = f;
        }
      });
    }
    // ok to do this as foreach is not async
    return field;
  },

  render : function (){
    var self = this;
    async.parallel([
      function template (callback){
        self.loadTemplate("submissionTemplate",'/studio/static/js/views/forms/submission_template.handlebars',function (err, temp){
          self.submissionTemplate = temp;
          callback(err);
        });
      }],
      function doRender(){
        self.options.preparedSubmission.editMode = true;
        self.options.preparedSubmission.controls = true;
        var html = self.submissionTemplate(self.options.preparedSubmission);
        self.$el.replaceWith(html);
        self.enableSubmissionEditActions(self.options.preparedSubmission._id);
        self.enableFileUpload();
      });
    return this;
  },

  enableSubmissionEditActions : function (subId){
    var self = this;
    self.$el.find('.submission-buttons').empty().append(self.templates.$submissionEditActions({"_id":subId}));
  },

  filesToSubmit : {},

  updateModel : function (e){
    console.log("update model called" , $(e.target).val());
  },


  enableFileUpload: function(){
    var self = this;
    self.$el.find('input[type="file"]').each(function (){
      var ele  = $(this);
      var groupId = ele.data("groupid");
      var url;
      if(groupId && "" !== groupId){
        url = "/api/v2/forms/submission/"+self.submission._id+"/"+ele.attr('name')+"/"+groupId+"/updateFile";
      }else{
        //create a file id update the submission field with this id this will be sent to the server first then the file submission
        ele = $(ele);
        var index = ele.data('index');
        var id = ele.attr('name');

        url = "/api/v2/forms/submission/"+self.submission._id+"/"+id+"/:fileId/submitFile";


        console.log("SUBMISSION ", self.submission);
        var field = self.submission.findFormField(id);
        if(! field){
          field = self.getFormField(id);
        }

        self.submission.get('formFields').push(field);

        console.log("found matching form field ", field, "updating value at index ", index, self.submission);


      }

      console.log("url ", url, ele.data("groupid"));

      ele.fileupload('destroy').fileupload({
        url: url,
        dataType: 'json',
        replaceFileInput: false,
        formData: [{
          name: 'hashName',
          value: ele.data("filehash")
        }],
        dropZone: ele,
        add: function(e, data) {
          ele.hide();
          console.log("data file upload ", data );
          //if this element has a file hash replace the file data at the index in the submission else add the file data
          //to the field def values at index 0
          self.filesToSubmit[data.paramName] = data;
          //self.filesToSubmit.push(data);

        },
        done: function(e, data) {
          console.log('done called ', data);
          delete self.filesToSubmit[data.paramName];

          self.submission.fetch({
            "success":function (sub){
              console.log("updated submission fetched ",sub);
            } ,
            "error": function (err){
              console.log("failed to fetch sub ",err);
            }});

          ele.show();
        }
      });
    });

  }




});
