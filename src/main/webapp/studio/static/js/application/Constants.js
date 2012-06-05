/* fake 'packages' */
application = {};
application.model = {};
application.controller = {};
application.view = {};
analytics = {};
model = {};
proto = {};

Constants = {
  TEMPLATE_APP_TYPE: "t",
  DOMAIN: DOMAIN
};

$.extend(Constants, {
  ACT_URL_PREFIX : "/box/srv/1.1/act/",
  DAT_URL_PREFIX : "/box/srv/1.1/dat/",
  DEV_URL_PREFIX : "/box/srv/1.1/dev/",
  PUB_URL_PREFIX : "/box/srv/1.1/pub/",
  IDE_URL_PREFIX : "/box/srv/1.1/ide/" + Constants.DOMAIN + "/",
  _____DO_NOT_USE____ENT_URL_PREFIX : "/box/srv/1.1/ent/",
  WID_URL_BASE_PREFIX : "/box/srv/1.1/wid/",
  WID_URL_PREFIX : "/box/srv/1.1/wid/" + Constants.DOMAIN + "/",
  ARM_URL_PREFIX : "/box/srv/1.1/arm/",
  METRICS_URL_PREFIX : "/box/srv/1.1/metrics/"
});

$.extend(Constants, {
    
  LOGOUT_URL : Constants.ACT_URL_PREFIX + "sys/auth/logout",
  
  // LogManager urls
  DAT_LOG_READ_URL   : Constants.DAT_URL_PREFIX + "log/read",
  DAT_LOG_REMOVE_URL : Constants.DAT_URL_PREFIX + "log/remove",
  
  // app urls
  LIST_APPS_URL : Constants.IDE_URL_PREFIX + "app/list",
  SEARCH_APPS_URL : Constants.IDE_URL_PREFIX + "app/search",
  LIST_TEMPLATE_APPS_URL : Constants.IDE_URL_PREFIX + "app/templatelist",
  READ_APP_URL: Constants.IDE_URL_PREFIX + "app/read",
  READ_APP_BY_NAME_URL: Constants.IDE_URL_PREFIX + "app/readbyname",
  CREATE_APP_URL: Constants.IDE_URL_PREFIX + "app/create",
  IMPORT_APP_URL: Constants.IDE_URL_PREFIX + "app/import",
  IMPORT_APP_VIA_URL: Constants.IDE_URL_PREFIX + "app/import_url",
  CLONE_APP_URL: Constants.IDE_URL_PREFIX + "app/clone",
  UPDATE_APP_URL: Constants.IDE_URL_PREFIX + "app/update",
  DELETE_APP_URL: Constants.IDE_URL_PREFIX + "app/delete",
  PERMS_APP_URL: Constants.IDE_URL_PREFIX + "app/perms",
  STAGE_APP_URL: Constants.IDE_URL_PREFIX + "app/stage",
  PING_APP_URL: Constants.IDE_URL_PREFIX + "app/ping",
  STATS_APP_URL: Constants.IDE_URL_PREFIX + "app/stats",
  EXTERNAL_REQUEST_URL: Constants.IDE_URL_PREFIX + "app/external_request",

  KEY_LIST_URL: Constants.IDE_URL_PREFIX + "api/list",
  KEY_CREATE_URL: Constants.IDE_URL_PREFIX + "api/create",
  KEY_UPDATE_URL: Constants.IDE_URL_PREFIX + "api/update",
  KEY_REVOKE_URL: Constants.IDE_URL_PREFIX + "api/revoke",

  RELEASE_STAGE_APP_URL: Constants.IDE_URL_PREFIX + "app/releasestage",
  UPDATE_APP_FRAMEWORKS_URL : Constants.IDE_URL_PREFIX + "app/updateFrameworks",
  // TODO: use new endpoints for export
  EXPORT_APP_URL: Constants.DEV_URL_PREFIX + "editor/widget/download",
	PREVIEW_APP_DESTINATION: 'studio',
  PREVIEW_APP_URL: Constants.WID_URL_BASE_PREFIX + "<DOMAIN>/<DEST>/<GUID>/container",
  PREVIEW_TEMPLATE_URL: Constants.WID_URL_BASE_PREFIX + "<DOMAIN>/<DEST>/<GUID>/deliver",
  EMBED_APP_TAG: "<script src=\"" + window.location.protocol + "//" + window.location.host + Constants.WID_URL_PREFIX + "embed/<GUID>/deliver\"></script>",
  
  // scm urls
  TRIGGER_SCM_URL: Constants.PUB_URL_PREFIX + "app/<GUID>/refresh",

  // file urls
  CREATE_FILE_URL: Constants.IDE_URL_PREFIX + "file/create",
  LOAD_FILE_URL: Constants.IDE_URL_PREFIX + "file/read",
  SAVE_FILE_URL : Constants.IDE_URL_PREFIX + "file/update",
  DELETE_FILE_URL : Constants.IDE_URL_PREFIX + "file/delete",
  LIST_FILES_URL: Constants.IDE_URL_PREFIX + "file/list",
  VIEW_IMAGE_URL : Constants.IDE_URL_PREFIX + "file/view",
  TRIGGER_DOWNLOAD_URL : Constants.IDE_URL_PREFIX + "file/trigger_download",
  RENAME_FILE_URL: Constants.DEV_URL_PREFIX + "editor/file/rename",
  REMOVE_FILE_URL: Constants.DEV_URL_PREFIX + "editor/file/remove",
  MOVE_FILE_URL: Constants.DEV_URL_PREFIX + "editor/file/move",
  IMPORT_FILE_URL : Constants.DEV_URL_PREFIX + "editor/file/import",
  //update app start file url
  START_FILE_URL: Constants.IDE_URL_PREFIX + "file/default",
  
  // resource urls
  UPLOAD_RESOURCE_URL: Constants.DEV_URL_PREFIX + "account/res/upload",
  DOWNLOAD_RESOURCE_URL: Constants.DEV_URL_PREFIX + "account/res/download",
  LIST_RESOURCES_URL: Constants.DEV_URL_PREFIX + "account/res/list",
  GENERATE_CSR_URL: Constants.DEV_URL_PREFIX + "account/res/generate?type=csr",
  GENERATE_CERT_URL: Constants.DEV_URL_PREFIX + "account/res/generate",
  
  // metric urls
  
  READ_APP_METRICS_URL: Constants.METRICS_URL_PREFIX + "app/read",
  LIST_APP_METRICS_APPS_URL: Constants.METRICS_URL_PREFIX + "app/listApps",
  DOWNLOAD_APP_METRICS_APPS_URL: Constants.METRICS_URL_PREFIX + "app/download",
  
  //app config urls
  LIST_CONFIG_URL: Constants.IDE_URL_PREFIX + "config/list",
  UPDATE_CONFIG_URL: Constants.IDE_URL_PREFIX + "config/update",
  
  //User Profile
  READ_USER_DETAILS: Constants.IDE_URL_PREFIX + "user/read",
  CHANGE_USER_PASSWORD: Constants.IDE_URL_PREFIX + "user/chgpwd",
  
  //community snippet urls
  LIST_TAGS_URL:            Constants.IDE_URL_PREFIX + "community/snippet/tags",
  LIST_SHARED_SNIPPETS_URL: Constants.IDE_URL_PREFIX + "community/snippet/sharedlist",
  LIST_MY_SNIPPETS_URL:     Constants.IDE_URL_PREFIX + "community/snippet/list",
  LIST_SNIPPETS_BY_TAG_URL: Constants.IDE_URL_PREFIX + "community/snippet/taglist",
  CREATE_SNIPPET_URL:       Constants.IDE_URL_PREFIX + "community/snippet/create",
  DELETE_SNIPPET_URL:       Constants.IDE_URL_PREFIX + "community/snippet/delete",
  UPDATE_SNIPPET_URL:       Constants.IDE_URL_PREFIX + "community/snippet/update",
  VIEW_SNIPPET_URL:         Constants.IDE_URL_PREFIX + "community/snippet/read",
  SEARCH_SNIPPETS_URL:      Constants.IDE_URL_PREFIX + "community/snippet/search",
  
  // icon urls
  APP_ICON_URL: Constants.WID_URL_PREFIX + "sandbox/<GUID>/icon/<TYPE>",
  UPLOAD_ICON_URL: Constants.DEV_URL_PREFIX + "instances/icons/upload",
    
  //debug/logging urls
  LOGS_URL: Constants.IDE_URL_PREFIX + "app/logs",
  // DEPRECATED - DO NOT USE
  // use LOGS_URL instead
  READ_SCRIPT_LOG_URL: Constants.DEV_URL_PREFIX + "editor/logging/list",
  CLEAR_SCRIPT_LOG_URL: Constants.IDE_URL_PREFIX + "app/clearlog",

  
  GET_SINGLE_APP_METRICS_URL: Constants.IDE_URL_PREFIX + "app/getsingleappmetrics"
});
