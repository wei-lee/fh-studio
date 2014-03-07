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
    console.log("options ", this.options);
    var self = this;
    delete self.submission;
    if(self.options.submission){
      self.submission = self.options.submission.toJSON();
    }
    _.bindAll(this);
  },

  /**
   *  NOTE EDIT FUNCTIONS MOVING TO THE EDIT VIEW
   *
   */
  editSubmission : function (e) {
    //make new edit submission view and render
    var self = this;
    var editView = new App.View.SubmissionEdit({"preparedSubmission":self.viewData, "model":self.options.submission, "form":self.form, "el":self.$el});
    editView.render();

//    var subid = $(e.target).data("subid");
//
//    self.editMode = true;
//    self.render();
//    //remove disabled
//    self.$el.find(':disabled').each(function (){
//      var _ele = $(this);
//      _ele.attr('disabled',false);
//      var type = _ele.attr("type");
//      console.log("enabling type ", type);
//      if('file' === _ele.attr("type")){
//        _ele.show();
////        $(this).on('change', function (){
////           console.log("field value changed ", $(this).val());
////        });
//        self.enableFileUpload(_ele);
//      }else{
//        $(this).on('blur', function (){
//          var _this = $(this);
//          var index = _this.data('index');
//          var id = _this.attr('name');
//          var field = self.options.submission.findFormField(id);
//          console.log("found matching form field ", field, "updating value at index ", index);
//          if(field && field.fieldValues){
//            field.fieldValues[index] = _this.val();
//          }else{
//            //not an existing field on the
//            field = self.getFormField(id);
//
//          }
//        });
//      }
//    });

  },


  updateSubmission : function (){
    var self = this;

    console.log("update submission ", self.options.submission.toJSON());



//    var files = Object.keys(self.filesToSubmit);
//    for(var i=0; i < files.length; i++){
//      var sub = self.filesToSubmit[files[i]].submit();
//      sub.success(function (result, textStatus, jqXHR) {
//        //remove file from filesToSubmit
//        self.options.submission.fetch({
//          "success":function (sub){
//            console.log("updated submission fetched ",sub);
//            self.render();
//          } ,
//          "error": function (err){
//            console.log("failed to fetch sub ",err);
//            //show error message
//          }});
//      })
//      .error(function (jqXHR, textStatus, errorThrown) {
//        //show error message
//      });
//    }


  },

  filesToSubmit : {},

  //redundant remove in future




  /**
   * END SUBMISSION EDIT CODE
   *
   */

 render : function (){

    var self = this;
    self.$el.empty();

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
    var subId = $(e.target).data('subid');
  },

  enableSubmissionActions : function (subId){
    var self = this;
    self.$el.find('.submission-buttons').empty().append(self.templates.$submissionActions({"_id":subId}));
  },




  mergeSubmissionAndForm: function (form, submission, cb){
    var self = this;

    form.missing = [];

    async.series([function (callback){
      async.mapSeries(form.get('pages'), function(page, mcb0) {
        var fields = page.get("fields");
        async.mapSeries(fields, function(field, mcb1) {
          var subFieldMatch = _(submission.formFields).find(function(subField) {
          var matched = subField.fieldId._id.toString() === field._id.toString(); // need toString() as ids are objects
          if(matched){
            subField.matched = true;
          }
          return matched;
        });
        if(subFieldMatch){
          field.values =  (subFieldMatch.fieldValues || []);
        }
        else{
          field.values= [];
        }
        switch(field.type) {
          case 'photo':
            async.map(field.values, function(val, mcb2) {
              val.url = self.FILE_UPLOAD_URL + val.groupId+"?rand=" + Math.random();
              mcb2();
            }, mcb1);
              break;
            case 'file':
              field.values.forEach(function(val) {
                if(null != val){
                  val.downloadUrl = self.FILE_UPLOAD_URL + val.groupId + "?rand="+Math.random();
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
      async.mapSeries(submission.formFields, function (subField, dcb){
        if(!subField.matched){
          subField.fieldId.values = subField.fieldValues;
          form.missing.push(subField.fieldId);
        }
        dcb();
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
