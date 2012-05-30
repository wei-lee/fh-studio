package com.feedhenry.studio;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.tssg.millicore.admin.user.UserPrefs;
import org.tssg.millicore.beans.ide.IdePropsBean;
import org.tssg.millicore.beans.sys.ActivationBean;
import org.tssg.millicore.beans.sys.Explain;
import org.tssg.millicore.beans.util.AppContextUtil;
import org.tssg.millicore.beans.util.ResolveTenantUtil;
import org.tssg.millicore.config.DomainProps;
import org.tssg.millicore.config.PropertyConstants;
import org.tssg.millicore.config.PropsManager;
import org.tssg.millicore.core.PropMakerManager;
import org.tssg.millicore.core.PropSet;
import org.tssg.millicore.http.RequestUtil;
import org.tssg.millicore.ide.manager.user.BasicIdeUserManager;
import org.tssg.millicore.ide.manager.user.IdeUserManager;
import org.tssg.millicore.model.Entity;
import org.tssg.millicore.model.sys.Sub;
import org.tssg.millicore.model.track.Login;
import org.tssg.millicore.scm.ScmManager;
import org.tssg.millicore.secure.AccessManager;
import org.tssg.millicore.secure.ExplainUserContext;
import org.tssg.millicore.secure.UserContext;
import org.tssg.millicore.server.framework.BeanHandler;
import org.tssg.millicore.server.response.JsonResponseBean;
import org.tssg.millicore.server.response.ResponseBeanBase;
import org.tssg.millicore.server.servlet.ServletInit;
import org.tssg.millicore.server.util.ServletUtil;
import org.tssg.millicore.server.util.asset.AssetLocatorManager;
import org.tssg.millicore.stpg.manager.StpgAssetManager;
import org.tssg.millicore.web.start.DomainNotFoundException;
import org.tssg.millicore.widget.frameworks.AppFramework;
import org.tssg.millicore.widget.frameworks.AppFrameworksManager;

public class IDEWebBean {

  public static final String DEFAULT_URL = "/box/studio";
  public static final String IDE_LOGIN = "login";
  public static final String IDE_LANDING= "landing";
  public static final String IDE_INDEX = "index";
  public static final String IDE_RESET = "reset";
  public static final String IDE_ACTIVATE = "activate";
  public static final String IDE_DEFAULT_FILE = "/ide/%file%";
  public static final String IDE_THEMES_FILE = "/ide/themes/%theme%/%file%";
  
  public static final String STUDIO_PAGES_GROUP_COOKIE = "feedhenry-studio-pages-group";
  public static final String LOGIN = "studio.login";
  public static final String LOGIN_PAGES = "studio.login.pages";
  public static final String AUTH_LANDING = "studio.landing.auth";
  public static final String NOAUTH_LANDING = "studio.landing.noauth";
  public static final String AUTH_LANDING_PAGES = "studio.landing.auth.pages";
  public static final String NOAUTH_LANDING_PAGES = "studio.landing.noauth.pages";

  public static final String[] GROUP_REPORTING = new String[]{AccessManager.ROLE_ANALYTICS};
  public static final String[] GROUP_ARM = new String[]{AccessManager.ROLE_PORTALADMIN};
  public static final String[] GROUP_DEVELOPER = new String[]{AccessManager.ROLE_DEV, AccessManager.ROLE_DEVADMIN};

  public static final String THEME_DEFAULT = "default";
  public static final String THEME_ENTERPRISE = "enterprise";
  
  public static final String PROTOCOL_PROPERTY = PropertyConstants.STUDIO_NAMESPACE + PropertyConstants.PROTOCOL;

  public static final List<String> mAllowedActionRequest = new ArrayList<String>();
  
  static {
    mAllowedActionRequest.add(IDE_LOGIN);
    mAllowedActionRequest.add(IDE_LANDING);
    mAllowedActionRequest.add(IDE_INDEX);
  }
  
  private BeanHandler mBeanHandler;
  private AssetLocatorManager mALM;
  private ServletContext mServletContext;
  private IdeUserManager mIdeUserManager;
  private JSONObject mInput;
  private String mDomain = null;
  private Sub mSub;
  private UserContext mUC;
  private List<String> mGroups;
  private Explain mExplain;
  private IdePropsBean mPropsBean;
  private boolean mLoggedIn = false;
  private PropertySet mDomainProps = null;
  private String mTheme = null;

