App = App || {};
App.View = App.View || {};

App.View.CMSListField = App.View.CMSSection.extend({
  events : {
    'click .btn-listfield-done' : 'onListFieldDone',
    'click .btn-cms-back' : 'onListFieldDone', // prevents default - override the default..
    'click .btn-listfield-change-data' : 'setModeData',
    'click .btn-listfield-change-structure' : 'setModeStructure',
    'click table tbody tr' : 'onRowClick',
    'click table tbody tr input[type=checkbox]' : 'onRowSelect',
    'click .btn-fieldlist-add' : 'onAddNewRow',
    'click .btn-fieldlist-delete' : 'onDeleteRow',
    'click .btn-fieldlist-duplicate' : 'onDuplicateRow',
    'click .cms-change': 'triggerChange'
  },
  "mode":"",

  initialize: function(options){
    this.title = (options.mode === 'data') ? "Edit List Data" : "Edit List Structure";
    this.templates = _.extend(this.constructor.__super__.templates, {
      'cms_listfieldsavecancel' : '#cms_listfieldsavecancel',
      'cms_editListDataInstructions' : '#cms_editListDataInstructions'
    });
    this.constructor.__super__.initialize.apply(this, arguments);
  },
  render : function(){
    var self = this;
    this.$el.empty();
    this.constructor.__super__.render.apply(this, arguments);
    // Empty all text fields
    this.$el.find('.fb-response-fields input, .fb-response-fields textarea').val('');

    // remove unused tabs
    if (this.options.mode === "data"){
      this.$el.find('.fb-tabs li.addfield').hide();
      this.$el.find('.fb-tabs li.configurefield').hide();
      // Make our only left tab the active one
      this.$el.find('.apppreview').addClass('active');
      this.$el.find('#cmsAppPreview').addClass('active');
      //TODO - Disable the 'label' input - CSS maybe?
    }else if (this.options.mode === "structure" && this.options.isAdministrator){
      this.$el.find('.fb-tabs li.addfield').show();
      this.$el.find('.fb-tabs li.configurefield').show();
    }else{
      this.$el.find('middle').empty().append('<h3>You do not have permissions to perform this operation</h3>');
      return this;
    }



    var top = new App.View.CMSListFieldTopBar(this.options);
    top.render().$el.insertAfter(this.$el.find('.middle .breadcrumb'));

    if (this.options.mode === "data"){
      this.afterEl = $(this.$el.find('.middle .fb-no-response-fields'));
      console.log("fields set to ", this.fieldList.fields);
      this.renderDataTable();

      $(this.templates.$cms_editListDataInstructions()).insertAfter(this.afterEl);

      // Disable field entry until user clicks a row, or adds a new row
      this.$el.find('.fb-response-fields input, .fb-response-fields textarea').attr('disabled', true);

    }
    this.$el.find('.middle').append(this.templates.$cms_listfieldsavecancel({"listid":this.fieldList.hash}));

    this.$el.find('.btn-listfield-change-' + this.options.mode).addClass('active');


    return this;
  },
  renderDataTable : function(){
    // Remove any previous table
    this.$el.find('.listViewDataTable').remove();
    this.table = new App.View.CMSTable({ checkboxes : true, fields : this.fieldList.fields, data : this.fieldList.data });
    this.table.$el.addClass('listViewDataTable');
    this.table.render().$el.insertAfter(this.afterEl);
    this.table.$el.find('table').removeClass('table-striped');
  },

  triggerChange : function () {
    App.dispatch.trigger("cms.section.unsaved",{});
  },

  onAddNewRow : function () {
    var self = this;
    console.log("add new row ",this.fieldList.fields);
    //add an empty row
    if(this.fieldList.fields){
      var blank = {};
      for(var i=0; i < this.fieldList.fields.length; i++){
        var f = this.fieldList.fields[i];
        blank[f.name] = "";

      }
      //we add a temp hash to use as a ref and remove these on save may be a better way of doing this.
      blank.hash = self.getTempHash();

      this.fieldList.data.push(blank);

      this.render();

      var tr = this.$el.find("tr[data-hash='"+blank.hash+"'] ");
      this.listfieldRowSelect(tr.data('index'));
      this.rowSetState(tr);

      // Set fields disabled to false now we've added a row
      this.$el.find('.fb-response-fields input, .fb-response-fields textarea').attr('disabled', false);
    }
  },

  onDuplicateRow : function (){
    var self = this;
     var checked = self.getCheckedRows();
    //get data obs change hases to tmp hashes and push into data and re render
    self.getFieldsData(checked, function (data){
      console.log("got row data ",data);
      _.each(data, function (it){
        var clone = _.clone(it);
        clone.hash =  self.getTempHash();
        self.fieldList.data.push(clone);
      });
    });
    self.render();
  },

  getFieldsData : function (hashes,cb){
    var self = this;
    var data = [];
    for(var i=0; i < hashes.length; i++){
      data.push(self.fieldList.data[hashes[i]]);
    }
    return cb(data);
  },

  getCheckedRows : function (){
    var checked = this.table.$el.find('input[type="checkbox"]:checked');
    var trParents = checked.parents('tr');
    console.log("found " + trParents.length + " trs");
    var hashes = [];
    trParents.each(function (){
       hashes.push($(this).data("index"));
    });
    return hashes;
  },

  onListFieldDone : function(e){
    e.preventDefault();
    e.stopPropagation();
    var self = this;

    // Now beings the rather complex task of updating the parent model's field list entry with this data (i.e. this.fieldList)..
    var parentModelFields = this.sectionModel.get('fields'),
    parentIndex;
    _.each(parentModelFields, function(f, i){
      if(f.name === self.fieldList.name){
        parentIndex = i;
      }
    });
    parentModelFields[parentIndex] = this.fieldList;
    this.sectionModel.set('fields', parentModelFields);

    // Go back to section back
    this.trigger('back');


    App.dispatch.trigger("cms.audit", "CMS List saved",self.fb);
    // We don't post to the server here - we just mark as unsaved, and only do so on the save button of the section
  },

  "getTempHash" :function(){
    return "temp-" + ( new Date().getTime() + Math.random() * 10000);
  },

  onDeleteRow : function (){

    var self = this;
    var activeRows = self.getCheckedRows();


    console.log("active rows",activeRows);
    for(var i=0; i < activeRows.length; i++){
      self.fieldList.data.splice(activeRows[i],1);
    }

    this.render();
  },
  setModeData : function(){
    var self = this;
    self.options.mode = 'data';
    self.title = 'Edit List Data';
    self.options.editStructure = false;
    self.render();
    self.$el.find('.btn-listfield-change-data').addClass('active');
  },
  setModeStructure : function(){
    var self = this;

    if (!this.options.isAdministrator){
      return;
    }

    self.options.mode = 'structure';
    self.title = 'Edit List Structure';
    self.options.editStructure = true;
    self.render();
    self.$el.find('.btn-listfield-change-structure').addClass('active');
  },
  onRowClick : function(e){
    console.log("row click called");
    // Uncheck all other rows
    this.table.$el.find('tr.info input[type=checkbox]').attr('checked', false);
    this.table.$el.find('tr.info').removeClass('info');

    // Trigger selection action for this item
    this.onRowSelect(e);

    // Trigger a selection event which will update the data on the formbuilder of section view
    var tr = (e.target.nodeName === "tr") ? $(e.target) : $(e.target).parents('tr');
    this.listfieldRowSelect(tr.data('index'));
    //TODO move this
    console.log("binding to inputs");
    $('.fb-response-fields').find('input').unbind().keyup(function (e){
      console.log("trigger section unsaved");
      App.dispatch.trigger("cms.section.unsaved",{});
    });

    // Set fields disabled to false now we're editing a row
    this.$el.find('.fb-response-fields input, .fb-response-fields textarea').attr('disabled', false);

    //TODO remove and fix properly after demo
    this.$el.find('textarea').each(function (){
       $(this).addClass("rf-size-large");
    });
  },

  rowSetState: function(row){
    console.log("row set state ", row);
    var checked = this.getCheckedRows();
    if (row.hasClass('info')){
      row.removeClass('info');
      row.find('input[type=checkbox]').attr('checked', false);
      checked = this.getCheckedRows();
      if(checked.length <= 0){
        this.deavtivateDestructiveButtons();
      }
    }else{
      row.addClass('info');
      row.find('input[type=checkbox]').attr('checked', true);
      this.activateDestuctiveButtons();
    }

    // If >1 row is selected, we're doing a multi-operation - we can only delete..
    if (checked.length>1){
      this.$el.find('.fb-response-fields input, .fb-response-fields textarea').attr('disabled', true);
    }else{
      this.$el.find('.fb-response-fields input, .fb-response-fields textarea').attr('disabled', false);
    }
  },

  onRowSelect : function(e){
    e.stopPropagation();
    var el = $(e.target),
    row = el.parents('tr');
    this.rowSetState(row);



  },

  "activateDestuctiveButtons" : function () {
    $('.btn-fieldlist-duplicate').removeClass("disabled");
    $('.btn-fieldlist-delete').removeClass('disabled');
  },

  "deavtivateDestructiveButtons": function (){
    $('.btn-fieldlist-duplicate').addClass("disabled");
    $('.btn-fieldlist-delete').addClass('disabled');
  },

  updateFormData : function(){

  },
  listfieldRowSelect : function(index){
    var fields = this.fieldList.fields,
    data = this.fieldList.data,
    row;

    if (data.length < index){
      throw new Error('No list field row with that index found');
    }

    row = data[index];
    _.each(fields, function(f){
      if (!row.hasOwnProperty(f.name)){
        throw new Error('No propery on this row found with key ' + f.name);
      }
      f.value = row[f.name];
    });
    fields = this.massageFieldsForFormbuilder(fields);
    this.fb.mainView.collection.reset(fields);
  },
  bindFBEvents : function(){
    var self = this;
    // On editing an existing field, mark section as unsaved
    this.fb.mainView.collection.bind('change', function(field, collection){
      App.dispatch.trigger(CMS_TOPICS.SECTION_DIRTIED,field.toJSON());
      var massaged = self.massageFieldFromFormBuilder(field);

      if (self.options.mode === "data"){
        var checked = self.table.$el.find('tr.info input:checked').parents('tr'),
        index = checked.first().data("index"),
        previousRow = self.fieldList.data[index],
        fObj = {};

        // Create a field object ready to extend/merge into our previousRow
        fObj[massaged.name] = massaged.value;

        _.extend(previousRow, fObj);

        self.fieldList.data[index] = previousRow;

        // Now that we've updated the data, render it in the table
        self.renderDataTable();
      }else if (self.options.mode === "structure" ){
        // Set the previous fields array at the index where we found the one
        // with matching _id to be our updated massaged field
        var previousFields = self.fieldList.fields,
        id = field.get('_id') || field.cid,
        previous = _.findWhere(previousFields, { _id : id}),
        indexOfPrevious = previousFields.indexOf(previous);

        previousFields[indexOfPrevious] = massaged;
      }
    });
    // On creating a field, we should also mark the section unsaved changes
    this.fb.mainView.collection.bind('add', function(field, collection){
      App.dispatch.trigger(CMS_TOPICS.SECTION_DIRTIED,field.toJSON());
      var massaged = self.massageFieldFromFormBuilder(field),
      previousFields = self.fieldList.fields;
      previousFields.push(massaged);
    });

    // On creating a field, we should also mark the section unsaved changes
    this.fb.mainView.collection.bind('remove', function(field, collection){
      App.dispatch.trigger(CMS_TOPICS.SECTION_DIRTIED,field.toJSON());
      var previousFields = self.fieldList.fields,
      previous = _.findWhere(previousFields, { _id : field.get('_id')}),
      indexOfPrevious = previousFields.indexOf(previous);
      previousFields.splice(indexOfPrevious, indexOfPrevious+1);
    });
  }
});
