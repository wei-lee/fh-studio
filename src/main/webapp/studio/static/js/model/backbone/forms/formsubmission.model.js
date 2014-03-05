var App = App || {};
App.Model = App.Model || {};
App.Collection = App.Collection || {};
App.collections = App.collections || {};



App.Model.FormSubmission = App.Model.FormBase.extend({
  fetchURL : "/api/v2/forms/submission/{{id}}",
  url : "/api/v2/forms/submission",
  getDownloadUrl: function() {
    return this.fetchURL.replace('{{id}}', this.id) + ".pdf";
  },
  "findFormField": function (id){
    var formFields = this.get("formFields");

    if(formFields){
      for(var i=0; i < formFields.length; i++){
        var field = formFields[i];
        if(field.fieldId && id === field.fieldId._id){
          return field;
        }
      }
    }
    return undefined;
  }
});


// '/api/v2/forms/submission',
App.Collection.FormSubmissions = App.Collection.FormBase.extend({
  initialize: function(models,options) {
    console.log("FormSubmissions opts " , options);

    if(options["formid"]) this.formId = options["formid"];
    if(options["appId"]) this.appId = options["appId"];
  },
  model: App.Model.FormSubmission,
  urlRead: '/api/v2/forms/submission',
  urlSearch : '/studio/static/js/model/backbone/mocks/forms/submissions.json', //change to be the search url
  urlGetSubmission : '/api/v2/forms/submission/{{id}}',

  sync: function (method, model, options) {
    console.log("sync called for model");
    this[method].apply(this, arguments);
  },

  read : function(method, model, options){
    var self = this;
    var data  = {};
    if(this.formId){
      data["formId"] = this.formId;
    }
    if(this.appId){
      data["appId"] = this.appId;
    }


    if(!self.loaded){
      var url = self.urlRead;
      $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(res){
          if (res.submissions ) {
            for(var i=0; i < res.submissions.length; i++){
              var sub = res.submissions[i];
              //console.log("submission formfield  ", sub.formFields[0].fieldValues[0]);

              sub.field1val = '';
              sub.field2val = '';
              sub.field3val = '';

              for (var j=0; sub.formFields && j< sub.formFields.length; j++){
                if (j===3){
                  break;
                }
                var firstField = sub.formFields[j],
                firstValue = (typeof firstField === 'object' && firstField.fieldValues && firstField.fieldValues.length>0) ? firstField.fieldValues[0] : false;
                if (firstValue){
                  // Check if multi-select type e.g. radio or checkboxes
                  var idx = j + 1;
                  sub['field' + (idx) + 'val'] = ('object' === typeof  firstValue) ? firstValue.selections[0] : firstValue;
                }
              }

            }

            self.loaded = true;
            if ($.isFunction(options.success)) {
              options.success(res.submissions, options);
            }
          } else {
            if ($.isFunction(options.error)) {
              options.error(res, options);
            }
          }
        },
        error: function(xhr, status){
          App.View.Forms.prototype.message('failed to update ' + status);
          options.error(arguments);
        }
      });
    } else {
      self.trigger("sync");
    }
  },

  search : function (queryOb, options){      //NOTE THIS USES MOCK DATA AS SERVERSIDE IS NOT DONE
    $.ajax({
      type: 'POST',
      url: this.urlSearch,
      data : JSON.stringify(queryOb),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(res){
        console.log("response read by id ", res);
        options.success(res);
      },
      error: function(xhr, status){
        console.log("error read by id ", status);
        options.error(status);
      }
    });
  }

});