App.View.LineChart = App.View.Chart.extend({
  initialize: function(options) {
    options = $.extend(true, {}, {
      chart: {
        type: "line"
      },
      credits: {
        enabled: false
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
                  filename: 'chart',
                    width: 2000
                });
              }
            }, {
              text: 'Export to PNG',
              onclick: function() {
                var self = this;
                this.exportChart({
                  type: 'image/png',
                  filename: 'chart',
                    width: 2000
                });
              }
            }, {
              text: 'Export to CSV',
              onclick: function() {
                console.log('Exporting to CSV.');

                // For all series
                var csv = [];

                $.each(this.options.series, function(i, series) {
                  csv.push(series.name + "_Timestamp," + series.name + "_Value");
                  $.each(series.data, function(i, item) {
                    csv.push(item.join(","));
                  });
                });

                csv = csv.join("\n");

                // Export
                $('#export_form').remove();

                $('body').append('<form name="export_form" id="export_form" method="post" action="' + Constants.TRIGGER_DOWNLOAD_URL + '"><input type="hidden" name="content" value=""><input type="hidden" name="content_type" value=""><input type="hidden" name="filename" value=""><input type="submit" name="export_json_submit" id="export_json_submit" value="Export" style="display: none"></form>');
                $("#export_form input[name=content]").val(csv);
                $("#export_form input[name=content_type]").val('csv');
                $("#export_form input[name=filename]").val('export.csv');
                $('#export_form').submit();
              }
            },
            null, null]
          }
        }
      }
    }, options);

    App.View.Chart.prototype.initialize.call(this, options);
  }
});