  public void init(ServletContext pServletContext) throws Exception {
    mServletContext = pServletContext;
    mBeanHandler = ServletUtil.getBeanHandler(mServletContext);
    mIdeUserManager = new BasicIdeUserManager();
    mALM = (AssetLocatorManager) AppContextUtil.getBean("internal-AssetLocatorManager");
    mPropsBean = (IdePropsBean) AppContextUtil.getBean("IdePropsBean");
  }

  public boolean initreq(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageName) throws Exception {
    
    String redirectUrl = null;
    boolean proceed = true;
    
    // Allow explain bean to be forwarded with request from index page 
    if( null != pRequest.getAttribute("Explain") ) {
      mExplain = (Explain) pRequest.getAttribute("Explain");
    }
    else {
      mExplain = Explain.newRequest(pRequest);
    }

    // Allow mDomain to be forwarded with request 
    if( null != pRequest.getAttribute("Domain") ) {
      mDomain = (String) pRequest.getAttribute("Domain");
      Explain.add(mExplain, "received domain from request : " + mDomain);
    }

    // Allow mDomainProps to be forwarded with request 
    if( null != pRequest.getAttribute("DomainProps") ) {
      mDomainProps = (PropertySet) pRequest.getAttribute("DomainProps");
      Explain.add(mExplain, "received domain props from request");
    }
    
    // Allow mTheme to be forwarded with request 
    if( null != pRequest.getAttribute("Theme") ) {
      mTheme = (String) pRequest.getAttribute("Theme");
      Explain.add(mExplain, "received theme from request : " + mTheme);
    }
    
    Explain.add(mExplain, "Request Url = " + pRequest.getRequestURL());
    Explain.add(mExplain, "Requested Page = " + pPageName);
    
    // Allow for domain being passed in request
    if( null == mDomain ) {
      // Resolve the domain based on the host
      try {
        mDomain = ResolveTenantUtil.resolveRequestDomain(pRequest);
        Explain.add(mExplain, "Domain = " + mDomain);
      } catch (DomainNotFoundException dne) {
        Explain.add(mExplain, "Unknown domain - redirecting to corportate website");
        redirectUrl = "http://www.feedhenry.com";
        proceed = false;
      }
    }
    
    if( proceed ) {
      
      // Allow for domain props being passed in request
      if( null == mDomainProps ) {
        // no user context available at this time, so use system user context
        mDomainProps = PropsManager.getDomainPropSet(UserContext.SYSTEM_USERCONTEXT, mDomain);
      }
      String requiredProtocol = mDomainProps.get(PROTOCOL_PROPERTY);
  
      String selectedProtocol = RequestUtil.resolveScheme(pRequest);
  
      // Ensure that we are using the correct protocol (https by default);
      if (!requiredProtocol.equals(selectedProtocol)) {
        String serverName = pRequest.getServerName();
        String redirect = requiredProtocol + "://" + serverName;
        Explain.add(mExplain, "Mismatched request scheme (required = " + requiredProtocol + " ~ received = " + selectedProtocol +"). Redirecting to " + redirect);
        redirectUrl = redirect;
        proceed = false;
      }
    }

    if(null != redirectUrl ) {
      // If a redirect url has been set, send the redirect.
      pResponse.sendRedirect(redirectUrl);
    }
    else {
      setNoCacheHeaders(pResponse);
      mInput = ResponseBeanBase.receiveJSON(pRequest);
      Explain.add(mExplain, "Input Params = " + mInput);      
    }
    
    return proceed;
  }
  
