var App = App || {};
App.View = App.View || {};

App.View.CMSSection = App.View.CMS.extend({
  title : 'Edit Section',
  events: {
    'click .btn-savedraft' : 'onSectionSaveDraft',
    'submit #configureSectionForm' : 'onSectionPublish',
    'click .btn-discard-draft' : 'onDraftDiscard',
    'click .btn-deletesection' : 'onSectionDelete',
    'click #cmsDatePicker' : 'onPublishDateFocus',
    'click .btn-listfield-structure' : 'onListFieldEditStructure',
    'click .btn-listfield-data' : 'onListFieldEditData'
  },
  templates : {
    'cms_configureSection' : '#cms_configureSection',
    'cms_sectionExtraTabs' : '#cms_sectionExtraTabs',
    'cms_section_savecancel' : '#cms_section_savecancel',
    'cms_editSectionInstructions' : '#cms_editSectionInstructions'
  },
  initialize: function(options){
    this.$el = options.$el;
    this.options = options;
    this.collection = options.collection;
    this.compileTemplates();
    this.bind('listfieldRowSelect', this.listfieldRowSelect);
    this.view = (this.options.hasOwnProperty('listfield')) ?  "listfield" : "section";


  },

   render : function(){
    var self = this,
    sectionModel = this.sectionModel = this.collection.findWhere({path : this.options.section}),
    section = this.section =  sectionModel.toJSON(),
    path = section.path,
    fields, listData;

    if (!section){
      console.log('Error loading section with path ' + this.options.section);
      return this.modal('Error loading section');
    }



    if (this.view === 'listfield'){
      // We're editing a field_list - retrieve it
      this.fieldList = _.findWhere(section.fields, { name : this.options.listfield });


      if (!this.fieldList){
        this.fieldList = {
          modifiedDate : new Date(),
          name : this.options.listfield,
          type : 'list',
          fields : [],
          data : []
        };
      }

      fields = this.fieldList && this.fieldList.fields;
      if (!fields){
        console.log('error loading list fields');
        return this.modal('Error loading list fields');
      }
      fields = this.massageFieldsForFormbuilder(fields);
      path += ("." + this.fieldList.name + "." + "Edit " + this.options.mode);
    }else{
      // Just a standard section view - may or may not contain a listfield within
      fields = this.massageFieldsForFormbuilder(section.fields);
    }

    console.log("Section is ", section  ," fields ",fields);

    if (!section || !fields){
      console.log('Error finding section or fields on rendering section view');
      return this.modal("Error loading section");
    }

    this.$fbEl = this.$el.append('<div></div>');
    this.renderFormBuilder(fields);


    // Add in the CMS specific breadcrumb on top of the middle section
    this.$el.find('.middle').prepend(this.cmsBreadcrumb(path));
    // Add in the page title to the breadcrumb row
    this.$el.find('.middle').prepend('<h3>' + this.title + '</h3>');

    // Add in the extra tabs for configure section and preview
    this.$el.find('.fb-tabs').append(this.templates.$cms_sectionExtraTabs());

    if (this.view === 'section'){
      // Setup the configure section tab
      var pathArray = section.path.split('.'),
      parent = pathArray[pathArray.length-2] || "Root";
      var parentOptions = this.collection.toHTMLOptions();
      parentOptions = ["<option value='' data-path='' >-Root</option>"].concat(parentOptions);
      parentOptions = parentOptions.join('');
      this.$el.find('.fb-tab-content').append(this.templates.$cms_configureSection({ parentOptions : parentOptions, name : section.name, path:section.path }));

      this.$el.find('#cmsDatePicker').datetimepicker({
        format: 'yyyy-mm-dd hh:ii',
        autoclose: true,
        todayBtn: true
      });




      this.delegateEvents();
      // Select the active option
      this.$el.find('select[name=parentName]').val(parent);
    }

    this.$el.find('#cmsAppPreview').append($('#app_preview').clone(true).show().width('100%'));

    $(this.$el.find('.response-field-field_list')).each(function(){
      //self
      var name = $(this).find('.fieldlist_table').data('name'),
      listField = _.findWhere(section.fields, { name : name }),
      table;

      if (!listField){
        return this.modal('No list field found with name: ' + name);
      }

      table = new App.View.CMSTable({ fields : listField.fields, data : listField.data });
      $(this).find('.fieldlist_table').html(table.render().$el);
    });

    // Add in some instructions ontop of the form
    if (this.view === 'section'){
      var instructions;
      if(this.options.editStructure && this.options.editStructure === true){
        instructions = "Drag fields from the right to add fields. Drag fields to re-order. Click on a field to select it, click again to edit it. ";
      }else{
        instructions = "Edit the form to alter CMS data";
      }
      $(this.templates.$cms_editSectionInstructions({msg : instructions})).insertAfter(this.$el.find('.breadcrumb'));
      this.$el.find('.middle').append(this.templates.$cms_section_savecancel());
    }

     // On editing an existing field, mark section as unsaved
     //TOOD: A..?
     var resFields = $('.fb-response-fields input');
     //TODO tidy these up
     resFields.keyup(function (e){
       App.dispatch.trigger("cms.section.unsaved",section);
    });
     //..or B?:
//     this.fb.mainView.collection.bind('change', function(e){
//       App.dispatch.trigger("cms.section.unsaved",section);
//     });
     // On creating a field, we should also mark the section unsaved changes
     this.fb.mainView.collection.bind('add', function(e){
       App.dispatch.trigger("cms.section.unsaved",section);
     });


    $('.fb-field-wrapper .subtemplate-wrapper').click(function (){
      $('.fb-tabs li.configurefield a').trigger('click');
    });



    return this;
  },

  onSectionChange : function (se){
    var select = this.$('select[name="parentName"]');
    var opt = select.find('option').filter(":selected:");
    console.log(opt);
    console.log(select);
    var selectVal = select.val();
    console.log("section changed",selectVal);

    App.dispatch.trigger(CMS_TOPICS.SECTION_CHANGE,{"section":selectVal,"id":opt.data("id"),"path":opt.data("path")});
  },


  renderFormBuilder : function(fields){
    // Save some data massaging
    var self = this;
    this.$fbEl.empty();
    if (this.fb){
      this.fb.stopListening();
    }
    this.fb = new Formbuilder(this.$fbEl, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: fields,
      editStructure : this.options.editStructure || false
    });

    //TODO move this not sure where the right place is for it right now.
    $('.fb-response-fields').find('input').unbind().keyup(function (e){
      App.dispatch.trigger(CMS_TOPICS.SECTION_DIRTIED,{});
    });
    return this.fb;
  },
  massageFieldsForFormbuilder : function(oldFields){
    var fields = [];
    _.each(oldFields, function(field){
      var newField = {};
      switch(field.type){
        case "string":
          newField.field_type = "text";
          break;
        case "list":
          newField.field_type = "field_list";
          break;
        default:
          newField.field_type = field.type;
          break;
      }
      newField.label = field.name;
      newField.value = field.value;
      fields.push(newField);
    });

    return fields;
  },
  massageFieldsFromFormBuilder : function(fbfields, oldSection){
    var fields = [];
    _.each(fbfields, function(field){
      var  newField = {};
      switch(field.field_type){
        case "field_list":
          // FormBuilder doesn't give us the values of lists, we need to retrieve them ourselves.
          // if a user has changed the list structure or data, we've already copied it to the model - so we can
          // just copy it directly..
          //TODO: What if the user changes the listfield's name?
          newField = _.findWhere(oldSection.fields, { name : field.label});
          break;
        case "text":
          newField.type = "string";
          break;
        default:
          newField.type = field.field_type;
          break;
      }
      fields.push(newField);
      newField.name = field.label;
      newField.value = field.value;
    });
    return fields;
  },



  onSectionSaveDraft : function(e){
    e.preventDefault();
    var fields = this.fb.mainView.collection.toJSON(); //TODO: Verify this syncs with autoSave
    App.dispatch.trigger(CMS_TOPICS.SECTION_SAVE_DRAFT,{"section":this.section}); // Notify the tree that we're saving the section so it can change colour

    this.section.fields = this.massageFieldsFromFormBuilder(fields, this.section);


    this.alertMessage();
    App.dispatch.trigger(CMS_TOPICS.AUDIT, "Section draft saved with values: " + JSON.stringify(this.section));
    this.section.status = 'draft';
    this.sectionModel.set(this.section);
    //TODO: Dispatch draft to SS
    return false;
  },
  onDraftDiscard: function(e){


    var previous = this.sectionModel.previousAttributes();

    console.log("discard draft called");

    this.sectionModel.set(previous);

    this.alertMessage('Section changes discarded successfully');
    App.dispatch.trigger(CMS_TOPICS.AUDIT, "Section draft discarded");
    App.dispatch.trigger(CMS_TOPICS.SECTION_DISCARD_DRAFT,this.section);
    this.render();
    //TODO: Discard draft on server
  },
  onSectionPublish : function(e){
    var vals = {};
    e.preventDefault();

    // Get our form as a JSON object
    $(this.$el.find('#configureSectionForm').serializeArray()).each(function(idx, el){
      vals[el.name] = el.value;
    });

    // If publish is now, set the timedate if it's not already defined on the section
    if (vals.hasOwnProperty('publishRadio') && vals.publishRadio === "now"){
      if (!this.section.hasOwnProperty('publishdate')){
        this.section.publishdate = new Date(); // TODO: Maybe this should be handled on the server..?
      }
    }else if (vals.hasOwnProperty('publishRadio') && vals.publishRadio === "later"){
      this.section.publishDate = vals.publishdate;
    }

    this.section.name = vals.name;

    this.sectionModel.set(this.section);

    this.sectionModel.set('status', 'published');
    //TODO: Dispatch publish action to SS
    App.dispatch.trigger(CMS_TOPICS.SECTION_PUBLISH, this.section); // Notify the tree that we're saving the section so it can change colour
  },
  onSectionDelete : function(e){
    console.log("section delete called");
    e.preventDefault();
    // TODO: Delete section on server
    App.dispatch.trigger(CMS_TOPICS.AUDIT, "Section deleted");
    App.dispatch.trigger(CMS_TOPICS.SECTION_DELETE,{"path": $(e.target).data("path")});
  },
  onPublishDateFocus : function(){
    this.$el.find('#publishRadioLater').attr('checked', true);
  },
  setSection : function(section){
    this.options.section = section;
    this.render();
  },
  onListFieldEditStructure : function(e){
    this.onListFieldEdit(e, 'structure');

  },
  onListFieldEditData : function(e){
    this.onListFieldEdit(e, 'data');
  },
  onListFieldEdit : function(e, mode){
    var el = $(e.target),
    fieldName = el.data('name'),
    editStructure = (mode === 'structure'),
    options = { collection : this.collection, section : this.options.section, listfield : fieldName, mode : mode, editStructure : editStructure };
    this.trigger('edit_field_list', options);
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
  }
});