var App = App || {};
App.View = App.View || {};

App.View.SubmissionList = App.View.FormListBase.extend({
  templates : {
    'formsListBaseAdd' : '#formsListBaseAdd',
    'fullpageLoading' : '#fullpageLoading',
    'addToExistingApp' : '#addToExistingApp',
    'submissionListExport' : '#submissionListExport'
  },
  events : {
    'click tr' : 'onRowSelected',
    'click .btn-add-formsapp' : 'onCreate',
    'click .btn-add-existing' : 'onCreate',
    'click .btn-add-existing-app' : 'onAddExisting'
  },
  initialize: function(){
    var self = this;
    this.collection = new App.Collection.FormSubmissions([],{"formid":this.options.formId,"appId":this.options.appId});
    this.formsCol =  this.options.forms;

    this.pluralTitle = 'Forms Submissions';
    this.singleTitle = 'Forms Submission';
    this.columns = [{
      "sTitle": 'Form Name',
      "mDataProp": "appCloudName"
    },{
      "sTitle": 'App Name',
      "mDataProp": "appCloudName"
    },{
      "sTitle": 'App Env',
      "mDataProp": "appEnvironment"
    },{
      "sTitle": 'Date/Time Received',
      "mDataProp": "deviceFormTimestamp"
    },{
      "sTitle": 'Form Field 1',
      "mDataProp": "field1val"
    },
    {
      "sTitle": 'Form Field 2',
      "mDataProp": "field2val"
    },{
      "sTitle": 'Form Field 3',
      "mDataProp": "field3val"
    },{
        "bVisible":false,
        "mDataProp": "_id"
      }
   ];

    return self.constructor.__super__.initialize.apply(self, arguments);
  },
  render : function(){
    App.View.FormListBase.prototype.render.apply(this, arguments);


    return this.renderPreview();
  },

  renderList : function(){

   // this.$el.append(this.templates.$formsListBaseAdd( { name : this.singleTitle.toLowerCase(), cls : this.singleId } ));
    var self = this,
      data = this.collection.toJSON();

    console.log("renderList sub ",self.options);

    this.table = new App.View.DataTable({
      aaData : data,
      "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
        $(nTr).attr('data-index', iRow).attr('data-hash', sData.Hash).attr('data-_id', sData._id);
      },
      "aaSorting" : [],
      "aoColumns": this.columns,
      "bAutoWidth": false,
      "sPaginationType": 'bootstrap',
      "sDom": "<'row-fluid'<'span4'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
      "bLengthChange": false,
      "iDisplayLength": 5,
      "bInfo": true,
      "oLanguage" : {
        "sEmptyTable" : "No " + this.pluralTitle.toLowerCase() + " found"
      }
    });
    this.table.render();
    this.table.$el.find('table').removeClass('table-striped');
    this.$el.append(this.table.$el);

    this.$el.append('<br />');

    // Add in the view form view
    this.selectMessage = new App.View.FullPageMessageView({ message : 'Select a ' + this.singleTitle.toLowerCase() + ' above to preview & manage', button : false });
    this.$el.append(this.selectMessage.render().$el);

    //if("singleForm" == this.options.listType)
    $('.submissionslist').removeClass("span10").addClass("row-fluid");

    return this;
  },

  renderPreview : function(){
    this.$previewEl = $('<div class="app" />');
    this.$el.append(this.$previewEl);
    this.$previewEl.hide();

    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
    return this;
  },
  onAddSubmission : function(e){

  },
  onRowSelected : function (e){
    var self = this;
    var model = this.getDataForRow(e);
    console.log("model from table ", model);
    if(self.submissionDetail){
      self.submissionDetail.remove();
    }
    self.submissionDetail = new App.View.SubmissionDetail({"submission":model});
    self.submissionDetail.render();
  },

  updatePreview : function(updatedModel){
    var form = new App.View.FormAppsCreateEdit({ model : updatedModel, mode : 'update' });
    this.$previewEl.html(form.render().$el);
    this.$previewEl.show();
  },
  onAddExisting: function(){
    var form = new App.View.FormAppsCreateEdit({ mode : 'create' });
  }
});
