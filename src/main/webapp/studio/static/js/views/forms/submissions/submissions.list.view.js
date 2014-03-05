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
    'click #advancedUseRepeating' :'enableRepeating',
    'click #advancedUseFields' :'enableFields',
    'click #deleteSubmission' : 'deleteSubmission'
  },

  deleteSubmission : function (e){
    var subid = $(e.target).data("subid");
    var sub = this.collection.findWhere({"_id":subid});
    sub.destroy({"success": function (){},"error": function (e){
      self.displayMessage("error deleting submission!");
      console.log("error deleting ", e);
    }});
  },

  searchContainers : {
    'fields':'.advancedSearchContainerFields',
    'repeating':'.advancedSearchContainerFieldsRepeating',
    'meta':'.advancedSearchContainerFieldsMeta'
  },

  eleDefs:{
    "SEARCH_CONDITION":".searchCondition",
    "SEARCH_CONTAINER_FIELDS":"#advancedSearchContainerFields",
    "SEARCH_CONTAINER_META":"#advancedSearchContainerFieldsMeta",
    "SEARCH_CONTAINER_REPEATING":"#advancedSearchContainerFieldsRepeating",
    "SEARCH_CONTAINER_FIELDS_CLASS":".advancedSearchContainerFields",
    "SEARCH_CONTAINER_META_CLASS":".advancedSearchContainerFieldsMeta",
    "SEARCH_CONTAINER_REPEATING_CLASS":".advancedSearchContainerFieldsRepeating"
  },

  initialize: function(){
    var self = this;
    this.collection = new App.Collection.FormSubmissions([],{"formid":this.options.formId,"appId":this.options.appId});
    this.formsCol =  this.options.forms;
    if(this.options.formId && this.formsCol ){
      this.form = this.formsCol.findWhere({"_id":this.options.formId});
      if(! this.form){
        self.displayMessage("not form found!");

      }else{
        this.pages = this.form.get("pages");
        //mixin view.mixins.js
        this.aggregateFields();
      }
    }

    this.pluralTitle = 'Forms Submissions';
    this.singleTitle = 'Forms Submission';
    this.columns = [{
      "sTitle": 'Form Name',
      "mDataProp": "formName"
    },{
      "sTitle": 'App Name',
      "mDataProp": "appName"
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
    var critNum = self.$el.find(self.eleDefs.SEARCH_CONDITION).length;
    var ele = $(e.target);
    var type = ele.data("crittype");

    switch (type){
      case "field" :
        container.find(self.eleDefs.SEARCH_CONTAINER_FIELDS_CLASS).append("<div class='row-fluid' style='padding-bottom: 5px; padding-top: 5px;'> " + self.templates.$searchFieldName({"fields":self.fields,"critNum":critNum}) + "</div>");
        container.find(self.eleDefs.SEARCH_CONTAINER_FIELDS+critNum+'> .conditioncontainer').show();
        container.find(self.eleDefs.SEARCH_CONTAINER_FIELDS+critNum+'> .advancedLabel').hide();
        break;
      case "meta":
        critNum = container.find('.metaData').length;
        container.find(self.eleDefs.SEARCH_CONTAINER_META_CLASS).append(self.templates.$searchMeta({"critNum":critNum}));
        container.find(self.eleDefs.SEARCH_CONTAINER_META+critNum+'> .conditioncontainer').show();
        container.find(self.eleDefs.SEARCH_CONTAINER_META+critNum+'> .advancedLabel').hide();
        break;
      case "repeating":
        critNum = container.find('.repeating').length;
        container.find(self.eleDefs.SEARCH_CONTAINER_REPEATING_CLASS).append(self.templates.$searchRepeatingField({fields:self.repeatingFields,"critNum":critNum}));
        container.find(self.eleDefs.SEARCH_CONTAINER_REPEATING+critNum+'> .conditioncontainer').show();
        container.find(self.eleDefs.SEARCH_CONTAINER_REPEATING+critNum+'> .advancedLabel').hide();
       break;
      default :
        break;
    }



  },

  removeCrit : function (e){
    var self = this;
    var ele =  $(e.target);
    var critId = ele.data("crit");
    var ctrlEle = ele.data('ctrlfield');
    var type = ele.data("crittype");


    var ctrlDiv = self.$el.find('div.'+ctrlEle);

    if(ctrlDiv.find('.btn-add-crit').length == 1){
      if("field" == type) $('#advancedUseFields').trigger("click");
      else if("meta" == type) $('#advancedUseMetaData').trigger('click');
      else if("repeating" == type) $('#advancedUseRepeating').trigger('click');
    }else{
      self.$el.find('#'+ctrlEle+critId).remove();
    }
    return false;
  },

  conditionalChange : function (e){
    var self = this;
    var val = $(e.target).val();
    self.clauseOperator  = val;
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
        // Allow form submissions to only have one field
        if (!field){
          this.columns[tableIndex].sTitle = '';
          dataOb["field" + fieldNum + "val"] = "";
          continue;
        }

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

    $('.submissionslist').removeClass("span10").addClass("row-fluid");
    return this;
  },


  onFieldSelectChange: function (e) {
    var self = this;
    var type = $(e.target).find('option').filter(':selected').data("type").trim();
    var rulesSelect = $(e.target).next('select');
    var checkedVal = $(e.target).parent().find('input.checkedValue');
    if("dateTime" == type){
      checkedVal.replaceWith(' <input type="date" class="checkedValue" placeholder="checked value">');
    }else if(checkedVal.attr("type") !== "text"){
      checkedVal.replaceWith(' <input type="text" class="checkedValue" placeholder="checked value">');
    }
    rulesSelect.empty();
    var conditionals = this.CONSTANTS.FIELD_RULES[type];
    if (!conditionals) {
        console.log("no conditionals found");
    } else {
      var html = "";
      for (var i = 0; i  < conditionals.length; i++) {
        html += "<option value='" + conditionals[i] + "'>" + conditionals[i] + "</option>";
      }
      rulesSelect.append(html);
    }
  },

  advancedSearch : function (e){
    var self = this;
    self.aggregateRepeating();
    //remove message view replace with rules like view with a single search criterea
    var container = self.$el.find('.databrowser:visible');
    var table = self.$el.find('.dataTables_wrapper');
    table.hide();
    container.empty();
    container.append(self.templates.$advancedSearchForm({"formid":self.options.formId,"appid":self.options.appId}));
    container.find(self.eleDefs.SEARCH_CONTAINER_FIELDS_CLASS).append(self.templates.$searchFieldName({"fields":self.fields,"critNum":0}));
    container.find(self.eleDefs.SEARCH_CONTAINER_REPEATING_CLASS).append(self.templates.$searchRepeatingField({"fields":self.repeatingFields,"critNum":0}));
    container.find(self.eleDefs.SEARCH_CONTAINER_META_CLASS).append(self.templates.$searchMeta({"critNum":0}));
    $('.databrowser":visible').removeClass('emptyContainer');
    container.find('.btn-remove-crit').first().remove();
    return false;
  },

  renderPreview : function(){
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
  onRowSelected : function (e){
    var self = this;
    if(this.submissionDetail){
      this.submissionDetail.remove();
    }
    this.selectMessage.options.message = "Loading...";
    this.selectMessage.render();
    this.selectMessage.$el.show();
    $('.submissionslist').removeClass("span10").addClass("row-fluid");
    var model = this.getDataForRow(e);
    console.log(model);
    model.fetch({"success": function (res){
      self.submissionDetail = new App.View.SubmissionDetail({"submission":res, form:self.form, formsCol:self.formsCol});
      self.$el.append(self.submissionDetail.render().$el);
      self.selectMessage.$el.hide();

    },"error":function (res){
        console.log("submission error ", res);
    }});



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
    var searchQuery = {
      "appId":appid,
      "formId":formid,
      "clauseOperator":self.clauseOperator || "and",
      "queryFields":{
        "clauses":[]
      },
      "queryMeta":{
        "clauses":[]
      }
    };

    //gather up fields search crit
    function getCrit(critCont, type, cb){
      if(type === "field"){
        $(critCont).find('.searchCondition:visible').each(function (){
          var crit = {
            "fieldId":"",
            "restriction":"",
            "value":""
          };
          var _this = $(this);
          var checkedVal = _this.find('input.checkedValue');
          var value = checkedVal.val();
          if(checkedVal.attr("type") === "date"){
            value = moment(checkedVal.val()).format("YYYY/mm/dd hh:mm:ss");
            console.log("value date ", value);
          }
          crit["fieldId"] = _this.find('select.searchFieldName').val();
          crit["restriction"] = _this.find('select.fieldConditionals').val();
          crit["value"] = value;
          cb(undefined, crit);
        });
      }else if("repeating" === type){
        $(critCont).find('.repeating:visible').each(function (){
          var crit = {
            "fieldId":"",
            "restriction":"",
            "value":""
          };
          var _this = $(this);
          var checkedVal = _this.find('input.checkedValue');
          var value = checkedVal.val();
          if(checkedVal.attr("type") === "date"){
            value = moment(checkedVal.val()).format("YYYY/mm/dd hh:mm:ss");
            console.log("value date ", value);
          }
          crit["fieldId"] = _this.find('select.searchFieldName').val();
          crit["restriction"] = _this.find('select.fieldConditionals').val();
          crit["value"] = value;
          cb(undefined, crit);
        });
      }else if("meta" === type){
        $(critCont).find('.metaData:visible').each(function (){
          var metaCrit ={
            "metaName": "",
            "restriction": "",
            "value": ""
          };
          var _this = $(this);
          var checkedVal = _this.find('input.checkedValue');
          var value = checkedVal.val();
          if(checkedVal.attr("type") === "date"){
            value = moment(checkedVal.val()).format("YYYY/mm/dd hh:mm:ss");
            console.log("value date ", value);
          }

            metaCrit.metaName = _this.find('select.searchFieldName').val();
            metaCrit.restriction = _this.find('select.fieldConditionals').val();
            metaCrit.value = value;
            cb(undefined, metaCrit);
        });
      }
    }

    self.$el.find(self.searchContainers["fields"]).each(function (){
      getCrit(this,"field", function (err, ok){
        searchQuery.queryFields.clauses.push(ok);
      });
    });

    self.$el.find(self.searchContainers["repeating"]).each(function (){
      getCrit(this,"repeating", function (err, ok){
        searchQuery.queryFields.clauses.push(ok);
      });
    });

    self.$el.find(self.searchContainers["meta"]).each(function (){
        getCrit(this,"meta",function(err, ok){
          searchQuery.queryMeta.clauses.push(ok);
        });
    });
    var options =
    {
      "success":function (res){
        var submissions = res.submissions;
        self.collection = new  App.Collection.FormSubmissions(submissions,{});
        self.render();
      },
      "error": function (err){
        console.log("search error ", err);
        self.alertMessage("there was an error during your search");
      }
    };
    this.collection.search(searchQuery,options);

    return false;
  },
  cancelSearch : function (){
    $('.formSelect:visible').trigger("change");
    return false;
  },
  enableMetaData : function (){
    var self = this;
    var metaData = $(self.eleDefs.SEARCH_CONTAINER_META_CLASS);
    if(metaData.is(":visible")){
      metaData.hide();
    }else{
      metaData.show();
    }

  },
  enableRepeating : function (){
    var self = this;
    var repeating = $(self.eleDefs.SEARCH_CONTAINER_REPEATING_CLASS);
    if(repeating.is(':visible')){
      repeating.hide();
    }else{
      repeating.show();
    }

  },
  enableFields : function (){
    var self = this;
    var fields = $(self.eleDefs.SEARCH_CONTAINER_FIELDS_CLASS);
    if(fields.is(':visible')){
      fields.hide();
    }else{
      fields.show();
    }
  }

});
