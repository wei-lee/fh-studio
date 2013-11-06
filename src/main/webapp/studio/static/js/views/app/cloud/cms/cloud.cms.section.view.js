var App = App || {};
App.View = App.View || {};

App.View.CMSSection = App.View.CMS.extend({
  title : 'Edit Section',
  events: {
    'click .btn-savedraft' : 'onSectionSaveDraft',
    'click .btn-cancel-changes' : 'onCancelChanges',
    'click .btn-listfield-structure' : 'onListFieldEditStructure',
    'click .btn-listfield-data' : 'onListFieldEditData',
    'click .btn-edit-section' : 'onEditSectionToggle',
    'change input[type="file"]' : 'onFileBrowsed'
  },
  templates : {
    'cms_configureSection' : '#cms_configureSection',
    'cms_sectionExtraTabs' : '#cms_sectionExtraTabs',
    'cms_sectionExtraTabsContent' : '#cms_sectionExtraTabsContent',
    'cms_section_savecancel' : '#cms_section_savecancel',
    'cms_editSectionInstructions' : '#cms_editSectionInstructions',
    'cms_editSectionButton' : "#cms_editSectionButton"
  },
  initialize: function(options){
    this.$el = options.$el;
    this.options = options;
    this.options.editStructure = (options.isAdministrator === true);
    this.collection = options.collection;
    this.compileTemplates();
    this.view = (this.options.hasOwnProperty('listfield')) ?  "listfield" : "section";
  },

   render : function(){
    var self = this,
    sectionModel = this.sectionModel = this.collection.findWhere({_id : this.options.section}),
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

    if (!section || !fields){
      console.log('Error finding section or fields on rendering section view');
      return this.modal("Error loading section");
    }

    this.$fbEl = this.$el.append('<div></div>');
    this.renderFormBuilder(fields);


    // Add in the CMS specific breadcrumb on top of the middle section
    this.$el.find('.middle').prepend(this.cmsBreadcrumb(path));
    // Add in the page title to the breadcrumb row
    this.$el.find('.middle').prepend('<h3>' + this.title + this.templates.$cms_editSectionButton() + '</h3>');

    // Add in the extra tabs for configure section and preview
    this.$el.find('.fb-tabs').append(this.templates.$cms_sectionExtraTabs());

    if (this.view === 'section'){
      this.$el.find('.fb-tab-content').append(this.templates.$cms_sectionExtraTabsContent());
      this.delegateEvents();
      // Select the active option
      this.$el.find('select[name=parentName]').val(parent);
    }

    // Move in preview div - gets moved out again on hide bt apps.cloud.cms.controller
    $('#app_preview').insertAfter('#cmsAppPreview div');
    $fw.client.tab.apps.manageapps.getController('apps.preview.controller').skipPost = true;
    $fw.client.tab.apps.manageapps.getController('apps.preview.controller').show();
    this.$el.find('#app_preview').show().width('100%');

    this.renderListFieldTables();
    this.renderFilePreviews();

    // Add in some instructions ontop of the form
    if (this.view === 'section'){
      var instructions;
      if(this.options.isAdministrator && this.options.isAdministrator === true){
        instructions = "Drag fields from the right to add fields. Click on a field to to edit it.";
      }else{
        instructions = "Edit the form to alter CMS data";
      }
      $(this.templates.$cms_editSectionInstructions({msg : instructions})).insertAfter(this.$el.find('.breadcrumb'));


      this.renderConfigureSection();

      this.$el.find('.middle').append(this.templates.$cms_section_savecancel());
    }


    $('.fb-field-wrapper .subtemplate-wrapper').click(function (){
      $('.fb-tabs li.configurefield a').trigger('click');
    });

    // Bug fix for multiple formbuilder views - unbind and re-bind the events
    var mv = this.fb.mainView;
    mv.$el.find('.fb-tabs a').unbind().on('click', $.proxy(mv.showTab, mv));

    return this;
  },
  renderConfigureSection : function(){
    // Setup the configure section tab
    var pathArray = this.section.path.split('.'),
    parent = pathArray[pathArray.length-2] || "Root";
    var parentOptions = this.collection.toHTMLOptions();
    parentOptions = ["<option value='' data-path='' >-Root</option>"].concat(parentOptions);
    parentOptions = parentOptions.join('');
    var configureSection = this.templates.$cms_configureSection({ parentOptions : parentOptions, name : this.section.name, path:this.section.path });
    $(configureSection).insertBefore(this.$el.find('.middle .breadcrumb'));
    this.$el.find('.middle').prepend();
  },
  renderFilePreviews : function(){
    var self = this;
    $(this.$el.find('.response-field-file')).each(function(){
      //self

      var container = $(this).find('.file_container'),
      name = $(container).data('name'),
      file = _.findWhere(self.section.fields, { name : name }),
      image;

      if (!file){
        return console.log('No file found with name: ' + name);
      }
      var img = $('<img class="img-rounded">');
      img.attr('src', self.collection.url + file.binaryUrl);
      $(container).html(img);

    });
  },
  renderListFieldTables : function(){
    var self = this;
    $(this.$el.find('.response-field-list')).each(function(){
      //self
      var name = $(this).find('.fieldlist_table').data('name'),
      listField = _.findWhere(self.section.fields, { name : name }),
      table;

      if (!listField){
        return console.log('No list field found with name: ' + name);
      }
      if(listField.fields.length > 0){
        table = new App.View.CMSTable({ fields : listField.fields, data : listField.data, host : self.collection.url });
        $(this).find('.fieldlist_table').html(table.render().$el);
      }

      if (!self.options.isAdministrator){
        $(this).find('.btn-listfield-structure').remove();
      }

    });
  },
  renderFormBuilder : function(fields){
    // Save some data massaging
    var self = this;
    this.$fbEl.empty();
    if (this.fb){
      if (this.fb.mainView && this.fb.mainView.collection){
        this.fb.mainView.collection.unbind();
        this.fb.mainView.collection.stopListening();
      }
      this.fb.stopListening();
    }

    // Also configure default FormBuilder field setup here to be inline with FH requirements
    Formbuilder.options.mappings.LABEL = "name";
    Formbuilder.options.mappings.VALUE = "value";
    Formbuilder.options.mappings.FIELD_TYPE = "type";
    Formbuilder.options.mappings.TYPE_ALIASES = {
      'text' : 'string'
    };
    this.fb = new Formbuilder(this.$fbEl, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: fields,
      eventFix : true,
      editStructure : this.options.editStructure || false,
      fields : [ 'text', 'paragraph', 'file', 'field_list' ]
    });

    this.bindFBEvents();
    this.bind('dirtied', function(){
      self.$el.find('.btn-cancel-changes').attr('disabled', false);
    });



    return this.fb;
  },
  bindFBEvents : function(){
    var self = this;
    // On editing an existing field, mark section as unsaved
    this.fb.mainView.collection.bind('change', function(field, collection){
      App.dispatch.trigger(CMS_TOPICS.SECTION_DIRTIED,field.toJSON());
      self.trigger('dirtied');
      var massaged = self.massageFieldFromFormBuilder(field),
      previousFields = self.sectionModel.get('fields'),
      id = field.get('_id') || field.cid,
      previous = _.findWhere(previousFields, { _id : id}),
      indexOfPrevious = previousFields.indexOf(previous);

      // Set a flag when we change the actual file element of a file field
      if (massaged.type === 'file'){
        if (field.changedAttributes().value){
          massaged.needsUpload = true;
          massaged.fieldEl = self.$el.find('input[type=file][data-_id="' + massaged._id + '"]');
        }
      }

      // Set the previous fields array at the index where we found the one
      // with matching _id to be our updated massaged field
      previousFields[indexOfPrevious] = massaged;
      self.sectionModel.set('fields', previousFields);

      if (field.get('type') === 'list'){
        self.renderListFieldTables();
      }

    });
    // On creating a field, we should also mark the section unsaved changes
    this.fb.mainView.collection.bind('add', function(field, collection){
      if (!field.has('_id')){
        field.set('_id', field.cid);
      }
      App.dispatch.trigger(CMS_TOPICS.SECTION_DIRTIED,field.toJSON());
      self.trigger('dirtied');
      var massaged = self.massageFieldFromFormBuilder(field),
      previousFields = self.sectionModel.get('fields');
      previousFields.push(massaged);
      self.sectionModel.set('fields', previousFields);
    });

    // On creating a field, we should also mark the section unsaved changes
    this.fb.mainView.collection.bind('remove', function(field, collection){
      App.dispatch.trigger(CMS_TOPICS.SECTION_DIRTIED,field.toJSON());
      self.trigger('dirtied');
      var previousFields = self.sectionModel.get('fields'),
      previous = _.findWhere(previousFields, { _id : field.get('_id')}),
      indexOfPrevious = previousFields.indexOf(previous);
      previousFields.splice(indexOfPrevious, indexOfPrevious+1);
      self.sectionModel.set('fields', previousFields);
    });
  },
  massageFieldsForFormbuilder : function(fields){
    _.each(fields, function(field){
      switch(field.type){
        case "string":
          delete field.fields;
          delete field.data;
          break;
        case "list":
          field.values = field.data || [];
          field.fields = field.fields || [];
          break;
        default:
          delete field.fields;
          delete field.data;
          break;
      }
      field.value = field.value || "";
    });

    return fields;
  },
  massageFieldFromFormBuilder : function(model){
    var field = model.toJSON();
    if (field.type === 'list'){
      // FormBuilder doesn't give us the values of lists, we need to retrieve them ourselves.
      // if a user has changed the list structure or data, we've already copied it to the model - so we can
      // just copy it directly..
      field.fields = field.fields || [];
      field.data = field.data || [];
    }
    field._id = field._id || model.cid;
    field.value = field.value || "";
    delete field.required;
    delete field.cid;
    delete field.field_options;
    return field;
  },
  onSectionSaveDraft : function(e){
    e.preventDefault();
    window.scrollTo(0,0);
    var self = this,
    vals = {};

    $(this.$el.find('#configureSectionForm').serializeArray()).each(function(idx, el){
      var curVal = el.value;
      if (curVal && curVal!== ""){
        vals[el.name] = el.value;
      }
    });


    this.sectionModel.set('name', vals.name);
    this.sectionModel.set('status', 'draft');

    this.collection.sync('draft', this.sectionModel.toJSON(), {
      success : function(){
        App.dispatch.trigger(CMS_TOPICS.AUDIT, "Section draft saved with values: " + JSON.stringify(self.section));
        App.dispatch.trigger(CMS_TOPICS.SECTION_SAVE_DRAFT,{"section":self.section}); // Notify the tree that we're saving the section so it can change colour
        setTimeout(function(){
          // Make this happen after render - TODO, not the tidiest
          self.trigger('message', 'Section updated successfully');
        }, 200);
      },
      error : function(err){
        self.trigger('message', err.toString(), 'danger');
      }
    });
    return false;
  },
  onCancelChanges: function(e){
    // TODO: this no longer works - probably need to fetch from serverside? :-( ~cian
    var disabled = $(e.target).attr('disabled');
    if (disabled === "disabled" || disabled === true){
      return;
    }
    var previous = this.sectionModel.previousAttributes();

    this.sectionModel.set(previous);

    this.trigger('message', 'Section changes discarded successfully');
    App.dispatch.trigger(CMS_TOPICS.AUDIT, "Section draft discarded");
    App.dispatch.trigger(CMS_TOPICS.SECTION_DISCARD_DRAFT,this.section);
    this.render();
    this.collection.sync('discarddraft', this.sectionModel.toJSON(), {
      success : function(){
        self.collection.fetch({reset : true, success : function(){
          setTimeout(function(){
            // Make this happen after render - TODO, not the tidiest
            self.trigger('message', 'Draft discarded successfully');
          }, 200);

        }});
      },
      error : function(){
        self.trigger('message', 'Error removing draft', 'danger');
      }
    });
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
    options = { collection : this.collection, section : this.options.section, listfield : fieldName, mode : mode, isAdministrator : this.options.isAdministrator };
    this.trigger('edit_field_list', options);
  },
  onEditSectionToggle : function(){
    this.$el.find('#configureSectionForm').toggleClass('active');
  }
});