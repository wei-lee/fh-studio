var App = App || {};
App.View = App.View || {};

App.View.SubmissionList = App.View.FormListBase.extend({
  templates : {
    'formsListBaseAdd' : '#formsListBaseAdd',
    'fullpageLoading' : '#fullpageLoading',
    'addToExistingApp' : '#addToExistingApp',
    'submissionListExport' : '#submissionListExport',
    'advancedSearch' : '#advancedSearch',
    'advancedSearchForm':'#advancedSearchForm',
    'fieldRuleTemplate':"#fieldRuleTemplate",
    'searchFieldName':'#searchFieldName',
    'addedRuleCondition':'#addedRuleCondition',
    'searchMeta':'#searchMeta',
    'searchRepeatingField':'#searchRepeatingField'
  },
  events : {
    'click tr' : 'onRowSelected',
    'click .btn-add-formsapp' : 'onCreate',
    'click .btn-add-existing' : 'onCreate',
    'click .btn-add-existing-app' : 'onAddExisting',
    'click .advancedSearch' : 'advancedSearch',
    'change .searchFieldName': 'onFieldSelectChange',
    'click .btn-add-crit' : 'addCrit',
    'click .btn-remove-crit':'removeCrit',
    'click .btn-search' : 'doSearch',
    'change .conditional' : 'conditionalChange',
    'click .btn-cancel':'cancelSearch',
    'click #advancedUseMetaData' :'enableMetaData',
    'click #advancedUseRepeating' :'enableRepeating'
  },
  initialize: function(){
    var self = this;
    console.log("init list view " , self.options);

    this.collection = new App.Collection.FormSubmissions([],{"formid":this.options.formId,"appId":this.options.appId});
    this.formsCol =  this.options.forms;
    if(this.options.formId && this.formsCol ){
      this.form = this.formsCol.findWhere({"_id":this.options.formId});
      this.pages = this.form.get("pages");
        //mixin view.mixins.js
      this.aggregateFields();
    }

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

  addCrit : function (e){
    var self = this;
    var container = self.$el.find('.databrowser:visible');
    var critNum = self.$el.find('.searchCondition').length;
    var ele = $(e.target);
    var type = ele.data("crittype");
    console.log("adding crit type ", type);

    switch (type){
      case "field" :
        container.find('.advancedSearchContainerFields').append("<div class='row-fluid' style='padding-bottom: 5px; padding-top: 5px;'> " + self.templates.$searchFieldName({"fields":self.fields,"critNum":critNum}) + "</div>");
        container.find('#advancedSearchContainerFields'+critNum+'> .conditioncontainer').show();
        container.find('#advancedSearchContainerFields'+critNum+'> .advancedLabel').hide();
        break;
      case "meta":
        critNum = container.find('.metaData').length;
        container.find('.advancedSearchContainerFieldsMeta').append(self.templates.$searchMeta({"critNum":critNum}));
        container.find('#advancedSearchContainerFieldsMeta'+critNum+'> .conditioncontainer').show();
        container.find('#advancedSearchContainerFieldsMeta'+critNum+'> .advancedLabel').hide();
        break;
      case "repeating":
        critNum = container.find('.repeating').length;
        container.find('.advancedSearchContainerFieldsRepeating').append(self.templates.$searchRepeatingField({fields:self.repeatingFields,"critNum":critNum}));
        container.find('#advancedSearchContainerFieldsRepeating'+critNum+'> .conditioncontainer').show();
        container.find('#advancedSearchContainerFieldsRepeating'+critNum+'> .advancedLabel').hide();
       break;
      default :
        break;
    }



  },

  removeCrit : function (e){
    var critId = $(e.target).data("crit");
    var ctrlEle = $(e.target).data('ctrlfield');
    var self = this;
    console.log('#'+ctrlEle+critId);
    self.$el.find('#'+ctrlEle+critId).remove();
    return false;
  },

  conditionalChange : function (e){
    var self = this;
    var val = $(e.target).val();
    self.$el.find('.conditional').each(function (){
      if(val !== $(this).val()){
          $(this).val(val);
      }
    });
  },

  renderList : function(){

    var self = this,
      data = this.collection.toJSON();


    //validate ok
    if("singleForm" === this.options.listType){
      var dataOb = data[0];

      var tableIndex = 4;
      for(var i=0; i < 2; i++){
        var field = dataOb.formFields[i];
        console.log("assigning field ", field);
        this.columns[tableIndex].sTitle = field.fieldId.name;
        var fieldNum = i + 1;
        dataOb["field" + fieldNum + "val"] = field.fieldValues[0];
        tableIndex+=1;

      }

    }

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


  onFieldSelectChange: function (e) {
    console.log("select change populate conditions");
    var self = this;
    var type = $(e.target).find('option').filter(':selected').data("type").trim();
    var rulesSelect = $(e.target).next('select');
    rulesSelect.empty();
    var conditionals = Constants.APP_FORMS.FIELD_RULES[type];
    if (!conditionals) {
        console.log("no conditionals found");
    } else {
      var html = "";
      for (var i = 0; i < conditionals.length; i++) {
        html += "<option value='" + conditionals[i] + "'>" + conditionals[i] + "</option>";
      }
      rulesSelect.append(html);
    }
  },

  advancedSearch : function (e){
    var self = this;
    self.aggregateRepeating();
    console.log("advanced search called ", self.fields);
    var formModel = self.options.forms.findWhere({"_id" : self.options.formId});
    //remove message view replace with rules like view with a single search criterea
    var container = self.$el.find('.databrowser:visible');

    var table = self.$el.find('.dataTables_wrapper');
    table.hide();
    container.empty();
    container.append(self.templates.$advancedSearchForm({"formid":self.options.formId,"appid":self.options.appId}));
    container.find('.advancedSearchContainerFields').append("<div class='searchCondition' id='0'>"+self.templates.$searchFieldName({"fields":self.fields,"critNum":0})+"</div>");
    console.log("repeating fields ", self.repeatingFields);
    var repeatingValues = [];
    var maxRep = self.repeatingFields[1].fieldOptions.definition.maxRepeat;

    for(var i=1; i < maxRep; i++){
      repeatingValues.push("value number " + i );
    }
    console.log("repeating values ", repeatingValues);
    container.find('.advancedSearchContainerFieldsRepeating').append(self.templates.$searchRepeatingField({"fields":self.repeatingFields,"repeats":repeatingValues,"critNum":0}));
    container.find('.advancedSearchContainerFieldsMeta').append(self.templates.$searchMeta({"critNum":0}))
    $('.databrowser":visible').removeClass('emptyContainer');
    container.find('.btn-remove-crit').first().remove();
    return false;
  },

  renderPreview : function(){
    console.log("render preview submissions");
    var self = this;
    this.$previewEl = $('<div class="app" />');
    this.$el.append(this.$previewEl);
    this.$previewEl.hide();

    // Move the loading to the bottom of this element's dom
    this.loading.remove();
    this.$el.append(this.loading);
    console.log("found search input", $('.form-search:visible').html());
    if("singleForm" == this.options.listType){
      self.$el.find('.form-search').parent().append(self.templates.$advancedSearch());
    }
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
  },
  doSearch : function (e){
    var self = this;
    var btn = $(e.target);
    var appid = btn.data("appid");
    var formid = btn.data("formid");
    console.log("searching form " + formid + " with app " + appid);
    var options =
    {
      "success":function (res){
        var submissions = res.submissions;
        self.collection = new  App.Collection.FormSubmissions(submissions,{});
        self.render();
      },
      "error": function (err){
        console.log("search error ", err);
        App.View.Forms.prototype.message('there was an error retrieving search results');
      }
    };
    this.collection.findBySearchParams({},options);
    return false;
  },
  cancelSearch : function (){
    $('.formSelect:visible').trigger("change");
    return false;
  },
  enableMetaData : function (){
    var metaData = $('.advancedSearchContainerFieldsMeta');
    if(metaData.is(":visible")){
      metaData.hide();
    }else{
      metaData.show();
    }

  },
  enableRepeating : function (){
    var repeating = $('.advancedSearchContainerFieldsRepeating');
    if(repeating.is(':visible')){
      repeating.hide();
    }else{
      repeating.show();
    }

  }

});