  public boolean canProceed(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageName) throws Exception {
    boolean canProceed = false;
    
    UserContext uc = new ExplainUserContext(mExplain);
    // check permissions
    this.mLoggedIn = checkAuthenticatedUser(pRequest, uc);

    JSONObject reqJson = JsonResponseBean.receiveJSON(pRequest);    
    String reqUri = pRequest.getRequestURI();    
    String reqPage = reqJson.optString("a", null);
    boolean checkPage = DEFAULT_URL.equals(reqUri);
    
    Explain.add(mExplain, "loggedIn = " + mLoggedIn + "; reqUri = " + reqUri + "; pPageName = " + pPageName + "; reqPage = " + reqPage + "; checkPage = " + checkPage);
    
    if( checkPage ) {
      if( null != reqPage && mAllowedActionRequest.contains(reqPage) )  {
        if( mLoggedIn ) {
          if (reqPage.equals(IDE_LANDING)) {
            reqPage = getPropPage(pRequest, pResponse, AUTH_LANDING_PAGES);
          } else if (reqPage.equals(IDE_LOGIN)) {
            reqPage = getPropPage(pRequest, pResponse, LOGIN_PAGES);
          }
          dispatchTo(pRequest, pResponse, reqPage);
        }
        else {
          if( reqPage.equals(IDE_LOGIN) ) {
            dispatchToProp(pRequest, pResponse, LOGIN_PAGES);
          }
          else {
            dispatchToProp(pRequest, pResponse, NOAUTH_LANDING_PAGES);
          }
        }
      }
      else {
        if( mLoggedIn ) {
          dispatchToProp(pRequest, pResponse, AUTH_LANDING_PAGES);
        }
        else {
          dispatchToProp(pRequest, pResponse, NOAUTH_LANDING_PAGES);
        }
      }
    }
    else {
      if( mLoggedIn ) {
        canProceed = true;
      }
      else {
        ArrayList<String> noAuthFiles = new ArrayList<String>(Arrays.asList(mDomainProps.get(NOAUTH_LANDING_PAGES).split(",")));
        ArrayList<String> loginFiles = new ArrayList<String>(Arrays.asList(mDomainProps.get(LOGIN_PAGES).split(",")));
        if( noAuthFiles.contains(pPageName) || loginFiles.contains(pPageName)) {
          canProceed = true;
        }
        else {
          String requiredProtocol = mDomainProps.get(PROTOCOL_PROPERTY);
          String serverName = pRequest.getServerName();
          String noAuthFile = mDomainProps.get(LOGIN);
          String redirect = requiredProtocol + "://" + serverName + "?a=" + noAuthFile;
  
          pResponse.sendRedirect(redirect);
        }
      }
    }
    
    return canProceed;
  }

  /**
   * TODO This method updates member field mUC
   */
  private boolean checkAuthenticatedUser(HttpServletRequest pRequest, UserContext uc)
    throws Exception {
  boolean loggedIn = false;
  
  AccessManager am = (AccessManager) AppContextUtil.getBean("internal-AccessManager");

  PropMakerManager pmm = ServletInit.makeHttpPropMakerManager();
    PropSet ps = new PropSet(pRequest, pmm);
    
    mUC = am.resolveUserContext(ps, pRequest, uc);  // TODO method updating field

  String loginStatus = ps.get("login-status");
    Explain.add(mExplain, "login-status = " + (null == loginStatus ? " <null>" : loginStatus));
    if (null != loginStatus && "active".equals(loginStatus) && null != mUC.getSub()) {
      loggedIn = mIdeUserManager.isAuthorised(mUC);
      Explain.add(mExplain, "Logged In = " + loggedIn);
        if (!loggedIn) {
          Explain.add(mExplain, "Error: Login failed, please try again. Code DEV100");
          pRequest.setAttribute("error_message", "Error: Login failed, please try again. Code DEV100");
        }
    } else {
      Explain.add(mExplain, "Error: Login failed, please try again. Code DEV101");
      pRequest.setAttribute("error_message", "Error: Login failed, please try again. Code DEV101");
    }

    return loggedIn;
  }


  public boolean isLoggedIn() {
    return mLoggedIn;
  }
  
  public String getEmail() {
    return mUC.getEmail();
  }
  
  public String getAccountType() {
    return mUC.getAccountType();
  }
  
  private void dispatchToProp(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageProp) throws Exception {
    String dispatchFile = getPropPage(pRequest, pResponse, pPageProp);
    
    dispatchTo(pRequest, pResponse, dispatchFile);
  }
    
  private String getPropPage(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageProp) {
    String dispatchFile = null;
    
    String dispatchFileProp = mDomainProps.get(pPageProp);
    String[] dispatchFiles = dispatchFileProp.split(",");
    // don't check array has at least one entry to ensure property is always set
    // i.e. if property isn't set, exception is thrown
    int pageNum = 0;
    int numPages = dispatchFiles.length;
    
    // only kick in page num logic if we have more than 1 possible page
    if (numPages > 1) {
      // check if we have a cookie that dictates page to use
      Cookie landing = ServletUtil.getCookie(STUDIO_PAGES_GROUP_COOKIE, pRequest);
      String landingVal = null;
      if (null != landing) {
        landingVal = landing.getValue();
      }
      if (null != landingVal && !"".equals(landingVal)) {
        // have a val, does it match an array index
        try {
          pageNum = Integer.parseInt(landingVal);
        } catch (NumberFormatException nFE) {
          // log issue, generate new page num and continue
          pageNum = generatePageNum(numPages, pPageProp); 
        }
      } else {
        pageNum = generatePageNum(numPages, pPageProp);
      }
      
      if (numPages < pageNum + 1) {
        // somehow got a dud page num, generate new page num and continue
        pageNum = generatePageNum(numPages, pPageProp);
        if (numPages < pageNum + 1) {
          // still got a dud page num, something odd here
          // num weights and pages not the same??
          // default to 0
          pageNum = 0;
        }
      }
      
      // store pagenum in cookie
      Cookie pageNumCookie = new Cookie(STUDIO_PAGES_GROUP_COOKIE, Integer.toString(pageNum));
      pResponse.addCookie(pageNumCookie);
    }
    
    dispatchFile = dispatchFiles[pageNum];
    
    return dispatchFile;
  }
  
