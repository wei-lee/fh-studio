App.View.DataBrowserTable = App.View.DataBrowserView.extend({
  templates : {
    databrowserNavbar : '#databrowserNavbar',
    databrowserDataViewBarItems: '#databrowserDataViewBarItems',
    dataviewEditButton : '#dataviewEditButton',
    dataviewSaveCancelButton : '#dataviewSaveCancelButton',
    dataviewPagination : '#dataviewPagination',
    databrowserDataViewBarCollectionMenuItem : '#databrowserDataViewBarCollectionMenuItem'
  },
  events : {
    'click table.databrowser .btn-save' : 'onRowSave',
    'click table.databrowser .btn-cancel' : 'onRowCancel',
    'dblclick table.databrowser tr.trow' : 'onRowDoubleClick',
    'click table.databrowser tr.trow' : 'onRowClickProxy',
    'click table.databrowser .td-checkbox input[type=checkbox]' : 'onRowSelection',
    'keyup table.databrowser td.field input' : 'onRowDirty',
    'change table.databrowser td.field select' : 'onRowDirty',
    'click table.databrowser tr .btn-edit-inline' : 'onEditRow',
    'click table.databrowser tr .btn-delete-row' : 'onRowDelete',
    'click .btn-add-row' : 'onAddRow'
  },
  headings: undefined,
  types : undefined,
  editable : true,
  selectable : true,
  dblClicked: undefined,
  initialize : function(options){
    this.model = options.model;
    this.collections = options.collections;

    this.collection = DataBrowser.Collections.CollectionData;
    this.collection.bind('reset', this.render, this);
    this.collection.bind('sync', this.render, this);
    this.collection.fetch({reset : true, collection : this.model.get('name')});

    //this.collection.bind('redraw', this.renderCollections);
    this.compileTemplates();
  },
  render: function() {
    this.$el.empty();

    var collectionsHTML = [];
    for (var i=0; i<this.collections.length; i++){
      var c = this.collections[i];
      collectionsHTML.push(this.templates.$databrowserDataViewBarCollectionMenuItem(c));
    }

    var navItems = this.templates.$databrowserDataViewBarItems({collections : collectionsHTML.join('')}),
    nav = this.templates.$databrowserNavbar({ brand : this.model.get('name'), class : 'databrowsernav', baritems : navItems }),
    data = this.collection.toJSON(),
    table = this.buildTable(data, false);

    table.addClass('databrowser table table-condensed table-bordered');

    this.$el.append(nav);
    this.$el.append(table);
    this.$el.append(this.templates.$dataviewPagination());
    return this;
  },
  /*
   Draws a HTML table from some data
   This is part of the FeedHenry mBaaS suite repurposed for this portal
   */
  buildTable : function(entries){
    var self = this,
    table = $('<table></table>'),
    tbody = $('<tbody></tbody>'),
    thead;

    if (entries.length <= 0){
      return table;
    }

    // Add in the collection name to the table element
    table.data('collection', this.model.get('name'));

    thead = this.buildHeadings(entries);

    // Iteration 2: We know every possible heading, now we can draw every table cell, even the important blanks
    for (var j=0; j<entries.length; j++){
      var row = this.row(entries[j]);
      tbody.append(row);
    }

    table.append(thead);
    table.append(tbody);
    return table;
  },
  buildHeadings : function(entries){
    this.headings = [];
    this.types = [];
    // Iteration 1: Build a picture of every possible heading, append the THes
    var thead = $('<thead></thead>'),
    theadtr = $('<tr></tr>');

    if (this.selectable){
      theadtr.append('<th data-type="" class="th-checkbox readOnly"></th>');
    }

    for (var i=0; i<entries.length; i++){
      var row = entries[i].fields;
      if (!row){
        continue;
      }
      for (var key in row){
        if (row.hasOwnProperty(key)){
          var heading = key,
          type = typeof row[key];
          if (this.headings.indexOf(heading)===-1){
            theadtr.append('<th data-type="' + type + '" class="th-' + heading + '">' + heading + '</th>');
            this.headings.push(heading);
            this.types.push(type);
          }
        }
      }
    }
    // TH appends not working
    if (this.editable){
      theadtr.append('<th class="th-edit"></th>');
    }
    thead.append(theadtr);
    return thead;
  },
  row : function(document){
    // For this entry, append the TDs
    var row = document.fields,
    guid = document.guid;

    var rowEl = $('<tr class="trow"></tr>').attr('id', guid);

    if (this.selectable){
      $(rowEl).append('<td class="td-checkbox"><input type="checkbox"></td>');
    }

    for (var k=0; k<this.headings.length; k++){
      var td = $("<td></td>"),
      heading = this.headings[k],
      type = this.types[k],
      value = '';

      td.data('field', heading);
      td.data('type', type);
      td.addClass('field');
      td.addClass('field-' + heading);
      if (row.hasOwnProperty(heading)){
        value = row[heading];
      }else{
        td.addClass('emptyfield');
      }
      td.append('<span>' + value  + '</span>');

      $(rowEl).append(td);
    }
    if (this.editable){
      var editButton = $(this.templates.$dataviewEditButton());
      $(rowEl).append(editButton);
    }
    return rowEl;
  },
  deleteRow : function(tr, cb){
    var self = this,
    guid = tr.attr('id'),
    collectionName = tr.parents('table').data('collection'),
    model = this.collection.get(guid);
    this.collection.remove(model, {success : function(resp){
      cb(null, {ok : true});
    }});

  },
  /*
    Takes a reference to a TR and sets it to be editable
   */
  editRow : function(tr){
    var self = this,
    guid = tr.attr('id'),
    collection = $(tr).parents('table').data('collection'),
    saveCancelButton = $(this.templates.$dataviewSaveCancelButton());

    tr.addClass('editing');

    // Hide edit button, show save button

    var editButton = tr.find('.td-edit .btn-edit').hide();
    tr.find('.td-edit').append(saveCancelButton);


    tr.children('td.field').each(function(i, field){
      var type = $(field).data('type'),
      span = $(field).children('span'),
      input;

      if (!type || !span){
        return;
      }

      switch(type.toLowerCase()){
        case "boolean":
          input = $('<select><option value="true">true</option><option value="false">false</option></select>');
          break;
        default:
          input = $('<input type="text">');
          break;
      }
      input.attr('name', $(field).data('field'));
      input.css('width', $(field).width());
      input.val(span.html());
      $(field).append(input);
      span.hide();
    });

  },
  cancelRow : function(tr){
    // If it's a row that the user decided not to create, nuke it
    if (tr.hasClass('newrow')){
      tr.remove();
    }

    var tds = tr.children('td');
    tr.find('.btn-edit').show();
    tr.find('.btn-savecancel').remove();
    tr.find('.btn-group').show();

    tds.each(function(){
      if (!$(this).hasClass('readOnly') && $(this).children('span').length>0){
        $(this).children('span').show();
        $(this).children('input, select').remove();
      }else{
        $(this).children().show();
      }
    });

    tr.removeClass('editing dirty');
  },
  /*
    Cancels every row but this one
   */
  cancelOtherRows : function(clickedRow){
    var self  = this,
    editingRows = $('table.databrowser tr.editing'),
    dirtyRows = [];
    editingRows.each(function(){
      if ($(this).attr('id') !== $(clickedRow).attr('id')){
        if ($(this).hasClass('dirty')){
          dirtyRows.push(this);
        }else{
          self.cancelRow($(this));
        }
      }
    });
    if (dirtyRows.length > 0){
      this.onDirtyRowsCancel(dirtyRows);
    }
  },
  onDirtyRowsCancel : function(dirtyRows){
    // TODO: Modal this - not window.confirm, that's nasty..
    if (window.confirm("You have unsaved edits to one or more rows - are you sure you want to discard?")){
      for (var i=0; i<dirtyRows.length; i++){
        this.cancelRow($(dirtyRows[i]));
      }
    }else{
      return;
    }
  },
  onRowSave : function(e){
    e.stopPropagation();
    var el = e.target,
    updatedObj = {},
    tr = $(el).parents('tr'),
    table = $(tr).parents('table'),
    collectionName = table.data('collection'),
    guid = tr.attr('id'),
    model = this.collection.get(guid);

    tr.children('td.field').each(function(i, fieldtd){
      if ($(fieldtd).hasClass('emptyfield') && !$(fieldtd).hasClass('dirty')){
        return;
      }
      $(fieldtd).removeClass('dirty emptyfield');

      var curInp = $(fieldtd).children('input, select'),
      val = curInp.val(),
      name = curInp.attr('name'),
      span = $(fieldtd).children('span');

      if (curInp.attr('type') === 'select'){
        val = (val === "true");
      }

      $(span).html(val).show();
      updatedObj[name] = val;
    });

    function _succ(){
      self.cancelRow(tr);
    }

    // If this is a new row, it's a create we need to do - not update
    if (!guid || $(tr).hasClass('newrow')){
      model = this.collection.create({fields : updatedObj}, { success : _succ });
    }else{
      model.set('fields', updatedObj);
      model.save(null, null, { success : _succ });
    }

    //TODO: Save this back to mongo
  },
  // Cancel button pressed in the studio - find the relevant TR and pass it to the cancel function
  onRowCancel: function(e){
    e.stopPropagation();
    var el = e.target,
    tr = $(el).parents('tr');
    if (tr.hasClass('dirty')){
      this.onDirtyRowsCancel([tr]);
    }else{
      this.cancelRow(tr);
    }
  },
  onRowSelection : function(e){
    e.stopPropagation();
    var el = e.target,
    tr = $(el).parents('tr');
    if($(el).attr('checked')) {
      tr.addClass('info');
    }else{
      tr.removeClass('info');
    }
  },
  onRowDoubleClick : function(e){
    var self = this,
    el = e.target;
    setTimeout(function(){
      self.dblClicked = false;
      $(el).find('input, select').focus(); // Focus the  freshly created field we double clicked
    }, 200);
    this.onEditRow(e);
    this.dblClicked = true;
  },
  onEditRow: function(e){
    e.stopPropagation();

    // Remove open class for the button group we just clicked
    $(e.target).parents('.btn-group.open').removeClass('open');


    var self = this,
    element = e.target,
    tr = $(element).parents('tr');

    if (tr.hasClass('editing')){
      return;
    }
    this.editRow($(tr));
    this.cancelOtherRows(tr);
  },
  /*
    Proxys onclick events to ensure they aren't triggered if we doubleclick
   */
  onRowClickProxy: function(e){
    var self = this,
    ev = e;
    setTimeout(function(){
      if (self.dblClicked){
        return;
      }
      self.dblClicked = false;
      self.onRowClick(ev);
    }, 100);
  },
  onRowClick : function(e){
    var clickedRow = $(e.target).parents('tr');
    this.cancelOtherRows(clickedRow);
  },
  onRowDirty : function(e){
    var td = $(e.target).parents('td'),
    tr = $(e.target).parents('tr');
    tr.addClass('dirty warning');
    td.addClass('dirty');
  },
  onRowDelete : function(e){
    e.stopPropagation();
    var el = e.target,
    tr = $($(el).parents('tr'));
    //TODO: Modal confirm
    if (window.confirm("Are you sure you want to delete this row?")){
      this.deleteRow(tr, function(err, res){
        if (err){
          return alert(err); //TODO: Modal this or some such..
        }
        tr.remove();
      });
    }
  },
  onAddRow : function(e){
    var emptyRow = this.row({ fields : {}}),
    tbody = this.$el.find('table.databrowser tbody');
    emptyRow.addClass('newrow');
    tbody.prepend(emptyRow);

    this.editRow(emptyRow);// is this a ref to the row in-situe?
  }
});