#Component: fh-studio

## 3.20.1 - 2014-07-04 - IR231 - Niall Donnelly
* 7569 update js-sdk related to ticket 7569

## 3.20.0 - 2014-07-03 - IR231 - Jason Madigan
* 7549 - Detect embed apps during FH2 migration

## 3.19.5 - 2014-07-02 - IR231 - Niall Donnelly
* 7550 - fix signature download in js-sdk

## 3.19.4 - 2014-06-30 - IR231 - Jason Madigan
* 7468 - Updating JS SDK - Admin calls fail in the preview

## 3.19.3 - 2014-06-17 - IR230 - Wei Li
* 7449 & 7457 - Update JS SDK and Android SDK to the latest version

## 3.19.2 - 2014-06-30 - IR229 - Niall Donnelly
* 7366 - Updated js-sdk for ticket 7366_mbaasURL_saved_in_config

## 3.19.1 - 2014-05-30 - IR228 - Wei Li
* 7259 - WP OTA Support

## 3.19.0 - 2014-05-29 - IR228 - Jason Madigan
* 7094 - Support for FH2 => FH3 migration

## 3.18.22 - 2014-05-19 - IR227 - Wei Li

* 7058 - Adding binary files for .NET SDKs

##3.18.21 - 2014-05-13 - IR227 - Cbrookes

* 7119 forms pdf add in submission meta data

##3.18.20 - 2014-05-12 - IR227 - Martin Murphy