  private int generatePageNum(int numPages, String pPageProp) {
    int pageNum = 0;

    // only generate a pagenum if we have at least 2 pages
    if (numPages > 1) {
      // generate a page num based on num pages and weights
      String dispatchFileWeight = mDomainProps.get(pPageProp + ".weights");
      
      String[] weights = null;
      if (null != dispatchFileWeight && !"".equals(dispatchFileWeight)) {
        weights = dispatchFileWeight.split(",");
      } else {
        // use even distribution
        weights = new String[numPages];
        float dist = 1f/numPages;
        for (int wi = 0, wl = weights.length; wi < wl; wi++) {
          weights[wi] = Float.toString(dist); 
        }
      }
      
      // have an array of weights, lets randomly generate a page num
      double randNum = Math.random();
      double total = 0;
      for (int wi = 0, wl = weights.length; wi < wl; wi++) {
        float wt = Float.parseFloat(weights[wi]);
        total += wt;
        if (randNum < total) {
          pageNum = wi;
          break;
        }
      }
    }
    
    return pageNum;
  }
    
  private void dispatchTo(HttpServletRequest pRequest, HttpServletResponse pResponse, String pPageName) throws Exception {
    String pPageUrl = resolveUrl(mDomain, pPageName);
    if( null != pPageUrl ) {
      Explain.add(mExplain, "displatchTo... " + pPageName);
      pRequest.setAttribute("result", "fail");
      pRequest.setAttribute("orginal_URI", pRequest.getRequestURI());
      pRequest.setAttribute("Explain", mExplain);
      pRequest.setAttribute("Domain", mDomain);
      pRequest.setAttribute("DomainProps", mDomainProps);
      pRequest.setAttribute("Theme", mTheme);
      RequestDispatcher dispatcher = pRequest.getRequestDispatcher(pPageUrl);
      dispatcher.forward(pRequest, pResponse);
    }
    else {
      Explain.add(mExplain, "dispatchTo() - could not resolve url for page " + pPageName);
      pResponse.sendError(404);
    }
  }
    
  private String resolveUrl(String pDomain, String pPage) throws Exception {
    String resolvedUrl = null;
    String themeName = getThemeName();
    
    if( ! pPage.endsWith(".html") ) {
      pPage += ".html";
    }
    
    String themeUrl = IDEWebBean.IDE_THEMES_FILE.replace("%theme%", themeName).replace("%file%", pPage);
    String defaultUrl = IDEWebBean.IDE_DEFAULT_FILE.replace("%file%", pPage);
    
    File fTheme = new File(mServletContext.getRealPath(themeUrl));
    File fDefault = new File(mServletContext.getRealPath(defaultUrl));
    if (fTheme.exists()) {
      resolvedUrl = themeUrl;
    } else if (fDefault.exists()) {
      resolvedUrl = defaultUrl;
    }
    return resolvedUrl;
  }
  
  /**
   * Set Headers for no caching of the response
   */
  // TODO: move this out to IdeSessionManager
  private void setNoCacheHeaders(HttpServletResponse pResponse) {
    pResponse.setHeader("Cache-Control", "no-cache");
    pResponse.setHeader("Pragma", "no-cache");
    pResponse.setDateHeader("Expires", -1);
  }

  public String getRevision() throws Exception {
    String version = String.valueOf(mALM.getAssetControlVal());
    return version;
  }

  public String getAssetCtrlVal() throws Exception {
    String val = String.valueOf(mALM.getAssetControlVal());
    return val;
  }

  public String getIdeThemeUrl() throws Exception {
    return mPropsBean.getThemeUrl(mDomain, getThemeName());
  }
  
