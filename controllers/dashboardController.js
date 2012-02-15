var dashboardController,
    renderer = require("../util"),
    util = require("util"),
    fhc = require("fh-fhc");

dashboardController = {
    loadDash:function (req, res, next) {
        fhc.apps.list(function (err, data) {
            if (err) {
                renderer.doError(res, req, "Couldn't generate apps listing");
                return;
            }
            var d = {
                tpl:'dashboard',
                apps:data.list,
                title:'Dashboard'
            };
            renderer.doResponse(req, res, d);  
            
        });
    }
};


module.exports = dashboardController;