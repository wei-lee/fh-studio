var App = App || {};
App.View = App.View || {};

App.View.CMSSection = App.View.CMS.extend({
  title : 'Edit Section',
  events: {
    'click .btn-savesection' : 'onSectionSave',
    'click .btn-discard-section' : 'onSectionDiscard',
    'click .btn-deletesection' : 'onDeleteSection',
    'focus input[name=publishdate]' : 'onPublishDateFocus',
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
    section = this.collection.findSectionByPath(this.options.section),
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
      listData = this.fieldList && this.fieldList.data;
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


    this.$el.find('.fb-tabs').append(this.templates.$cms_sectionExtraTabs());

    if (this.view === 'section'){

      var pathArray = section.path.split('.'),
      parent = pathArray[pathArray.length-2] || "Root";
      var parentOptions = this.collection.toHTMLOptions();
      parentOptions = ["<option value='' data-path='' >-Root</option>"].concat(parentOptions);
      parentOptions = parentOptions.join('');
      this.$el.find('.fb-tab-content').append(this.templates.$cms_configureSection({ parentOptions : parentOptions, name : section.name }));
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

    return this;
  },

  onSectionChange : function (se){
    var select = this.$('select[name="parentName"]');
    var opt = select.find('option').filter(":selected:");
    console.log(opt);
    console.log(select);
    var selectVal = select.val();
    console.log("section changed",selectVal);

    App.dispatch.trigger("cms.sectionchange",{"section":selectVal,"id":opt.data("id"),"path":opt.data("path")});
  },


  renderFormBuilder : function(fields){
    // Save some data massaging
    var self = this;
    this.$fbEl.empty();
    if (this.fb){
      this.fb.stopListening();
    }
    console.log("renderFormBuilder ", fields);
    this.fb = new Formbuilder(this.$fbEl, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: fields,
      editStructure : this.options.editStructure || false
    });



//    this.fb.on('save', function(payload){
//      console.log("save has been called");
//      console.log("fb save ", payload);
//      self.draft = payload;
//      debugger;
//      if(self.save){
//        console.log("Proxying on to save function in lower level");
//      }
//
//    });

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



  onSectionSave : function(e){
    e.preventDefault();
    var vals = {},
    sectionModel = this.collection.findWhere({path : this.options.section} ), // we don't use our convenience byPath here as we want modal instance
    section = sectionModel.toJSON(),
    fields = this.fb.mainView.collection.toJSON(); //TODO: Verify this syncs with autoSave

    // Get our form as a JSON object
    $(this.$el.find('#configureSectionForm').serializeArray()).each(function(idx, el){
      vals[el.name] = el.value;
    });


    // If publish is now, set the timedate if it's not already defined on the section
    if (vals.publishRadio && vals.publishRadio === "now"){
      if (!section.hasOwnProperty('publishdate')){
        section.publishdate = new Date(); // TODO: Maybe this should be handled on the server..?
      }
    }else if (vals.publishRadio && vals.publishRadio === "later"){
      section.publishDate = vals.publishdate;
    }

    section.name = vals.name;
    section.fields = this.massageFieldsFromFormBuilder(fields, section);


    this.alertMessage();
    App.dispatch.trigger("cms.audit", "Section saved with values: " + JSON.stringify(section));
    sectionModel.set(section);
    //TODO: Dispatch section to server ?
    return false;
  },
  onSectionDiscard : function(){
    this.render();
    this.alertMessage('Section changes discarded successfully');
    App.dispatch.trigger("cms.audit", "Section draft discarded");
    //TODO: Discard draft on server
  },
  onSectionDelete : function(e){
    console.log("section delete called");
    e.preventDefault();
    // TODO: Delete section on server
    App.dispatch.trigger("cms.audit", "Section deleted");
    App.dispatch.trigget("cms.sectiondelete",{});
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