  private String getThemeName() throws Exception {
    
    // Default to using the "default" theme
    String theme = "default";
    boolean resolved = false;
    
    // 1. Check if a theme has been specified in the URL
    if (null != mInput && mInput.has("theme")) {
      theme = mInput.getString("theme");
      resolved = true;
    }  
    
    // 2. Check if a theme has been assigned at the domain / customer / reseller level
    if( ! resolved ) {
      if( null == mTheme ) {
        mTheme = ResolveTenantUtil.resolveTheme(mDomain); 
      }

      if (!"".equals(mTheme)) {
        theme = mTheme;
        resolved = true;
      }
    }

    // 3. Check if the requesting user is an "enterprise" user
    if( ! resolved ) {
      if (null != mUC && (null != mUC.getAccountType()  && mUC.getAccountType().equals(UserPrefs.ACCOUNT_TYPE_ENTERPRISE_USER))){
        theme = IDEWebBean.THEME_ENTERPRISE;
        resolved = true;
      }
    }
    
    return theme;
  }
  
  public String getLanguage() {
    return "en";
  }

  public String getLoginDomain() {
    return mDomain;
  }

  public String getResetToken() {
    return mInput.optString("t");
  }
  
  public String getActivateToken() {
    return mInput.optString("t");
  }

  public JSONObject getProps() throws Exception {
    return mPropsBean.buildClientProps(mDomain, mUC);
  }
  
  public String getProperty(String pPropName) throws Exception {
    return mDomainProps.get(pPropName);
  }
  
  public String getJsonProperty(String pPropName) throws Exception {
    String[] parts = pPropName.split("\\.");
    JSONObject propJson = new JSONObject();
    String propValue = mDomainProps.get(parts[0]);
    boolean isJSON = true;
    try {
      propJson = new JSONObject(propValue);
    } catch(Exception e){
      isJSON = false;
    }
    String val = propValue;
    if(parts.length > 1 && isJSON){
      try{
        for(int i=1;i<parts.length;i++){
          if(i == parts.length - 1){
            val = propJson.getString(parts[i]);
          } else {
            propJson = new JSONObject(propJson.getString(parts[i]));
          }
        }
      } catch(Exception ex){
          
      }
    }
    return val;
  }
  
  public Map<String, String> getDocsLinks() throws Exception {
    Map<String, String> links = new HashMap<String, String>();

    String linksStr = null;
    String nodeEnabled = getProperty("nodejs.enabled");
    
    if ("true".equals(nodeEnabled)) {
      linksStr = getProperty("studio-js-landing-docs-v2");
    } else {
      linksStr = getProperty("studio-js-landing-docs-default");
    }
    
    try {
      JSONObject linksJson = new JSONObject(linksStr);
      Iterator it = linksJson.keys();
      while (it.hasNext()) {
        String key = (String) it.next();
        String val = linksJson.getString(key);
        links.put(key, val);
      }      
    }catch(Exception e) {
      Explain.add(mExplain, "Error parsing json docs property :", e.getMessage());
    }
    
    return links;
  }

  public String getInfoMessage() {
    String message = "";
    if (mInput.has("message")) {
      message = mInput.getString("message");

      if (ActivationBean.ALREADY_ACTIVATED.equals(message)) {
        message = "registration_already_activated";
      }
      if (ActivationBean.NO_SUCH_ACTIVATION.equals(message)) {
        message = "registration_no_such_activation";
      }
    }
    return message;
  }

  public String getStaticAssetPath(String pPath) throws Exception {
    String path = StpgAssetManager.insertAssetVersion(pPath, getLoginDomain());
    return path;
  }

  public String getThemeStaticAssetPath(String pPath) throws Exception {
    String fullPath = "ide/themes/" + getThemeName() + pPath;
    String staticPath = "/static/c/" + getStaticAssetPath(fullPath);
    return staticPath;    
  }
  
  public IdeUserManager getIdeUserManager() {
    return mIdeUserManager;
  }

  public void setIdeUserManager(IdeUserManager pIdeUserManager) {
    mIdeUserManager = pIdeUserManager;
  }

  /**
   * Check if the currently logged in user is in the specified group
   */
  public boolean inGroup(String[] groups) throws Exception {
    boolean inGroup = false;
    // Make sure we're logged in
    if (null != mUC) {

      for(int pI=0;pI<groups.length;pI++){
        String group = groups[pI];
        if( mUC.hasRole(group) ) {
          inGroup = true;
          break;
        }
      }
      
    }
    return inGroup;
  }
  
  public void addExplainError(Exception pException) {
    if( null != pException ) {
      Explain.add(mExplain, pException.getMessage());
    }
  }
  
  public String outputExplain() {
    StringBuilder sb = new StringBuilder();
    Explain.endRequest(mExplain);
    
    if( null != mExplain ) {
      sb.append("<!--\n");
      sb.append(mExplain.toJSONObject().toString(2));
      sb.append("\n!-->");
    }
    
    return sb.toString();
  }
}

