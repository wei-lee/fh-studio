var App = App || {};
App.View = App.View || {};

App.View.SubmissionDetail = App.View.Forms.extend({

  templates : {
    "submissionDetail" : '#formSubmissionDetail',
    "submissionEditActions":'#submissionEditActions',
    "submissionActions":'#submissionActions'
  },

  FILE_UPLOAD_URL : "/api/v2/forms/submission/file/", //note this is used here as we need to use the jquery fileupload plugin

  el : '.emptyContainer > .centered',

  events : {
    'click .downloadfile' : "downloadFile",
    'click #editSubmission' : 'editSubmission',
    'click #cancelEdit' : 'cancelEdit',
    'click #updateSubmission' : 'updateSubmission'

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
    var subid = $(e.target).data("subid");
    var self = this;
    //remove disabled
    self.$el.find(':disabled').each(function (){
      var _ele = $(this);
      $(this).attr('disabled',false);
      if('file' === _ele.attr("type")){
        _ele.show();
//        $(this).on('change', function (){
//           console.log("field value changed ", $(this).val());
//        });
        self.enableFileUpload(_ele);
      }else{
        $(this).on('blur', function (){
          var _this = $(this);
          var index = _this.data('index');
          var id = _this.attr('name');
          var field = self.options.submission.findFormField(id);
          console.log("found matching form field ", field, "updating value at index ", index);
          if(field && field.fieldValues){
            field.fieldValues[index] = _this.val();
          }else{
            //not an existing field on the
            field = self.getFormField(id);

          }
        });
      }
    });
    self.enableSubmissionEditActions(subid);
  },


  updateSubmission : function (){
    var self = this;

    console.log("update submission ", self.options.submission.toJSON());

    self.options.submission.save({"success": function (){

    },"error": function (){

    }});

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
  getFormField : function (id){
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

  enableFileUpload: function(ele){
    var self = this;
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


       console.log("id ", id);
       var field = self.options.submission.findFormField(id);
       if(! field){
        field = self.getFormField(id);
       }
       self.options.submission.formFields.push(field);

       console.log("found matching form field ", field, "updating value at index ", index, self.options.submission);


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

        self.options.submission.fetch({
          "success":function (sub){
            console.log("updated submission fetched ",sub);
          } ,
          "error": function (err){
            console.log("failed to fetch sub ",err);
          }});

        ele.show();
      }
    });
  },

  /**
   * END SUBMISSION EDIT CODE
   *
   */

  loadSumissionTemplate : function (cb){
    var self = this;

    if(! self.submissionTemplate){
      $.ajax({
        "url":'/studio/static/js/views/forms/submission_template.handlebars',
        "success":function (temp){

          self.submissionTemplate = Handlebars.compile(temp);
          cb();
        },
        "dataType":"text"
      });
    }else{
      cb();
    }
  },


  render : function (){
    var self = this;
    self.$el.empty();
    var subData = {};
    if(self.options.submission){
      self.loadSumissionTemplate(function (){
        subData = self.options.submission.toJSON();
        console.log("SUBMISSION ", subData);
        subData.deviceFormTimestamp = moment(subData.deviceFormTimestamp).format('MMMM Do YYYY, h:mm:ss a');
        self.form = self.formsCollection.findWhere({"_id": subData.formId});
        if(!self.form){ //if no form fetch a copy down
          self.formsCollection.fetch({"success":function (){
          self.form = self.formsCollection.findWhere({"_id": subData.formId});
          self.processForm(self.form, subData);
          },"error": function (){

          }});
        }
        else{
            self.processForm(self.form, subData);
        }
      });
    }else{
      //no submission?
      console.log("no submission passed ");
    }
  },


  processForm : function (form, subData){
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
          var html = self.submissionTemplate(renderData);
          self.$el.append(html);
          self.enableSubmissionActions(subData._id);
        });
      } ,
      "error": function (e){
        console.log("error fetching ", e);

      }
    });
  },

  cancelEdit : function (e){
    var self = this;
    self.$el.find(':enabled').each(function (){
      var _this = $(this);
      _this.attr("disabled",true);
      if("file" == _this.attr("type")){
        _this.hide();
      }
    });
    var subId = $(e.target).data('subid');
    self.enableSubmissionActions(subId);
  },

  enableSubmissionActions : function (subId){
    var self = this;
    self.$el.find('.submission-buttons').empty().append(self.templates.$submissionActions({"_id":subId}));
  },

  enableSubmissionEditActions : function (subId){
    var self = this;

    self.$el.find('.submission-buttons').empty().append(self.templates.$submissionEditActions({"_id":subId}));
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
                val.downloadUrl = self.FILE_UPLOAD_URL + val.groupId + "?rand="+Math.random();
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
