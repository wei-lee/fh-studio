var UserAdmin = UserAdmin || {};

UserAdmin.Controller = Class.extend({
  models: {
    user: "$fw.client.model.User"
  },
  views: {
    users: "#useradmin_user_list"
  },
  config: null,

  init: function(params) {
    var self = this;
    var params = params || {};
    this.config = params.config || null;
    this._setupDataTables();
  },

  showUsersList: function() {
    $(this.views.users).show();
    eval(this.models.user).list(function(res) {
      console.log(res);
    }, function(err) {
      console.error(err);
    });

    $('#useradmin_users_table').dataTable({
      "sDom": "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
      "sPaginationType": "bootstrap",
      "oLanguage": {
        "sLengthMenu": "_MENU_ records per page"
      },
      "aaData": [
        ["Trident", "Internet Explorer 4.0", "Win 95+", 4, "X"],
        ["Trident", "Internet Explorer 5.0", "Win 95+", 5, "C"],
        ["Trident", "Internet Explorer 5.5", "Win 95+", 5.5, "A"],
        ["Trident", "Internet Explorer 6.0", "Win 98+", 6, "A"],
        ["Trident", "Internet Explorer 7.0", "Win XP SP2+", 7, "A"],
        ["Gecko", "Firefox 1.5", "Win 98+ / OSX.2+", 1.8, "A"],
        ["Gecko", "Firefox 2", "Win 98+ / OSX.2+", 1.8, "A"],
        ["Gecko", "Firefox 3", "Win 2k+ / OSX.3+", 1.9, "A"],
        ["Webkit", "Safari 1.2", "OSX.3", 125.5, "A"],
        ["Webkit", "Safari 1.3", "OSX.3", 312.8, "A"],
        ["Webkit", "Safari 2.0", "OSX.4+", 419.3, "A"],
        ["Webkit", "Safari 3.0", "OSX.4+", 522.1, "A"]
      ],
      "aoColumns": [{
        "sTitle": "Engine"
      }, {
        "sTitle": "Browser"
      }, {
        "sTitle": "Platform"
      }, {
        "sTitle": "Version"
      }, {
        "sTitle": "Grade"
      }]
    });
  },

  // TODO: Move out of here into common class
  _setupDataTables: function() { /* Default class modification */
    $.extend($.fn.dataTableExt.oStdClasses, {
      "sWrapper": "dataTables_wrapper form-inline"
    });

    /* API method to get paging information */
    $.fn.dataTableExt.oApi.fnPagingInfo = function(oSettings) {
      return {
        "iStart": oSettings._iDisplayStart,
        "iEnd": oSettings.fnDisplayEnd(),
        "iLength": oSettings._iDisplayLength,
        "iTotal": oSettings.fnRecordsTotal(),
        "iFilteredTotal": oSettings.fnRecordsDisplay(),
        "iPage": Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
        "iTotalPages": Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
      };
    }

    /* Bootstrap style pagination control */
    $.extend($.fn.dataTableExt.oPagination, {
      "bootstrap": {
        "fnInit": function(oSettings, nPaging, fnDraw) {
          var oLang = oSettings.oLanguage.oPaginate;
          var fnClickHandler = function(e) {
              e.preventDefault();
              if (oSettings.oApi._fnPageChange(oSettings, e.data.action)) {
                fnDraw(oSettings);
              }
              };

          $(nPaging).addClass('pagination').append('<ul>' + '<li class="prev disabled"><a href="#">&larr; ' + oLang.sPrevious + '</a></li>' + '<li class="next disabled"><a href="#">' + oLang.sNext + ' &rarr; </a></li>' + '</ul>');
          var els = $('a', nPaging);
          $(els[0]).bind('click.DT', {
            action: "previous"
          }, fnClickHandler);
          $(els[1]).bind('click.DT', {
            action: "next"
          }, fnClickHandler);
        },

        "fnUpdate": function(oSettings, fnDraw) {
          var iListLength = 5;
          var oPaging = oSettings.oInstance.fnPagingInfo();
          var an = oSettings.aanFeatures.p;
          var i, j, sClass, iStart, iEnd, iHalf = Math.floor(iListLength / 2);

          if (oPaging.iTotalPages < iListLength) {
            iStart = 1;
            iEnd = oPaging.iTotalPages;
          } else if (oPaging.iPage <= iHalf) {
            iStart = 1;
            iEnd = iListLength;
          } else if (oPaging.iPage >= (oPaging.iTotalPages - iHalf)) {
            iStart = oPaging.iTotalPages - iListLength + 1;
            iEnd = oPaging.iTotalPages;
          } else {
            iStart = oPaging.iPage - iHalf + 1;
            iEnd = iStart + iListLength - 1;
          }

          for (i = 0, iLen = an.length; i < iLen; i++) {
            // Remove the middle elements
            $('li:gt(0)', an[i]).filter(':not(:last)').remove();

            // Add the new list items and their event handlers
            for (j = iStart; j <= iEnd; j++) {
              sClass = (j == oPaging.iPage + 1) ? 'class="active"' : '';
              $('<li ' + sClass + '><a href="#">' + j + '</a></li>').insertBefore($('li:last', an[i])[0]).bind('click', function(e) {
                e.preventDefault();
                oSettings._iDisplayStart = (parseInt($('a', this).text(), 10) - 1) * oPaging.iLength;
                fnDraw(oSettings);
              });
            }

            // Add / remove disabled classes from the static elements
            if (oPaging.iPage === 0) {
              $('li:first', an[i]).addClass('disabled');
            } else {
              $('li:first', an[i]).removeClass('disabled');
            }

            if (oPaging.iPage === oPaging.iTotalPages - 1 || oPaging.iTotalPages === 0) {
              $('li:last', an[i]).addClass('disabled');
            } else {
              $('li:last', an[i]).removeClass('disabled');
            }
          }
        }
      }
    });
  }
});