* 6973 - [Zendesk #3572] app logs download not working from studio due to csrf

##3.18.19 - 2014-05-08 - IR227 - Wei Li

Bump android and ios sdks to the latest version

##3.18.18 - 2014-05-07 - IR227 - Cbrookes

* bump jssdk 2.0.16-alpha

##3.18.17 - 2014-05-02 - IR226 - Jason Madigan

* 7005 - V3 cookie not set correctly if scheme is also incorrect for user

##3.18.16 - 2014-05-01 - IR226 - Cbrookes

bump jssdk 2.0.13-alpha

##3.18.15 - 2014-04-28 - IR226 - Cbrookes

* 6879 make section break no longer a required field to fix form validation.
* 7003 fix save field rules
* 6946 marked email field as mandatory for creating users

##3.18.14 - 2014-04-24 - IR226 - Cbrookes

* update to latest js-sdk

##3.18.13 - 2014-04-23 - IR226 - Jason Madigan

* 6959 - If setting studio.version to beta, you still land on old studio

##3.18.12 - 2014-04-22 - IR226 - Wei Li

* 6927 - Update JS SDK to the latest version

##3.18.11 - 2014-04-16 - IR225 - Wei Li

* 6857 - Update JS SDK to latest version to support fh_timeout property

##3.18.10 - 2014-04-15 - IR225 - Jason Madigan

* 6780 - Users who are not logged in should be directed to their appropriate login page based on feedhenry_v cookie

##3.18.09 - 2014-04-11 - IR225 - Cbrookes

* 6764 change name of property that decides whether to show new appforms3 or old appforms : studio-js-appforms-enabled-feedhenry2

##3.18.08 - 2014-04-11 - IR225 - Cbrookes

* 6764 appforms 2 default check prop to see whether to show appforms 3 generators

##3.18.07 - 2014-04-10 - IR225 - Cbrookes

*6695 add property check to manage forms button

##3.18.06 - 2014-03-25 - IR224 - Cbrookes

* 6564 fix view submissions error
* update viewhelper to render selects

##3.18.05 - 2014-03-25 - IR224 - Cbrookes

* 6378 add logging options to config screen

##3.18.04 - 2014-03-25 - IR224 - Cbrookes


Note delete all submissions in beta before deploy

##3.18.03 - 2014-03-18 - IR222 - Niall Donnelly

* 6212 Refactored Theme Edit

##3.18.02 - 2014-03-12 - IR222 - cbrookes

* 5270 edit and view submissions

##3.18.01 - 2014-02-10 - IR221 - mmurphy

* 5961 - add forms to existing apps needs to filter apps by group

##3.18.00 - 2014-01-20 - IR219 - Craig Brookes

* added new dependencies for fh forms work: These depenedencies are created and maintained in the jssdk project

      src/main/webapp/studio/static/common/js/api/appFormjs-backbone.min.js
      src/main/webapp/studio/static/common/js/api/appFormjs-core.min.js
      src/main/webapp/studio/static/common/js/api/appFormsThemeCssGenerator.js

* 5180, 5181 add forms rules views to the forms tab
* 5239, 5270 app forms submission lists and details views
* 5630 preview forms and themes in studio
* 5078 main appforms work - base views & models, form list & edit, theme list & edit, app list & edit, group list & edit

property added to cluster-common:
    studio-js-appforms-enabled = false

Note: cms work is included in this as we needed to reuse the formbuilder etc


##3.17.38 - 2014-04-14 - IR225 - Martin Murphy

* 6791 - [Zendesk #3494] QR-code not always displayed in FeedHenry 2 Studio

##3.17.37 - 2014-03-04- IR224 - James Kelly

* 6670 - QR codes not being added to builds

##3.17.37 - 2014-02-27 - IR224 - James Kelly

* 6493 - zendesk-3043 Adding theme to separate Baystate and baystate innovation.

##3.17.36 - 2014-02-27 - IR224 - John Frizelle

* 6485 - Plugins UI not rendering correctly for O2 UK theme.

##3.17.35 - 2014-02-13 - IR222 - James Kelly

* zendesk 3215 - Issue with user import invite emails

##3.17.34 - 2014-03-04 - IR222 - Wei Li

* 6219 - Add support for choosing Cordova version when building apps

##3.17.33 - 2014-02-13 - IR221 - Michael Nairn

* 5436 - Update js sdk, ngui changes

##3.17.32 - 2014-02-13 - IR221 - James Kelly

* 3111 - zendesk fixed black spaces where this role should be

##3.17.31 - 2014-02-03 - IR220 - Wei Li

* 5879 - Update references of iOS SDK 6 to iOS SDK 7

##3.17.30 - 2014-01-29 - IR220 - Wei Li

* 5721 - New configuration option for iOS 7

##3.17.29 - 2014-01-23 - IR219 - Jason Madigan

* 5719 - Activation link could be broken on NGUI redirects

##3.17.28 - 2014-01-17 - IR219 - Damian Beresford

* 3114 - Need a property to override website redirected to for unknown domains

##3.17.27 - 2014-01-14 - IR219 - Damian Beresford

* 5324 - Add mssql node module as a Cloud Plugin
* 5326 - Add Auth0 as a Cloud Plugin
* 5325 - Add New Relic as a Cloud Plugin

##3.17.26 - 2014-01-07 - IR218 - Wei Li

* 5525 - Fix ios native sdk armv7s linker error

##3.17.25 - 2013-12-12 - IR216 - Jason Madigan

* 5348 - Resolved an issue with Landing Pages not rendering in domains with custom landing pages

##3.17.24 - 2013-12-09 - IR216 - Wei Li, Jason Madigan

* 5246 - Add support for building windows phone 8 apps
* 5311 - Fixed a bug where API Keys could not be revoked
* 5228 - Bay state health theme - "baystatehealth"

##3.17.23 - 2013-12-04 - IR216 - Damian Beresford

* 5286 - fh-studio work for 'clean' checkbox on deploy screen


##3.17.22 - 2013-11-26 - IR215 - David Martin

* 5141 - Added new Cloud Plugins and Plugin category for Amazon Node.js Module
* 5056 - Improvements to autofocus with modals that have input elements
* 5054 - Improvements to Databrowser migration steps to show more detailed info on initialisation errors
* 5037 - Fixed Cloud Environment resources sorting alphanumerically (now just sorting numerically)
* 4930 - Fixed rebinding of buttons in Deployment Targets UI
* 4647 - Using henr.ie shortend urls for builds

##3.17.21 - 2013-11-11 - IR214 - Wei Li

* 5058 - Add support for MDM integration

##3.17.20 - 2013-11-04 - IR213 - Craig Brookes

* 5133 js sdk update


##3.17.19 - 2013-11-04 - IR213 - Jason Madigan / Craig Brookes

* 5061 - Add vmware cloud deploy img
* 5063 - Add Samsung Theme

##3.17.18 - 2013-09-11 - IR209 - Cian Clarke

# note this was originally ##3.17.17 //however there was an update and so this was bumped up
* 4537-databrowser

    NOTES:

    To be accompanied by changes to Millicore, fh-db, fh-ditch. Also required for the data browser to
    function is updates to user's cloud code in application.js to use new components fh-webapp and
    fh-api in replacement of fh-nodeapp.

##3.17.17 - 2013-11-01 - IR213 - Wei Li

* 5024 - Update Android SDK to the latest version to fix NPE
* 5049 - Update JS SDK to the latest version to fix $fh.init issue on WP7
* Upate IBM theme deploy target image

##3.17.16 - 2013-10-16 - IR212 - Niall Donnelly

* 2169 - Fix iOS Store Issue
* 2434 - Fix O2 Cloud Environments Tab css.

##3.17.15 - 2013-10-10 - IR212 - Niall Donnelly & Jason Madigan

* 4917 - App Forms branding
* 4879 -- Open Registration breaks login functionality
* 2323 -- Added Mubaloo images for mubaloodemo.feedhenry.com

##3.17.14 - 2013-09-25 - IR211 - Damian Beresford

* 4668 - problem with file editor in chrome
* 4751 - Zendesk #2202 Cloud Environment tab

##3.17.13 - 2013-10-02 - IR210 - Cian Clarke

* 4740 - Add Rackspace US theme & landing page

##3.17.12 - 2013-09-18 - IR210 - Jason Madigan

* 4571 - Use white icon/splash screen by default for builds

##3.17.11 - 2013-09-10 - IR210 - Michael Nairn

* 4625 - Remove registration links from rackspace theme
* 4630 - Remove registartion links from hpcs theme

Both themes are updated to show a "Request an Account" form in place of the registration form when free account

##3.17.10 - 2013-09-06 - IR209 - Martin Murphy

* 4642 - Fix password error display on activation and reset password screens

##3.17.9 - 2013-08-29 - IR209 - Martin Murphy

* 4605 - Fix app resources references

##3.17.8 - 2013-08-20 - IR207 - Wei Li

* 4417 - Cloud Environments
* 4196-minor-security-fixes
we now set a csrf cookie which is sent with each request and value of the cookie
is also sent as a param in post request to be checked by millicore

NOTES:

A millicore property is created for toggling this new UI. It is set to false by default.

    studio.cloudenvironments.enabled = false


##3.17.7 - 2013-08-19 - IR208 - Jason Madigan


* 4556 - Whitelabelling and landing page for Rackspace

    NOTES:

    This release is to be accompanied by Millicore. A number of property changes are noted
    in the Millicore changelog, as well as a new property for white-labelling deploy
    target labels.


##3.17.6 - 2013-07-26 - IR206 - Cian Clarke, Wei Li

* 4354 - mBaaS plugins catalog
* 4414 - Update iOS and Android SDK artifacts to the latest version (Adding native sync client support)

    NOTES:

    A Millicore property now exists for toggling the Plugins UI. This should be set to enabled for the psdev domain (off by default).

      studio.plugins.enabled=true

##3.17.5 - 2013-07-23 - IR206 - Craig Brookes

* 4350-disable-founderies
* 4387 events showing incorrect times
* 4364 node runtimes select not hiding on error

##3.17.5 (NR) - 2013-07-10 - IR205 - Craig Brookes

* 4196-minor-security-fixes
we now set a csrf cookie which is sent with each request and value of the cookie
is also sent as a param in post request to be checked by millicore

##3.17.4 - 2013-07-08 - IR205 - Jason Madigan

* 4141 - fh-js-sdk changes for resiliency
* 4142 - fh-ios-sdk changes for resiliency
* 4143 - fh-android-sdk changes for resiliency
* 4228 - Studio changes for Analytics Tag

##3.17.3 - 2013-07-09 - IR205 - Wei Li

* 4284 - Fixed perapp report view error for analytics users

##3.17.2 - 2013-06-27 - IR204 - Wei Li

* 3616 - Added support for app events and alerts

##3.17.1 - 2013-06-26 - IR205 - Jason Madigan

* 4213 - New Mobistar theme

##3.17.0 - 2013-06-26 - IR204 - Martin Murphy, Jason Madigan

* 4213  Reporting screens not displayed for users without dev role
* 4218  Create group button broken in studio

##3.16.11 - 2013-06-11 - IR203 - Craig Brookes, Martin Murphy

* 4117  add support for multiple node versions to studio
Studio makes use of 3 new props in millicore
studio-js-nodejs.runtimes.release.show = false
studio-js-nodejs.runtimes.development.show = false
studio-js-nodejs.runtimes.supported = ["FEEDHENRY"]

these control which env to show runtimes on the deploy screen for and also which platforms to show
the runtimes options for.

* 4198 fix git pull modal issue (martin murphy)

##3.16.10 - 2013-06-20 - IR203 - Jason Madigan

* 4194 - Clicking some items in the admin area can reveal unwanted details panes

##3.16.9 - 2013-05-31 - IR203 - Jason Madigan

* 3954 - Backported everglade reporting UI
* 3956 - Backport models and collections for Analytics back to existing studio
* 3959 - Implement Per-App (domain view) and aggregated analytics
* 3957 - Backport existing views from Everglade analytics
* 3737 - In the devices section of MAM in studio some of the buttons don't work
* 3901 - Analytics Data not displaying correctly
* 3910 - Improve the information displayed on exported reports (png/pdf etc)
* 358  - Remember date selections
* 4108 - Sample data for collections
* 3944 - Colour for "embed" analytics not set - so appears random
* 3963 - Per app domain reports - list of apps should display next to dashboard
* 3964 - Charts should display totals
* 3966 - Stats should be available under reporting
* 3969 - Aggregate/domain level dashboard could do with some UI polish
* 3970 - Change date format in analytics from MM/DD/YYYY to the more universal YYYY/MM/DD
* 3972 - All destinations should have a fixed colour per series
* 3737 - In the devices section of MAM in studio some of the buttons don't work
* 4071 - Embedded typo

##3.16.8- 2013-06-13 - IR203 - Wei Li

* 4007 - Added support for monkeytalk


* 4111 - IBM theme added

##3.16.6 - 2013-05-30 - IR202 - John Frizelle, Wei Li

* 4016 - Update JS SDK with latest version of Data Sync
* 3950 - Updated admin view to allow assign roles to users at different levels
* 4032 - Only enable background call to get recent apps on dashboard for dev users

##3.16.5 - 2013-05-21 - IR202 - Wei Li

* 4032 - Only enable background call to get recent apps on dashboard for dev users

##3.16.4 - 2013-05-21 - IR202 - Damian Beresford

* 3677 Investigate the resources issues being seen in vmware

##3.16.3 - 2013-05-26 - IR202 - John Frizelle

* 4027 - JS SDK Issues with JSONP and timeouts

##3.16.2 - 2013-05-20 - IR202 - Jason Madigan

* 3942 - Fixed an issue where default stdout/stderr could point to the wrong file
* 3774 - Increase stage timeout from 20 seconds

##3.16.1 - 2013-05-15 - IR201 - Jason Madigan

* 3936 - IE JS SDK Error

##3.16.0 - 2013-05-14 - IR201 - Jason Madigan

* 3744 - JS SDK error - IE8 firing multiple callbacks
* 3234 - Studio find function not working correctly in editor
* 3381 - Customeradmins cannot see the admin tab without the dev role
* 3892 - Whitelabel favicons
* 3798 - Log list is scrollable
* 3799 - Current app logs not downloadable

##3.15.15 - 2013-04-24 - IR200 - David Martin

* 3784 - Increased storeitem binary upload timeout from 2 to 5 minutes


##3.15.14 - 2013-04-02 - IR198 - Wei Li

* 3577 - various studio bugs
    * Environment Variables - name contains space cause problems
    * Android Debug Build Wizard - unnecessary extra step required to enter password
    * Dev/live toggle issue
* 3478 - git pull displays proper status update

##3.15.13 - 2013-03-27 - IR198 - Wei Li

* 3547 - Update fh-js-sdk file to fix an issue with wrong uuid being used

##3.15.12 - 2013-03-19 - IR197 - David Martin
* 3309 Call to user props endpoint when New UI is loaded, updating property
* 3310 Call to user props endpoint when switching back to Old UI, updating property


##3.15.11 - 2013-03-20 - IR197 - Wei Li

* 3339 - Added support for app cloud environment variables
* 3465 - fh-studio : git pull button on the details page dumps the user back onto the "All Apps" screen (in FireFox)

##3.15.10 - 2013-03-14 - IR195 - Craig Brookes

* 3138 transaction reporting and redesign of reporting tab

##3.15.9 - 2013-03-11 - IR197 - Jim OLeary

* 3336 - Remove option to auto deploy cloud code when building client app

##3.15.8 - 2013-03-06 - IR196 - Wei Li

* 3329 - Split cloud notifications between dev & live
* 3337 - Recorded GIT info for all cloud deploys and show it in cloud notifications
* 3338 - Prompt for approver info when deploy to live environment and show it in cloud notifications

##3.15.7 - 2013-02-27 - IR196 - Jim OLeary

* 1588 - App Forms Phase II : Wufoo Page should ask for App Name

##3.15.6 - 2013-02-19 - IR195 - Wei Li

* 3147 - Added realtime reporting for App cloud resource usage

##3.15.5 - 2013-02-13 - IR195 - Wei Li

* 3186 - Updated feedhenry.js to maintain backward compatibility for $fh.hash

##3.15.4 - 2013-02-08 - IR194 - Wei Li

* 3071 - Added support for app events notifications

##3.15.2 - 2013-02-06 - Wei Li

* 3117 - Added extra parameters when calling embed delivery endpoint if it's node embed app

##3.15.1 - 2013-02-05 - Paul McCarthy

* 827 - Added new theme for customer Symphony Teleca

##3.15.0 - 2013-01-31 - IR194 - Jason Madigan

* 2994 - Studio SDKs

##3.14.5 - 2013-01-14 - IR192 - Wei Li

* 2951 - Added support for log streaming in the studio

##3.14.4 - 2013-01-14 - IR192 - Wei Li

* 2948 - Added support for start stop app in studio.

##3.14.3 - 2013-01-10 - IR192 - Wei Li

* 1642 - Added a notification area in the studio

##3.14.2 - 2013-01-07 - IR192 - Wei Li

* 2858 - Added support to allow overriding default android package names

##3.14.1 - 2013-01-03 - IR192 - Wei Li

* 2718 - Removed the steps in iOS build process that prompts user to select SDK version
* 2719 - Added new iPhone5 app preivew
* 2720 - Added support for new configuration options for iOS


##3.14.0 - 2012-12-18 - IR191 - Wei Li

* 2894 - Bring existing cloud app logs functionality through to the studio UI

##3.13.0 - 2012-12-12 - IR190 - Damian Beresford

* 159 - Endpoint Security

##3.12.2 - 2012-12-04 - IR190 - Wei Li

* 2718 - Replace the step in the Android build process that prompts user to
    select SDK version with SDK information
* 2785 - Update push notification options to work with the updated Urbanairship library

##3.12.1 - 2012-11-28 - IR189 - Jim O'Leary

* 2759 - Add Apache configuration changes to Studio CHANGELOG

The following settings should be incorporated into the Apache configuration of
all systems where App Studio is running. They ensure that the appropriate
headers are only removed from Studio files (but not from act() calls).

In production/staging environments the file to be modified is
/etc/apache2/feedhenry/fh-vhost-common.conf and the changes usually require
an Apache restart (service apache2 restart).

<Location /studio/static>
 FileETag MTime Size
 Header unset Pragma
 Header unset Expires
 Header unset Cache-Control
 Header unset Last-Modified
 Order allow,deny
 Allow from all
</Location>

The Header unset commands may already exist elsewhere in the Apache configuration
and the key issue here is to ensure they are only applied within the context of
the /studio/static Location.



##3.12.0 - IR188
####CHANGES
* 1535 - Support for App Forms Phase II (Username & Password Auth). Support for
multi form swap select config.



##3.11.3
####CHANGES
* 2634-binary-versions added binary download history to mam store items.



##3.11.2
####CHANGES
* 2599-audit-log added an auditlog for downloaded apps.


##3.11.1

###CHANGES
* Ticket 2617 [IR188] Email field now missing in fh-studio ##3.11.0-24


##3.11.0

###CHANGES
* MAM Groups UI added for controlling access to Store Items


##3.10.0

###CHANGES
* Use bootstrap modal dialog for binary download!


##3.8.0

###CHANGES
* Using non-serif font for ota links to prevent character confusion


##3.7.0

###CHANGES
* Fixed default 'To' date for reporting graphs


##3.6.0

###CHANGES
* Added 'Resources' screen for monitoring an app's resources
* Deprecated old build targets: Nokia WRT, Opera Widgets, W3C.
* Added new Deployment area for deploying your Cloud App to a number of PaaS
  options including FeedHenry, Cloud Foundry, App Fog, Stackato and Iron Foundry
* You can now view Cloud App logs for both Live and Dev environments
* Update UI for 'Stats' screen
* Added App Endpoints stats to 'Stats' screen


##3.5.1

###CHANGES
* Swapped reports containers for installs/startups by date and by platform



##3.5.0

###CHANGES
* Removed legacy jquery plugins - jqgrid, ui-accordion, ui-layout
* Converted all tabs and their content to bootstrap styles
* Reporting tab and per-apps now have top level 'Installs' & 'Startups' section
  with sub-section for viewing by date/platform/location
* Added loading splash image to device previews
* Added copy to clipboard functionality for 'readonly' app details e.g. api key
* Moved editor file listing into main content area
* Added new quickstart menu option in apps tab, with client & cloud specific quickstart
  options also available from menu
* Moved platform configuration options inside main content area i.e. preview, embed, ios
* Fixed issue where switching between a rhino & nodejs app wouldn't update availabe options
  i.e. deploy, status
* Updated layout for all tables to use datatables plugin
* Updated tooltips to use bootstrap popovers
* Added new 'My Apps' option to apps tab which shows only apps that current user has
  created. 'All Apps' option has old behaviour of showing all apps current user has
  access to i.e. owned apps and group apps
* Moved 'Clone' & 'Delete' app options into app details screen
* Fixed issue with 'Copy to Clipboard' icons where resizing browser window wasn't updating
  location of 'flash' embed object

###NOTES
*



##3.4.0

###CHANGES
* Added App Store consumption UI (/store)
* Merged ARM Admin and Studio Admin into unified Admin tab
* Support for MAM
  * User UI updated with $fh.auth support (data purge/wipe)
  * Auth Policy UI updated with LDAP and FeedHenry login support, user to policy
    assignment, and authorisation checks
  * New App Store Admin UI - users can create and configure an App Store
  * New Store Item UI - users can create Store Items to associate with
    their App Store. These store items can have multiple binaries uploaded
    for iOS, iPhone, Android & iPad
  * New Devices UI - shows list of devices/apps accessing $fh.auth API

###NOTES
*



##3.3.3

###CHANGES
* Add app store consumption UI

###NOTES
*  update apache rewrite rules to add redirect for /store to /studio/store
       # App Store
       RewriteRule ^/store$ /store/ [R]
       RewriteRule ^/store/(.*)$  /studio/store/$1 [P,L]


##3.3.2

###CHANGES
* Show OTA and download links after a build finishes instead of downloading automatically

###NOTES
*


##3.3.1

###CHANGES
* o2 Theming changes made. Small changes to CSS and removed ! from login form panel.

###NOTES
*


##3.3.0

###CHANGES
* Added intercom user tracking for logged in users
* Added new 'email' column to app listing, shows email of original app creator (only if email is sent back in app list response)
* Added 'ENVIRONMENT' global to studio js. Can be either 'dev' or 'prod'
* Added new auth policy section for the portal admin, allowing the configuration of third party oauth and authentication that ties back into ARM

###NOTES
*


3.2.0

###CHANGES
* Added a new ant task to automatically merge and minify javascript and css files
* Added support to deliver minifed js and css files if they are exist

###NOTES
* The log file for studio has changed from ${fh.logdir}/core/fhstudio.log to ${fh.logdir}/studio/studio.log The directory should exist before studio is deployed.

##3.1.0

*  Ant targets for compile, deploy (dev), and make-studio-war artifact
*  Handle NPE when Millicore not running bug#1502
*  Fixed startup and shutdown messaging for start/stop scripts
*  New Studio Admin tab - allows user creation, role assignment, activation email sending and user account updates
*  Updated main tabs logic to show 'My Account' tab to everyone
** change location and name of studio log file to ${fh.logdir}/studio/studio.log, change log level to info
   see deploy note deploy/IR182/deploy01.txt