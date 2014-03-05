var App = App || {};
App.View = App.View || {};

App.View.SubmissionDetail = App.View.Forms.extend({

  templates : {
    "submissionDetail" : '#formSubmissionDetail',
    "submissionEditActions":'#submissionEditActions',
    "submissionActions":'#submissionActions'


  },

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


  editSubmission : function (e) {
    var subid = $(e.target).data("subid");
    var self = this;
    //remove disabled
    self.$el.find(':disabled').each(function (){
      var _ele = $(this);
      $(this).attr('disabled',false);
      if('file' === _ele.attr("type")){
//        $(this).on('change', function (){
//           console.log("field value changed ", $(this).val());
//        });
        self.enableFileUpload(_ele);
      }else{
        $(this).on('blur', function (){
          console.log('input update ', $(this));
          var _this = $(this);
          var index = _this.data('index');
          var id = _this.attr('name');
          var field = self.options.submission.findFormField(id);
          console.log("found matching form field ", field, "updating value at index ", index);
          if(field && field.fieldValues){
            field.fieldValues[index] = _this.val();
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

  process_file : function (params, cb) {
//  var inputValue = params.value;
//  var isStore = params.isStore === undefined ? true : params.isStore;
//  if (typeof inputValue == 'undefined' || inputValue == null) {
//    return cb(null, null);
//  }
//  if (typeof inputValue != 'object' || !inputValue instanceof HTMLInputElement && !inputValue instanceof File && !checkFileObj(inputValue)) {
//    throw 'the input value for file field should be a html file input element or a File object';
//  }
//  if (checkFileObj(inputValue)) {
//    return cb(null, inputValue);
//  }
//  var file = inputValue;
//  if (inputValue instanceof HTMLInputElement) {
//    file = inputValue.files[0];  // 1st file only, not support many files yet.
//  }
//  var rtnJSON = {
//    'fileName': file.name,
//    'fileSize': file.size,
//    'fileType': file.type,
//    'fileUpdateTime': file.lastModifiedDate.getTime(),
//    'hashName': '',
//    'contentType': 'binary'
//  };
//  var name = file.name + new Date().getTime() + Math.ceil(Math.random() * 100000);
//  appForm.utils.md5(name, function (err, res) {
//    var hashName = res;
//    if (err) {
//      hashName = name;
//    }
//    hashName = 'filePlaceHolder' + hashName;
//    rtnJSON.hashName = hashName;
//    if (isStore) {
//      appForm.utils.fileSystem.save(hashName, file, function (err, res) {
//        if (err) {
//          console.error(err);
//          cb(err);
//        } else {
//          cb(null, rtnJSON);
//        }
//      });
//    } else {
//      cb(null, rtnJSON);
//    }
//  });
  },

  enableFileUpload: function(ele){
    var self = this;
    var groupId = ele.data("groupid");
    var url;
     if(groupId && "" !== groupId){
      url = "/api/v2/forms/submission/"+self.submission._id+"/"+ele.attr('name')+"/"+groupId+"/updateFile";
     }else{
       //create a file id update the submission field with this id this will be sent to the server first then the file submission

       url = "/api/v2/forms/submission/"+self.submission._id+"/:fieldId/:fileId/submitFile";

       ele = $(ele);
       var index = ele.data('index');
       var id = ele.attr('name');
       console.log("id ", id);
       var field = self.options.submission.findFormField(id);
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

  loadSumissionTemplate : function (cb){
    var self = this;

    if(! self.submissionTemplate){
      $.ajax({
        "url":'/studio/static/js/views/forms/submission_template.handlebars',
        "success":function (temp){
          console.log("loaded template ", temp);
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
          var form = self.formsCollection.findWhere({"_id": subData.formId});
          if(!form){
            self.formsCollection.fetch({"success":function (){
              form = self.formsCollection.findWhere({"_id": subData.formId});
              self.processForm(form, subData);
            },
              "error": function (){

              }});
          }
          else{
            self.processForm(form, subData);
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
          var renderData = {"form":{"pages":[]}};
          var pages = merged.get("pages");

          pages.forEach(function (p, idx){
            if(!p.name) p.name = "page " + (idx +1);
            renderData.form.pages.push(p.toJSON());

          });
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
       $(this).attr("disabled",true);
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

    //return merged data
    console.log("form submission ", submission);
    async.mapSeries(form.get('pages'), function(page, mcb0) {
      var fields = page.get("fields");
      async.mapSeries(fields, function(field, mcb1) {
        var subFieldMatch = _(submission.formFields).find(function(subField) {
          return subField.fieldId._id.toString() === field._id.toString(); // need toString() as ids are objects
        });
       field.values = subFieldMatch ? (subFieldMatch.fieldValues || []) : [];
        switch(field.type) {
          case 'photo':
            async.map(field.values, function(val, mcb2) {
              //var localUrl = path.join(config.fhsupercore.appforms.pdfExportDir, 'image_binary_' + val.groupId);
              val.url = '/api/v2/forms/submission/file/'+val.groupId+"?rand="+Math.random();
              mcb2();
            }, mcb1);
            break;
          case 'file':
            field.values.forEach(function(val) {
              val.downloadUrl = '/api/v2/forms/submission/file/' + val.groupId+"?rand="+Math.random();
            });
            return mcb1();
          default:
            return mcb1();
        }
      }, mcb0);
    }, function(err, results) {
      return cb(form);
    });

  },

  downloadFile : function (e){

    var btn = $(e.target);
    console.log('called download' , window.location.protocol+"//"+window.location.host+"/api/v2/forms/submission/file/"+btn.data("groupid"));
    window.location.href = window.location.protocol+"//"+window.location.host+"/api/v2/forms/submission/file/"+btn.data("groupid");
  }

});
