App.View.DataBrowserTable = App.View.DataBrowserView.extend({
  templates : {
    dataviewEditButton : '#dataviewEditButton',
    dataviewSaveCancelButton : '#dataviewSaveCancelButton'
  },
  events : {
    'click .btn-save' : 'onRowSave',
    'click .btn-cancel' : 'onRowCancel',
    'dblclick tr.trow' : 'rowClicked',
    'click .td-checkbox input[type=checkbox]' : 'onRowSelection'
  },
  headings: [],
  types : [],
  editTd : $('<td class="td-edit readOnly"></td>'),
  editable : true,
  selectable : true,
  initialize : function(){
    this.collection = DataBrowser.Collections.CollectionData;
    this.collection.bind('reset', this.render, this);
    this.collection.bind('redraw', this.renderCollections);
    this.compileTemplates();
  },
  render: function() {
    var data = this.collection.toJSON();
    var table = this.buildTable(data, false);
    table.addClass('databrowser table table-condensed table-bordered');
    this.$el.append(table);
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
    editButton = $(this.templates.$dataviewEditButton()),
    thead;

    if (entries.length <= 0){
      return table;
    }

    // Add in the collection name to the table element
    table.attr('data-collection', entries[0].type);

    if (this.editable){
      $(editButton).on('click', function(e){
        self.editRow.apply(self, [e]);
      });

      this.editTd.append(editButton);
    }

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
      var heading = this.headings[k],
      type = this.types[k],
      value = row.hasOwnProperty(heading) ? row[heading] : '';
      $(rowEl).append('<td data-field="' + heading + '" data-type="' + type + '" class="field field-' + heading + '"><span>' + value  + '</span></td>');
    }
    if (this.editable){
      $(rowEl).append(this.editTd.clone(true));
    }
    return rowEl;
  },
  deleteRow : function(e){
  //TODO: Wire this up to some UI
    var self = this,
    guid = $(this).parents('tr').attr('id'),
    collection = $(this).parents('table').attr('data-collection');
    app.doAct('delete', { password : app.password, collection : collection, guid : guid },
    function(err, res){
      if (err){
        alert("Error deleting row");
      }
      alert("Row deleted successfully");
    });
  },
  rowClicked : function(e){
    this.editRow(e);
  },
  editRow : function(e){
    var self = this,
    element = e.target,
    tr = $(element).parents('tr'),
    guid = tr.attr('id'),
    collection = $(element).parents('table').attr('data-collection'),
    saveCancelButton = $(this.templates.$dataviewSaveCancelButton());

    tr.addClass('editing');

    // Hide edit button, show save button

    var editButton = tr.find('.td-edit .btn-edit').hide();
    tr.find('.td-edit').append(saveCancelButton);


    tr.children('td.field').each(function(i, field){
      var type = $(field).attr('data-type'),
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
      input.attr('name', $(field).attr('data-field'));
      input.css('width', $(field).width());
      input.val(span.html());
      $(field).append(input);
      span.hide();
    });

  },
  onRowSave : function(e){
    var el = e.target,
    updatedObj = {},
    tr = $(el).parents('tr');

    tr.children('td.field').each(function(i, fieldtd){
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
    this.onRowCancel(e);
    //TODO: Save this back to mongo
  },
  onRowCancel: function(e){
    var el = e.target,
    tr = $(el).parents('tr'),
    tds = tr.children('td');

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

    tr.removeClass('editing');
  },
  onRowSelection : function(e){
    var el = e.target,
    tr = $(el).parents('tr');
    if($(el).attr('checked')) {
      tr.addClass('info');
    }else{
      tr.removeClass('info');
    }
  }
});