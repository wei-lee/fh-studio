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
      },
      function form(callback){
        if(!self.form){ //if no form fetch a copy down
          self.formsCollection.fetch({"success":function (){
            self.form = self.formsCollection.findWhere({"_id": subData.formId});
            callback();
          }
          ,"error": function (err){
            console.error("error fetching forms ",err);
          }});
        }else{
          return callback();
        }
      }],function doRender (){
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
    form.fetch({
      "success": function (f){
        self.mergeSubmissionAndForm(f,subData, function (merged){
          //need to turn this into a json object.
          var renderData = {"form":{"pages":[]},"sub":subData};
          var pages = merged.get("pages");
          pages.forEach(function (p, idx){
            if(!p.name) p.name = "page " + (idx +1);
            renderData.form.pages.push(p.toJSON());
          });
          renderData.missing = form.missing;
          renderData._id = subData._id;
          renderData.controls = true;
          renderData.editMode = self.editMode;

          cb(undefined, renderData);
          self.enableSubmissionActions(subData._id);
        });
      } ,
      "error": function (e){
        cb(e);
        console.log("error fetching ", e);
      }
    });
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



  //TODO tidy up and also perhaps this belongs in fh-forms to be done on the server side.
  mergeSubmissionAndForm: function (form, submission, cb){
    var self = this;

    form.missing = [];
    var pages = form.get('pages');

    async.series([function mapSubmissionFieldToExistingFormsFields (callback){
      async.mapSeries(pages, function(page, mcb0) {
        var fields = page.get("fields");
        async.mapSeries(fields, function(field, mcb1) {
          var subFieldMatch = _(submission.formFields).find(function(subField) {
            //match the submission field to the existing formField
            var matched = subField.fieldId._id.toString() === field._id.toString(); // need toString() as ids are objects
            if(matched){
              subField.matched = true;
            }
            return matched;
          });
          if(subFieldMatch){
            field.values =  subFieldMatch.fieldValues || [];
          }
          else{
            field.values= [];
          }
          switch(field.type) {
            case 'photo':
            case 'signature':
              async.map(field.values, function(val, mcb2) {
                val.url = self.FILE_UPLOAD_URL + val.groupId+"?rand=" + Math.random();
                mcb2();
              }, mcb1);
                break;
              case 'file':
                field.values.forEach(function(val) {
                  if(null !== val){
                    val.downloadUrl = self.FILE_UPLOAD_URL + val.groupId;
                  }
                });
                return mcb1();
              default:
                return mcb1();
            }
        }, mcb0);
      }, function(err, results) {
        return callback(undefined,form);
      });
    }, function (callback){
      async.mapSeries(submission.formFields, function matchRemovedFieldsWithPages (subField, dcb){
        //only interested if no match in existing form found
        if(!subField.matched){
          subField.fieldId.values = subField.fieldValues;
          //attempt to match missing subfield with page
          async.mapSeries(pages, function(page, mcb0) {
            if(subField.fieldId && subField.fieldId.pageData){
              if(subField.fieldId.pageData._id === page.get("_id")){
                subField.fieldId.missing = true;
                subField.matched = true;
                page.get("fields").push(subField.fieldId);
              }
            }else{
              //allow for submissions that have not had pageid and name populated.
              form.missing.push(subField.fieldId);
            }
            mcb0();
          }, function createMissingPageForField (){
            //finally if still no match recreate a form page for that and any other fields that belong to the same page id
            if(! subField.matched){
              if(subField && subField.fieldId && subField.fieldId.pageData){
                pages.push({
                  "_id":subField.fieldId.pageData._id,
                  "name":subField.fieldId.pageData.name + "(page no longer exists)",
                  "fields":[subField.fieldId]
                });
              }else{
                form.missing.push(subField.fieldId);
              }
            }
            dcb();
          });
        }else{
          dcb();
        }
      },callback);
    }],function(err, res){
      cb(res[0]);
    });
  },

  downloadFile : function (e){

    var btn = $(e.target);
    window.location.href = window.location.protocol+"//"+window.location.host+"/api/v2/forms/submission/file/"+btn.data("groupid");
  }

});
