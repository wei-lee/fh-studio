var App = App || {};
App.View = App.View || {};

App.View.CloudNotificationsTable = Backbone.View.extend({
  events: {
    'click table tr': 'showDetails'
  },

  indexes: {
    when: 0,
    eventClass: 2,
    eventType: 3,
    eventSeverity: 4,
    message: 5
  },

  render: function(){
    var self = this;
    if(!this.table_view){
      this.table_view = new App.View.DataTable({
        "aaData": this.collection.toJSON(),
        "aaSorting": [[6, 'desc']],
        "fnRowCallback": function(nTr, sData, oData, iRow, iCol) {
          // Append guid data
          $(nTr).attr('data-guid', sData.guid);
          self.rowRender(nTr, sData, oData);

        },
        "aoColumns": [{
          "sTitle": "TimeStamp",
          "mDataProp": "timestamp"
        },
        {
          "sTitle":"Updated By",
          "mDataProp": "updatedBy"
        },
        {
          "sTitle": "Event Category",
          "mDataProp": "category"
        }, {
          "sTitle": "Event Name",
          "mDataProp": "eventType"
        }, {
          "sTitle": "Severity",
          "mDataProp": "severity"
        }, {
          "sTitle": "Message",
          "mDataProp": "message"
        }, {
          "mDataProp": "sysCreated",
          "bVisible": false
        }],
        "bAutoWidth": false,
        "sPaginationType": 'bootstrap',
        "sDom": "<'row-fluid'<'span12'f>r>t<'row-fluid'<'pull-left'i><'pull-right'p>>",
        "bLengthChange": false,
        "iDisplayLength": self.options.displayLength || 10,
        "bInfo": true,
        "oLanguage": self.options.oLanguage || {}
      });
      this.table_view.render();
      this.collection.on("reset", function(collection){
        if(self.table_view && self.table_view.table){
          self.table_view.table.fnClearTable();
          if(collection.models.length > 0){
            self.table_view.table.fnAddData(collection.toJSON());
          }
        }
      });
      this.collection.on("add", function(model){
        if(self.table_view && self.table_view.table){
          self.table_view.table.fnAddData(model.toJSON());
        }
      });
      this.$el.html(this.table_view.el);
    }
    return this;
  },

  rowRender: function(row, data, index) {
    var self = this;
    var when_td = $('td:eq(' + self.indexes.when + ')', row);

    var timestamp = moment(data.timestamp, 'YYYY-MM-DD h:mm:ss:SSS').fromNow();
    var ts = $('<span>').text(timestamp);
    when_td.html(ts);

    when_td.attr('data-toggle', 'tooltip');
    when_td.attr('data-original-title', data.timestamp);
    when_td.tooltip();

    var severity = data.severity;
    var nh = "<span class='label label-" + self.getLabelClass(severity) + "'>" + severity + "</span>";
    $('td:eq(' + self.indexes.eventSeverity + ')', row).html(nh);
  },

  getLabelClass: function(severity) {
    if(severity.toLowerCase() === "error" ||severity.toLowerCase() === "fatal"){
      return "important";
    } else if(severity.toLowerCase() === "warning"){
      return "warning";
    } else {
      return "info";
    }
  },

  showDetails: function(e) {
    e.preventDefault();

    Handlebars.registerHelper("details", function(item){
      var ret = ['<div class="control-group"><label id="input_'+item.key+'_label" class="control-label insert-lang insert-help-icon" for="input'+item.key+'">'+item.key +'</label><div class="controls">'];
      if(item.key.toLowerCase() === "stacktrace"){
        ret.push('<textarea class="input-block-level uneditable-input" id="input'+item.key+'" rows="5" style="overflow:auto">'+item.value+'</textarea>');
      } else {
        ret.push('<span class="input-xlarge uneditable-input" id="input'+item.key+'">'+item.value+'</span>');
      }
      ret.push('</div></div>');
      return ret.join("");
    });
    var guid = $(e.currentTarget).closest('tr').data('guid');
    console.log("event guid is " +guid);
    var obj = this.collection.findWhere({guid: guid});
    console.log("obj is " + obj.toJSON());
    if(!obj){
      return;
    }
    console.log(obj.attributes);
    var html = $("#log-details-template").html();
    var template = Handlebars.compile(html);

    // Note: handlebars doesn't support iterating over an Object
    // so we create an array of the 'eventDetails' and use it in the template
    var context = {eventDetailsArray : []};
    context.eventDetailsArray.push({key: "Timestamp", value: obj.attributes.timestamp});
    context.eventDetailsArray.push({key: "Event Category", value: obj.attributes.category});
    context.eventDetailsArray.push({key: "Event Name", value: obj.attributes.eventType});
    context.eventDetailsArray.push({key: "Severity", value: obj.attributes.severity});


    var hasStacktrace = false;

    for (var prop in obj.attributes.eventDetails){
      if (obj.attributes.eventDetails.hasOwnProperty(prop)){
        if(prop.toLowerCase() === "stacktrace"){
          hasStacktrace = true;
        }
        var value = obj.attributes.eventDetails[prop];
        if(typeof value === "string"){
          context.eventDetailsArray.push({
            'key' : js_util.capitaliseWords(prop),
            'value' : obj.attributes.eventDetails[prop]
          });
        } else if(typeof value === "object"){
          for(var valueProp in value){
            if(value.hasOwnProperty(valueProp)){
              context.eventDetailsArray.push({
                'key' : js_util.capitaliseWords(valueProp),
                'value' : value[valueProp]
              });
            }
          }
        }

      }
    }

    var detailsHtml = template(context);
    if($fw && $fw.client){
      $fw.client.lang.insertLangForContainer($('#modal_details').html(detailsHtml), "event_details", true);
    }
    if(hasStacktrace){
      $('#modal_details').addClass("large").modal({});
    } else {
      $('#modal_details').removeClass("large").modal({});
    }

  }
});


