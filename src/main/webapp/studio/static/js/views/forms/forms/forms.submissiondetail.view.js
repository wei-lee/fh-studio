var App = App || {};
App.View = App.View || {};

App.View.SubmissionDetail = App.View.Forms.extend({

  templates : {
    "submissionDetail" : '#formSubmissionDetail',
    "submissionTemplate":'#submissionTemplate',
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
        self.enableFileUpload(_ele);
      }
    });
    self.enableSubmissionEditActions(subid);
  },


  updateSubmission : function (){
    var self = this;
    var files = Object.keys(self.filesToSubmit);
    for(var i=0; i < files.length; i++){
      var sub = self.filesToSubmit[files[i]].submit();
      sub.success(function (result, textStatus, jqXHR) {
        //remove file from filesToSubmit
        console.log("file submission was successful");
        self.options.submission.fetch({
          "success":function (sub){
            console.log("updated submission fetched ",sub);
          } ,
          "error": function (err){
            console.log("failed to fetch sub ",err);
          }});
      })
      .error(function (jqXHR, textStatus, errorThrown) {})
      .complete(function (result, textStatus, jqXHR) {
              console.log("submission complete");


        });
    }


  },

  filesToSubmit : {},

  enableFileUpload: function(ele){
    var self = this;
    var url =  "/api/v2/forms/submission/"+self.submission._id+"/"+ele.attr('name')+"/"+ele.data('groupid')+"/updateFile";

    console.log("url ", url, ele.data("filehash"));


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
        self.showAlert(err ? 'error' : 'success', message);
      }
    });
  },


  render : function (){
    var self = this;
    self.$el.empty();
    var subData = {};
    if(self.options.submission){
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
          var html = self.templates.$submissionTemplate(renderData);
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
    console.log("form pages ", form.get('pages'));
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
