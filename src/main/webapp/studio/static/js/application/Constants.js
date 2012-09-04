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
  PUB_URL_PREFIX : "/box/srv/1.1/pub/",
  IDE_URL_PREFIX : "/box/srv/1.1/ide/" + Constants.DOMAIN + "/",
  WID_URL_BASE_PREFIX : "/box/srv/1.1/wid/",
  WID_URL_PREFIX : "/box/srv/1.1/wid/" + Constants.DOMAIN + "/",
  ARM_URL_PREFIX : "/box/srv/1.1/arm/",
  METRICS_URL_PREFIX : "/box/srv/1.1/metrics/",
  ADMIN_URL_PREFIX : "/box/srv/1.1/admin/",
  SDK_URL_PREFIX : "/box/srv/1.1/sdk/",
  DEPLOY_TARGET_MANAGE_PREFIX : "/box/srv/1.1/cm/deploy/policy/",

  ____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____: "/box/srv/1.1/dev/" // dev endpoints to be moved/migrated into ide space
});

$.extend(Constants, {

  LOGOUT_URL: Constants.ACT_URL_PREFIX + "sys/auth/logout",

  // LogManager urls
  DAT_LOG_READ_URL: Constants.DAT_URL_PREFIX + "log/read",
  DAT_LOG_REMOVE_URL: Constants.DAT_URL_PREFIX + "log/remove",

  // app urls
  LIST_APPS_URL: Constants.IDE_URL_PREFIX + "app/list",
  SEARCH_APPS_URL: Constants.IDE_URL_PREFIX + "app/search",
  LIST_TEMPLATE_APPS_URL: Constants.IDE_URL_PREFIX + "app/templatelist",
  READ_APP_URL: Constants.IDE_URL_PREFIX + "app/read",
  READ_APP_BY_NAME_URL: Constants.IDE_URL_PREFIX + "app/readbyname",
  CREATE_APP_URL: Constants.IDE_URL_PREFIX + "app/create",
  IMPORT_APP_URL: Constants.IDE_URL_PREFIX + "app/import",
  IMPORT_APP_VIA_URL: Constants.IDE_URL_PREFIX + "app/import_url",
  CLONE_APP_URL: Constants.IDE_URL_PREFIX + "app/clone",
  UPDATE_APP_URL: Constants.IDE_URL_PREFIX + "app/update",
  DELETE_APP_URL: Constants.IDE_URL_PREFIX + "app/delete",
  PERMS_APP_URL: Constants.IDE_URL_PREFIX + "app/perms",
  DEPLOY_APP_URL: Constants.IDE_URL_PREFIX + "app/stage",
  PING_APP_URL: Constants.IDE_URL_PREFIX + "app/ping",
  STATS_APP_URL: Constants.IDE_URL_PREFIX + "app/stats",
  EXTERNAL_REQUEST_URL: Constants.IDE_URL_PREFIX + "app/external_request",
  APP_RESOURCES_URL: Constants.IDE_URL_PREFIX + "app/resources",

  KEY_LIST_URL: Constants.IDE_URL_PREFIX + "api/list",
  KEY_CREATE_URL: Constants.IDE_URL_PREFIX + "api/create",
  KEY_UPDATE_URL: Constants.IDE_URL_PREFIX + "api/update",
  KEY_REVOKE_URL: Constants.IDE_URL_PREFIX + "api/revoke",

  RELEASE_DEPLOY_APP_URL: Constants.IDE_URL_PREFIX + "app/releasestage",
  UPDATE_APP_FRAMEWORKS_URL: Constants.IDE_URL_PREFIX + "app/updateFrameworks",
  // TODO: use new endpoints for export
  EXPORT_APP_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "editor/widget/download",
  PREVIEW_APP_DESTINATION: 'studio',
  PREVIEW_APP_URL: Constants.WID_URL_BASE_PREFIX + "<DOMAIN>/<DEST>/<GUID>/container",
  PREVIEW_TEMPLATE_URL: Constants.WID_URL_BASE_PREFIX + "<DOMAIN>/<DEST>/<GUID>/deliver",
  EMBED_APP_TAG: "<script src=\"" + window.location.protocol + "//" + window.location.host + Constants.WID_URL_PREFIX + "embed/<GUID>/deliver\"></script>",

  // scm urls
  TRIGGER_SCM_URL: Constants.PUB_URL_PREFIX + "app/<GUID>/refresh",

  // file urls
  CREATE_FILE_URL: Constants.IDE_URL_PREFIX + "file/create",
  LOAD_FILE_URL: Constants.IDE_URL_PREFIX + "file/read",
  SAVE_FILE_URL: Constants.IDE_URL_PREFIX + "file/update",
  DELETE_FILE_URL: Constants.IDE_URL_PREFIX + "file/delete",
  LIST_FILES_URL: Constants.IDE_URL_PREFIX + "file/list",
  VIEW_IMAGE_URL: Constants.IDE_URL_PREFIX + "file/view",
  TRIGGER_DOWNLOAD_URL: Constants.IDE_URL_PREFIX + "file/trigger_download",
  RENAME_FILE_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "editor/file/rename",
  REMOVE_FILE_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "editor/file/remove",
  MOVE_FILE_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "editor/file/move",
  IMPORT_FILE_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "editor/file/import",
  //update app start file url
  START_FILE_URL: Constants.IDE_URL_PREFIX + "file/default",

  // resource urls
  UPLOAD_RESOURCE_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "account/res/upload",
  DOWNLOAD_RESOURCE_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "account/res/download",
  LIST_RESOURCES_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "account/res/list",
  GENERATE_CSR_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "account/res/generate?type=csr",
  GENERATE_CERT_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "account/res/generate",

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

  // icon urls
  APP_ICON_URL: Constants.WID_URL_PREFIX + "sandbox/<GUID>/icon/<TYPE>",
  UPLOAD_ICON_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "instances/icons/upload",

  //debug/logging urls
  LOGS_URL: Constants.IDE_URL_PREFIX + "app/logs",
  // DEPRECATED - DO NOT USE
  // use LOGS_URL instead
  READ_SCRIPT_LOG_URL: Constants.____DEPRECATED____DEV_URL_PREFIX____DEPRECATED____ + "editor/logging/list",
  CLEAR_SCRIPT_LOG_URL: Constants.IDE_URL_PREFIX + "app/clearlog",

  GET_SINGLE_APP_METRICS_URL: Constants.IDE_URL_PREFIX + "app/getsingleappmetrics",

  ADMIN_USER_LIST_URL: Constants.ADMIN_URL_PREFIX + "user/list",
  ADMIN_USER_CREATE_URL: Constants.ADMIN_URL_PREFIX + "user/create",
  ADMIN_USER_READ_URL: Constants.ADMIN_URL_PREFIX + "user/read",
  ADMIN_USER_UPDATE_URL: Constants.ADMIN_URL_PREFIX + "user/update",
  ADMIN_USER_DELETE_URL: Constants.ADMIN_URL_PREFIX + "user/delete",
  ADMIN_USER_RESEND_INVITE_URL: Constants.IDE_URL_PREFIX + "user/invite",
  ADMIN_USER_IMPORT_URL: Constants.ADMIN_URL_PREFIX + "user/import",

  ADMIN_GROUP_LIST_URL: Constants.ADMIN_URL_PREFIX + "group/list",
  ADMIN_GROUP_CREATE_URL: Constants.ADMIN_URL_PREFIX + "group/create",
  ADMIN_GROUP_UPDATE_URL: Constants.ADMIN_URL_PREFIX + "group/update",
  ADMIN_GROUP_DELETE_URL: Constants.ADMIN_URL_PREFIX + "group/delete",

  ADMIN_STORE_ITEM_READ_URL: Constants.ADMIN_URL_PREFIX + "storeitem/read",
  ADMIN_STORE_ITEM_LIST_URL: Constants.ADMIN_URL_PREFIX + "storeitem/list",
  ADMIN_STORE_ITEM_CREATE_URL: Constants.ADMIN_URL_PREFIX + "storeitem/create",
  ADMIN_STORE_ITEM_UPDATE_URL: Constants.ADMIN_URL_PREFIX + "storeitem/update",
  ADMIN_STORE_ITEM_UPDATE_CONFIG_URL: Constants.ADMIN_URL_PREFIX + "storeitem/setbinaryconfig",
  ADMIN_STORE_ITEM_DELETE_URL: Constants.ADMIN_URL_PREFIX + "storeitem/delete",
  ADMIN_STORE_ITEM_UPLOAD_BINARY_URL: Constants.ADMIN_URL_PREFIX + "storeitem/uploadbinary",

  ADMIN_APP_STORE_READ_URL: Constants.ADMIN_URL_PREFIX + "appstore/read",
  ADMIN_APP_STORE_UPDATE_URL: Constants.ADMIN_URL_PREFIX + "appstore/update",
  ADMIN_APP_STORE_UPLOAD_BINARY_URL: Constants.ADMIN_URL_PREFIX + "appstore/uploadbinary",

  ADMIN_ROLE_LIST_ASSIGNABLE_URL: Constants.ADMIN_URL_PREFIX + "role/listAssignable",

  ADMIN_DEVICES_LIST_URL: Constants.ADMIN_URL_PREFIX + "device/list",
  ADMIN_DEVICES_UPDATE_URL: Constants.ADMIN_URL_PREFIX + "device/update",
  ADMIN_DEVICES_READ_URL: Constants.ADMIN_URL_PREFIX + "device/read",
  ADMIN_DEVICES_LISTUSERS_URL: Constants.ADMIN_URL_PREFIX + "device/listusers",
  ADMIN_DEVICES_LISTAPPS_URL: Constants.ADMIN_URL_PREFIX + "device/listapps",

  SDK_GETFILES_URL : Constants.SDK_URL_PREFIX + "files/read",
  
  DEPLOY_TARGET_CREATE_URL : Constants.DEPLOY_TARGET_MANAGE_PREFIX + "create",
  DEPLOY_TARGET_READ_URL : Constants.DEPLOY_TARGET_MANAGE_PREFIX + "read",
  DEPLOY_TARGET_LIST_EDITABLE_URL : Constants.DEPLOY_TARGET_MANAGE_PREFIX + "listeditable",
  DEPLOY_TARGET_LISTFORAPP_URL : Constants.DEPLOY_TARGET_MANAGE_PREFIX + "list",
  DEPLOY_TARGET_UPDATE_URL : Constants.DEPLOY_TARGET_MANAGE_PREFIX + "update",
  DEPLOY_TARGET_DELETE_URL : Constants.DEPLOY_TARGET_MANAGE_PREFIX + "delete"

});