App.View.CloudNotifications = Backbone.View.extend({
  events: {
    'click .filterEventsBtn' : 'filterEvents',
    'click .filterResetBtn' : 'resetFilters',
    'click .reloadBtn': 'reload'
  },



  initialize: function() {
    var html = $("#cloud-notifications-template").html();
    var template = Handlebars.compile(html);
    this.$el.show().html(template());
    this.collection.bind('sync', function(){
      this.render();
    }, this);
    this.collection.fetch();
  },

  reload: function(e){
    if(e){
      e.preventDefault();
    }
    this.collection.fetch();
  },

  render: function() {
    var self = this;
    if(!this.filtered_collection){
      this.filtered_collection = this.collection.clone();
    } else {
      this.filtered_collection.reset(this.collection.toJSON());
    }
    if(!this.table_view){
      this.$table_container = this.$el.find('.system_log');
      this.table_view = new App.View.CloudNotificationsTable({
        collection: self.filtered_collection
      });
      this.$table_container.append(this.table_view.render().el);
    }
    this.$table_container.find(".span12:first").find(".filter_options").remove().end().append(this.renderFilters());
  },

  renderFilters: function(){
    var attrs = this.collection.eventFilters;
    var filterHtml = $('#cloud-notifications-filter-template').html();
    var template = Handlebars.compile(filterHtml);
    var filterEl = $(template());
    for(var attr in attrs){
      if(attrs.hasOwnProperty(attr)){
        var options = attrs[attr];
        var sle = filterEl.find("." + attr + "_filters");
        sle.empty();
        sle.tooltip({trigger: "hover"});
        sle.append("<option value='all' selected> All </option>");
        for(var i=0;i<options.length;i++){
          sle.append("<option value='"+options[i]+"'>" + options[i] + "</options>");
        }
      }
    }
    return filterEl;
  },

  resetFilters: function(e){
    e.preventDefault();
    this.$el.find("select").val('all');
    this.filterEvents(e);
  },

  filterEvents: function(e){
    e.preventDefault();
    var categoryFilter = this.$el.find(".eventCategories_filters").val();
    var eventFilter = this.$el.find(".eventNames_filters").val();
    var severityFilter = this.$el.find(".eventSeverities_filters").val();
    var filters = {};
    var hasFilter = false;
    if(categoryFilter && categoryFilter != "all"){
      filters.category = categoryFilter;
      hasFilter = true;
    }
    if(eventFilter && eventFilter != "all"){
      filters.eventType = eventFilter;
      hasFilter = true;
    }
    if(severityFilter && severityFilter != "all"){
      filters.severity = severityFilter;
      hasFilter = true;
    }

    if(hasFilter){
      var data = this.collection.where(filters);
      this.filtered_collection.reset(data);
    } else {
      this.filtered_collection.reset(this.collection.toJSON());
    }

  }

});