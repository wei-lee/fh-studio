var Stats = Stats || {};
Stats.View = Stats.View || {};

Stats.View.Chart = Class.extend({
  controller: null,
  model: null,
  series: null,
  series_name: null,
  renderTo: null,
  liveChart: false,
  options: {},
  highChart: null,
  showLastUpdated: false,
  buffer:[],
  showDataTable: false,
  maxValue: null,

  init: function(params) {
    this.controller = params.controller;
    this.model = params.model;
    this.series = params.series.all_series;
    this.series_name = params.series.series_name || params.series_name;
    this.formatted_name = params.formatted_name;
    this.renderTo = params.renderTo || '#' + this.series_name + '_list_item .chart_container';
    if(params.live){
      this.liveChart = true;
    }
    if(params.options){
      this.options = params.options;
    }
    if(params.showLastUpdated){
      this.showLastUpdated = params.showLastUpdated;
    }
    if(params.showDataTable){
      this.showDataTable = params.showDataTable;
    }
    if(params.maxValue){
      this.maxValue = params.maxValue;
    }
    console.log('Initialising chart view');
  },

  render: function() {
    var self = this;

    // Reset chart container
    var container = $(self.renderTo);
    container.empty();

    var series_data = this.series;
    var series_name = this.series_name;

    var chartOpts = {
      renderTo: container[0],
      zoomType: self.options.zoomType || 'x',
      spacingRight: 20,
      events: {
        'selection': function(event){
          container.find("div.resetBtnContainer").removeClass("hidden");
          if(self.showDataTable && self.selectTableRows){
            self.selectTableRows(event.xAxis[0].min, event.xAxis[0].max);
          }
        }
      }
    };

    if(this.liveChart){
      chartOpts.events.load = function(){
        if(self.model.addListener){
          self.updateListener = function(data){
            var series = chart.series[0];
            var dataToAdd = data[self.series_name].series[self.series_name].data;
            //if(container.parents(":hidden").length > 0){
              //this view is hidden, do not add the point to the chart as it may cause the labels of yAxis to be missing.
              //instead, put it in the buffer
              //console.log("chart is hidden, add to the buffer. name: " + self.series_name);
              //self.buffer = self.buffer.concat(dataToAdd);
            //} else {
              if(self.buffer.length > 0){
                dataToAdd = self.buffer.concat(dataToAdd);
              }
              console.log("chart is showing, add points to the chart. name: "+self.series_name+" Total points: " + dataToAdd.length);
              for(var p=0;p<dataToAdd.length;p++){
                series.addPoint(dataToAdd[p], false, false);
              }
              chart.redraw();
              if(self.showDataTable){
                self.addDataTableRow(dataToAdd);
              }
              self.buffer = [];
              if(self.showLastUpdated){
                self.updateLastUpdated(container);
              }
            //}
          };
          self.model.addListener(self.updateListener);
        }
      };
    }

    var chart = new Highcharts.Chart({
      credits: {
        enabled: false
      },
      chart: chartOpts,
      legend: self.options.legend || {
        layout: 'horizontal',
        verticalAlign: 'top',
        backgroundColor: '#FFFFFF',
        shadow: true
      },
      scrollbar: {
        enabled: true
      },
      navigator : self.options.navigator || {
        enabled : true
      },
      rangeSelector: self.options.rangeSelector || {
        enabled: false
      },
      title: {
        text: self.options.title || series_name
      },
      xAxis: {
        minPadding: 1,
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
          month: '%e. %b',
          year: '%b'
        },
        range: 600 * 1000 // 10 minutes
      },
      exporting: {
        buttons: {
          exportButton: {
            menuItems: [{
              text: 'Export to PDF',
              onclick: function() {
                var self = this;
                this.exportChart({
                  type: 'application/pdf',
                  filename: self.model_series.name
                });
              }
            }, {
              text: 'Export to PNG',
              onclick: function() {
                var self = this;
                this.exportChart({
                  type: 'image/png',
                  filename: self.model_series.name
                });
              }
            }, {
              text: 'Export to CSV',
              onclick: function() {
                console.log('Exporting to CSV.');
                var model = this.view.model;
                var filename = model.name + '.csv';

                // Call back to the model to export this series as CSV
                var csv = this.view.model.getCSVForSeries(this.model_series);
                var content_type = 'csv';
                this.view.controller.doExport(filename, csv, content_type);
              }
            },
            null, null]
          }
        }
      },
      yAxis: self.options.yAxis || {
        title: {
          text: 'values'
        },
        min: 0
      },
      tooltip: self.options.tooltip || {
        formatter: function() {
          var timestamp = moment(this.x).format("MMM D, HH:mm:ss");
          return '<b>' + this.series.name + '</b><br/>' + timestamp + ': ' + this.y;
        }
      },
      series: series_data
    });

    chart.view = self;
    chart.model_series = series_data;

    if(self.showLastUpdated){
      self.addLastUpdated(container);
    }

    if(self.showDataTable){
      self.addDataTable(container.parent());
    }

    self.addResetZoomButton(container);

    if(!self.liveChart){
      self.addRefreshButton(container.closest('li').find('h3'));
    } else {
      //To fix a bug where if the chart become hidden before the first live point is added, there will be a DOM error thrown
      chart.redraw();
    }

    self.highChart = chart;
    self.startXValue = chart.xAxis[0].getExtremes().min;

    $(window).bind('resize', function(){
      self.resizeView(container);
    });

  },

  destroy: function(){
    var self = this;
    if(this.highChart && typeof this.highChart.destroy === "function"){
      try{
        this.highChart.destroy();
      }catch(e){

      }

    }
    this.highChart = undefined;
    if(self.updateListener){
      if(self.model.removeListener){
        self.model.removeListener(self.updateListener);
      }
    }

    $(this.renderTo).empty();
    if(self.dataTable){
      self.dataTable.fnDestroy();
      $(self.renderTo).parent().find(":not(div.stats_area)").remove();
    }
  },

  addRefreshButton: function (container) {
    var self = this;

    // remove refresh buttons from all other items
    container.closest('ul').find('li h3 button').remove();

    // add refresh button to current item
    var refreshButton = $('<button>', {
      "class": "btn pull-right",
      "text": Lang.stats_refresh_button
    });
    refreshButton.bind('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.controller.show();
    });
    container.append(refreshButton);
  },

  addResetZoomButton: function(container){
    var self = this;
    container.find("div.resetBtnContainer").remove();
    var wrapper = $("<div>", {"class":"resetBtnContainer row-fluid"});
    var resetBtn = $("<button>", {"class":"btn pull-right", "text": Lang.reset_zoom_button});
    wrapper.append(resetBtn);
    container.prepend(wrapper);
    resetBtn.unbind('click').bind('click', function(e){
      self.highChart.xAxis[0].setExtremes(self.startXValue);
      //self.highChart.redraw();
      self.selectTableRows("", "");
    });
  },

  addDataTable: function(container){
    var self = this;
    var data = self.series[0].data;
    var wrapper = $("<div>", {"class":"row-fluid data_table_wrapper"});
    var table = $("<table>", {"class":"table table-bordered table-striped", "cellpadding": 0, "cellspacing": 0});
    var tableColumn = [{'sTitle':'Time', 'sType':'date'}, {'sTitle':'Value'}, {'sTitle':'Percent'}, {'sTitle':'TS','bVisible':false, 'sType':'date_range'}];
    var tableData = [];
    for(var i=0;i<data.length;i++){
      tableData.push([moment(data[i][0]).format("hh:mm:ss a"), data[i][1], parseFloat(data[i][1]/self.maxValue*100), data[i][0]]);
    }
    wrapper.append(table);
    container.append(wrapper);
    table.dataTable({
      "bDestroy": true,
      "bAutoWidth": false,
      "sPaginationType": 'bootstrap',
      "sDom": "<'row-fluid'<'span12'>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "bLengthChange": true,
      "iDisplayLength": 20,
      "bInfo": true,
      "aaData": tableData,
      "aoColumns": tableColumn,
      fnRowCallback: function(nRow, aData, iDisplayIndex){
        if(self.series_name.toLowerCase().indexOf("cpu") > -1){
          $('td:eq(1)', nRow).html(aData[1] + "%");
        } else {
          $('td:eq(1)', nRow).html(aData[1]/1000 + "MB");
        }
        $('td:eq(2)', nRow).html("<div class='progress' style='position: relative'><span class='progress_bar_text'>"+js_util.toFixed(aData[2],2)+"%</span><div class='bar' style='width:"+ aData[2] + "%" + " '></div></div>");
      }
    });
    container.append($("<input>", {id:"table_min_filter", "class":'hidden', "type":"text"})).append($("<input>", {id:"table_max_filter","class":'hidden', "type":"text"}));
    self.dataTable = table;
  },

  addDataTableRow: function(data){
    var self = this;
    if(self.dataTable){
      for(var i=0;i<data.length;i++){
        self.dataTable.fnAddData([moment(data[i][0]).format("hh:mm:ss a"), data[i][1], parseFloat(data[i][1]/self.maxValue*100), data[i][0]]);
      }

    }
  },

  selectTableRows: function(minTime, maxTime){
    var self = this;
    var container = $(self.renderTo).parent();
    container.find('#table_min_filter').val(minTime);
    container.find('#table_max_filter').val(maxTime);
    self.dataTable.fnDraw();
  },

  addLastUpdated: function(container){
    var self = this;
    var updateExtremesSpan = $("<label>", {"class":"checkbox"});
    updateExtremesSpan.append("<input id='updateExtremesCheck' type='checkbox'> Use the max value from dataset");
    var lastUpdated = $("<span>", {"class":'pull-right last_update_text', text:"Last Updated: " + moment(this.model.lastUpdated()).format("h:mm:ss a")});
    var wrapper = $("<form>", {"class":"row-fluid form-inline"});
    wrapper.append(updateExtremesSpan).append(lastUpdated);
    container.append(wrapper);
    $('#updateExtremesCheck', container).unbind("change").change(function(e){
      if($(this).is(":checked")){
        self.highChart.yAxis[0].setExtremes(0, self.highChart.yAxis[0].getExtremes().dataMax, true);
      } else {
        self.highChart.yAxis[0].setExtremes(0, self.maxValue, true);
      }
    });
  },

  updateLastUpdated: function(container){
    container.find(".last_update_text").text("Last Updated: " + moment(this.model.lastUpdated()).format("h:mm:ss a"));
  },

  resizeView: function(container){
    if($(container).parents(':hidden').length === 0 ){
      //the view is not hidden, resize the chart
      if(this.highChart){
        this.highChart.setSize(container.width(), container.height(), false);
      }
    }
  }
});

$(document).ready(function(){
//Add rangeFilterFunction to dataTable, based on example here: http://www.datatables.net/plug-ins/filtering#range_numbers
  $.fn.dataTableExt.afnFiltering.push(
      function( oSettings, aData, iDataIndex ) {
        if(oSettings.aoColumns && oSettings.aoColumns.length === 4 && oSettings.aoColumns[3].sType === "date_range"){
          var columnIndex = 3;
          var container = $('#cloudresources_container').find('.pill-pane.active');
          var minEl = container.find('#table_min_filter');
          var maxEl = container.find('#table_max_filter');
          if(minEl.length === 1 && maxEl.length === 1 && minEl.val() !== "" && maxEl.val() !== ""){
            var minValue = $(minEl, container).val()*1;
            var maxValue = $(maxEl, container).val()*1;
            var currentValue = aData[columnIndex] == "-" ? 0 : aData[columnIndex]*1;

            if ( minValue ==="" && maxValue === "" )
            {
              return true;
            }
            else if ( minValue === "" && currentValue < maxValue )
            {
              return true;
            }
            else if ( minValue < currentValue && "" === maxValue )
            {
              return true;
            }
            else if ( minValue < currentValue && currentValue < maxValue )
            {
              return true;
            }
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      }
  );
});
