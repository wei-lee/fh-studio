App.View.SubmissionEdit = App.View.Forms.extend({

  initialize : function (){
    this.constructor.__super__.initialize.apply(this, arguments);
    this.submission = this.options.model;
    this.form = this.options.form;
  },



  FILE_UPLOAD_URL : "/api/v2/forms/submission/file/", //note this is used here as we need to use the jquery fileupload plugin
  FILE_PLACE_HOLDER : 'filePlaceHolder',
  events : {
    'click .downloadfile' : "downloadFile",
    'click #editSubmission' : 'editSubmission',
    'click #updateSubmission' : 'updateSubmission',
    'change .formVal' : 'updateModel'
  },

  templates : {
    "submissionEditActions":'#submissionEditActions',
    "submissionActions":'#submissionActions'
  },

  updateSubmission : function (){
    //save model upload files
    var self = this;
    var formFields = self.submission.get('formFields');
    formFields = async.map(formFields, function (f, cb){
      if(f.fieldId && f.fieldId._id) f.fieldId = f.fieldId._id;
      return f;
    });

    self.submission.save({
      silent: true,
      "success": function (){
         //upload files
        var files = Object.keys(self.filesToSubmit);
        //needs to be async series
        async.each(files, function (f,cb){
          var sub = self.filesToSubmit[f].submit();
          sub.success(function (result, textStatus, jqXHR) {
            //remove file from filesToSubmit
            cb();
          }).error(function (jqXHR, textStatus, errorThrown) {
            cb(errorThrown);
          });
        },function done(err){
          if (err){
            console.log(err);
            return self.message('Error uploading files', 'error');
          }

          self.submission.complete(function(err, res){
            if (err){
              console.log(err);
              return self.message('Error completing submission', 'error');
            }
            // We somehow change the schema of the submission - something happens to missing fields on save which causes them to be un-renderable. Just re-load for now..
            //TODO: This this...
            self.submission.fetch({
              success: function(){
                self.trigger('saved');
              },
              error : function(){
                self.message('Error loading newly saved submission');
              }
            });

            return self.message('Submission updated successfully');
          });
        });
      },"error": function (){
        return self.message('Error saving submission', 'error');
      }
    });
    return false;
  },

  getFormField : function (id){
    var self = this;
    var field;

    var pages = self.form.get("pages");

    for(var i=0; i < pages.length; i++){
      var page = pages.at(i);
      var fields = page.get("fields");
      fields.forEach(function (f){
        if(f._id === id){
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
        self.$el.empty().append(html);
        self.enableFileUpload();
      });
    return this;
  },
  filesToSubmit : {},
  updateModel : function (e){
    var self = this;
    var _this = $(e.target);
    var index = _this.data('index') || 0;
    var id = _this.data('_id');
    var type = _this.attr("type");
    var field = self.submission.findFormField(id);
    var val = _this.val();
    var fieldValues = [];
    if('radio' === type){
      val = $('input[name="'+id+'"]:checked').val();
    }

    if(field && field.fieldValues){
      if('checkbox' === type){
        var checkBoxIndex = _this.data('checkbox-index');
        if(! _this.is(':checked')){
          field.fieldValues[index].selections.splice(checkBoxIndex,1);
        }else{
          field.fieldValues[index].selections[checkBoxIndex] = _this.val();
        }
      }else{
        field.fieldValues[index] = _this.val();
      }
    }else{
      //not an existing field on the submission
      field = self.getFormField(id);
      var newField = {
        "fieldId":field._id,
        "fieldValues":[val]
      };
      if('checkbox' === type){
        newField.fieldValues= {"selections":[val]};
      }
      self.submission.get('formFields').push(newField);
    }
  },
  enableFileUpload: function(){
    var self = this;
    self.$el.find('input[type="file"]').each(function (){
      var ele  = $(this);
      var groupId = ele.data("groupid");
      var url;
      if(groupId && "" !== groupId){
        url = "/api/v2/forms/submission/"+self.submission.get('_id')+"/"+ele.attr('name')+"/"+groupId+"/updateFile";
      }else{
        //create a file id update the submission field with this id this will be sent to the server first then the file submission
        var createdHash = self.FILE_PLACE_HOLDER + new Date().getTime() + $fw.getUserProps().guid.replace(/[^a-z0-9]/ig,'');
        ele.data('filehash',createdHash);
        var index = ele.data('index');
        var id = ele.attr('name');

        url = "/api/v2/forms/submission/"+self.submission.get('_id')+"/"+id+"/"+createdHash+"/submitFile";

        var field = self.submission.findFormField(id);
        if(! field){
          field = self.getFormField(id);
        }

        field["fieldId"] =id;
        field["_id"] = id;
        field['hashName']= createdHash;
        self.submission.get('formFields').push(field);
      }

      ele.fileupload('destroy').fileupload({
        url: url,
        dataType: 'json',
        replaceFileInput: true,
        formData: [{
          name: 'hashName',
          value: ele.data("filehash")
        }],
        dropZone: ele,
        add: function(e, data) {
          ele.hide();

          var field = self.getFormField(ele.attr('name'));

          field.fieldValues = [{}];
          field.fieldValues[0].fileSize = data.files[0].size;
          field.fieldValues[0].fileType = data.files[0].type;
          field.fieldValues[0].fileName = data.files[0].name;
          field.fieldValues[0].hashName = field.hashName;
          field.fieldValues[0].fieldId = field.fieldId;
          //if this element has a file hash replace the file data at the index in the submission else add the file data
          //to the field def values at index 0
          self.filesToSubmit[data.paramName] = data;


          //self.filesToSubmit.push(data);

        },
        done: function(e, data) {
          delete self.filesToSubmit[data.paramName];
          self.submission.fetch({
            "success":function (sub){
              //TODO Should something not happen here
            } ,
            "error": function (err){
              //TODO Should something not happen here
            }});
          ele.show();
        }
      });
    });
  }
});
