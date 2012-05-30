package com.feedhenry.studio;

import java.io.PrintWriter;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.commons.lang.time.FastDateFormat;
import org.apache.log4j.Logger;
import org.tssg.millicore.core.PropSet;
import org.tssg.millicore.http.RequestUtil;
import org.tssg.millicore.secure.UserContext;
import org.tssg.millicore.server.Common;

public final class Explain implements Serializable {

  private static final long serialVersionUID = 1L;

  private static final Logger log = Common.explainlog;

  // Use FastDateFormat instead of SimpleDateFormat as it is thread safe and
  // will not block
  // See
  // http://commons.apache.org/lang/api-2.4/org/apache/commons/lang/time/FastDateFormat.html
  private static FastDateFormat mDateFormat = FastDateFormat.getInstance("yyyy-MM-dd HH:mm:ss:SSS");

  private Pattern mIgnorePattern = Pattern.compile("(ignore\\[)(.*?)(\\])");

  private String mIdentifier;
  private long mCreationThread;
  private boolean mMultiThreaded = false;
  private Date mStartDate;
  private boolean mStackTracing = false;
  private boolean mDoSysOut = false;
  private List<String> mIgnore;

  private ArrayList<String> mLog = new ArrayList<String>();
  private HashMap<Long, ArrayList<String>> mThreadLog = new HashMap<Long, ArrayList<String>>();

  private HashMap<String, Date> mTimerMap = new HashMap<String, Date>();
  private HashMap<Long, HashMap<String, Date>> mThreadTimerMap = new HashMap<Long, HashMap<String, Date>>();

  public Explain() {
    this(new Date().toString());
  }

  public Explain(String pIdentifier) {
    initExplain(pIdentifier, null);
  }

  public Explain(String pIdentifier, String pParams) {
    initExplain(pIdentifier, pParams);
  }

  private void initExplain(String pIdentifier, String pParams) {
    mIdentifier = pIdentifier;
    // mIgnore = pIgnore;
    mStartDate = new Date();
    mCreationThread = Thread.currentThread().getId();
    Explain.add(this, "~~~~~~~~ START EXPLAIN ~~~~~~~~");

    if (null != pParams) {
      if (-1 < pParams.indexOf("stacktrace")) {
        setStackTracing(true);
      }
      if (-1 < pParams.indexOf("multiThreaded")) {
        setMultiThreaded(true);
      }
      if (-1 < pParams.indexOf("doSysOut")) {
        setDoSysOut(true);
      }

      Matcher m = mIgnorePattern.matcher(pParams);
      if (m.find()) {
        String ignoreText = m.group(2);
        if (null != ignoreText) {
          List<String> ignore = new ArrayList<String>();
          String[] ignores = ignoreText.split(" ");
          for (int i = 0; i < ignores.length; i++) {
            ignore.add(ignores[i]);
          }
          mIgnore = ignore;
        }
      }
    }
  }

  public static void reset(Explain pEx) {
    if (null != pEx) {
      pEx.reset();
    }
  }

  private void reset() {
    mLog = new ArrayList<String>();
    mThreadLog = new HashMap<Long, ArrayList<String>>();

    mTimerMap = new HashMap<String, Date>();
    mThreadTimerMap = new HashMap<Long, HashMap<String, Date>>();
  }

  /** @return null if no explain header */
  public static Explain newRequest(HttpServletRequest pRequest) {
    Explain ex = null;
    String headerval = pRequest.getHeader("X-FeedHenry-Explain");

    if (null != headerval && headerval.startsWith("active")) {
      ex = new Explain(RequestUtil.resolveIP(pRequest), headerval);
      Explain.startTimer(ex, "request");
      pRequest.setAttribute("explain", ex);
    }

    return ex;
  }

  public String getIdentifier() {
    return mIdentifier;
  }

  public List<String> getIgnoreList() {
    return mIgnore;
  }

  public void setStackTracing(boolean pStackTracing) {
    mStackTracing = pStackTracing;
  }

  public void setMultiThreaded(boolean pMultiThreaded) {
    mMultiThreaded = pMultiThreaded;
  }

  public void setDoSysOut(boolean pDoSysOut) {
    mDoSysOut = pDoSysOut;
  }

  public static void endRequest(Explain pExplain) {
    if (canProceed(pExplain)) {
      Date end = new Date();
      Explain.add(pExplain, "~~~~~~~~ END REQUEST ~~~~~~~~");
      Explain.add(pExplain, "duration: " + (end.getTime() - pExplain.mStartDate.getTime()));
    }
  }

  public static void add(Explain pExplain, Object... pStrObjs) {
    if (canProceed(pExplain)) {
      StringBuffer sb = new StringBuffer();
      buildMsg(sb, pStrObjs);
      add(pExplain, sb.toString());
    }
  }

  private static StringBuffer buildMsg(StringBuffer pSB, Object... pStrObjs) {

    for (int sI = 0; sI < pStrObjs.length; sI++) {
      Object strobj = pStrObjs[sI];
      if (strobj instanceof Object[]) {
        pSB.append("[");
        buildMsg(pSB, (Object[]) strobj);
        pSB.append("]");
      } else {
        pSB.append(String.valueOf(strobj));
      }
      pSB.append(" ");
    }
    return pSB;
  }

  public static void add(Explain pExplain, String pString) {
    add(pExplain, pString, null);
  }

  public static void add(Explain pExplain, String pString, Logger pLogger) {
    // If a logger has been passed, output the information to the log as
    // a debug message. This is a convient way to add the same information
    // to the Explain Output and a log file
    if (null != pLogger) {
      pLogger.debug(pString);
    }

    if (canProceed(pExplain)) {
      boolean ignore = false;
      if (null != pExplain.mIgnore) {
        for (Iterator<String> iterator = pExplain.mIgnore.iterator(); iterator.hasNext();) {
          String test = iterator.next();
          ignore = pString.startsWith(test);
          if (ignore) {
            break;
          }
        }
      }
      if (!ignore) {
        synchronized (pExplain) {
          String st = "";
          if (pExplain.mStackTracing) {
            st = "; " + traceStack();
          }

          st = mDateFormat.format(new Date()) + " (" + Thread.currentThread().getId() + ") : " + pString + st;

          if (pExplain.mMultiThreaded) {
            Long threadKey = new Long(Thread.currentThread().getId());
            ArrayList<String> threadLogList = new ArrayList<String>();
            ;
            if (pExplain.mThreadLog.containsKey(threadKey)) {
              threadLogList = pExplain.mThreadLog.get(threadKey);
            }
            threadLogList.add(st);
            pExplain.mThreadLog.put(threadKey, threadLogList);
          }

          pExplain.mLog.add(st);

          if (pExplain.mDoSysOut) {
            System.out.println(st);
          }

        }
      }
    }
  }

  public static void startTimer(Explain pExplain, String pName) {
    if (null != pExplain) {
      HashMap<String, Date> timerLog = new HashMap<String, Date>();
      if (pExplain.mMultiThreaded) {
        Long threadKey = new Long(Thread.currentThread().getId());
        if (pExplain.mThreadTimerMap.containsKey(threadKey)) {
          timerLog = pExplain.mThreadTimerMap.get(threadKey);
        } else {
          pExplain.mThreadTimerMap.put(threadKey, timerLog);
        }
      } else {
        timerLog = pExplain.mTimerMap;
      }

      if (!timerLog.containsKey(pName)) {
        Explain.add(pExplain, "~~~~~~~~~~~~~~~ START TIMER - " + pName);
        timerLog.put(pName, new Date());
      }
    }
  }

  public static long endTimer(Explain pExplain, String pName) {
    long retVal = -1;
    if (canProceed(pExplain)) {
      Date start = null;
      HashMap<String, Date> timerLog = new HashMap<String, Date>();
      if (pExplain.mMultiThreaded) {
        Long threadKey = new Long(Thread.currentThread().getId());

        if (pExplain.mThreadLog.containsKey(threadKey)) {
          timerLog = pExplain.mThreadTimerMap.get(threadKey);
        } else {
          pExplain.mThreadTimerMap.put(threadKey, timerLog);
        }
      } else {
        timerLog = pExplain.mTimerMap;
      }

      if (timerLog.containsKey(pName)) {
        start = timerLog.get(pName);
      }

      Date end = new Date();
      if (null == start) {
        Explain.add(pExplain, "~~~~~~~~~~~~~~~ !!! UNKNOWN TIMER: " + pName + " !!!");
      } else {
        retVal = end.getTime() - start.getTime();
        Explain.add(pExplain, "~~~~~~~~~~~~~~~ END TIMER - " + retVal + "ms : " + pName);

        timerLog.remove(pName);
      }
    }
    return retVal;
  }

  public List<String> getRequestLog() {
    ArrayList<String> out = new ArrayList<String>();
    synchronized (mLog) {
      out.addAll(mLog);
    }
    return out;
  }

  public String toString() {
    StringBuffer sb = new StringBuffer();
    synchronized (mLog) {
      for (String log : mLog) {
        sb.append(log);
        sb.append("\n");
      }
    }
    return "Explain:" + hashCode() + ":" + mIdentifier + ":\n" + sb;
  }

  public JSONObject toJSONObject() {
    JSONObject jo = new JSONObject();
    JSONArray logja = new JSONArray();

    synchronized (mLog) {
      for (String logI : mLog) {
        logja.put(logI);
      }
    }

    if (mMultiThreaded) {
      JSONObject threadLogContainerJo = new JSONObject();
      synchronized (mThreadLog) {
        for (Long id : mThreadLog.keySet()) {
          JSONArray threadLogJa = new JSONArray();
          for (String threadlogI : mThreadLog.get(id)) {
            threadLogJa.put(threadlogI);
          }
          threadLogContainerJo.put(id.toString(), threadLogJa);
        }
        jo.put("Thread Logs ", threadLogContainerJo);
      }
    }

    jo.put("hashcode", hashCode());
    jo.put("identifier", mIdentifier);
    jo.put("log", logja);
    return jo;
  }

  public static String traceStack() {
    StackTraceElement[] traceElements = Thread.currentThread().getStackTrace();
    StringBuffer stackTraceBuffer = new StringBuffer();

    for (int i = 0; i < traceElements.length; i++) {
      if (i > 3 && i < 12) {
        StackTraceElement element = traceElements[i];
        stackTraceBuffer.append(" ^ ");
        stackTraceBuffer.append(element.toString());
      }
    }

    return stackTraceBuffer.toString();
  }

  public static Explain newExplain() {
    return newExplain(null);
  }

  public static Explain newExplain(String pParams) {
    Explain explain = new Explain(new Date().toString(), pParams);

    return explain;
  }

  public static void endExplain(Explain pExplain) {
    endExplain(pExplain, null, null);
  }

  public static void endExplain(Explain pExplain, PropSet pPropSet) {
    endExplain(pExplain, pPropSet, null);
  }

  public static void endExplain(Explain pExplain, PropSet pPropSet, UserContext pUC) {
    if (canProceed(pExplain)) {
      Explain.add(pExplain, null == pUC ? "" : "resources used: " + pUC.getResourceListener());
      Explain.add(pExplain, null == pPropSet ? "" : "partial propset: " + pPropSet.getCurrentProps());
      Explain.add(pExplain, "~~~~~~~~ END EXPLAIN ~~~~~~~~");
      Date end = new Date();
      Explain.add(pExplain, "duration: " + (end.getTime() - pExplain.mStartDate.getTime()));
      log.debug(pExplain);
    }
  }

  private static boolean canProceed(Explain pExplain) {
    boolean proceed = false;

    if (null != pExplain) {
      if (pExplain.mMultiThreaded) {
        proceed = true;
      } else {
        if (Thread.currentThread().getId() == pExplain.mCreationThread) {
          proceed = true;
        }
      }
    }

    return proceed;
  }

  public static void inject(Explain pExplain, JSONObject pJSON) {
    if (null != pExplain) {
      JSONObject ej = pExplain.toJSONObject();
      pJSON.put("__explain", ej);
    }
  }

  public static String append(Explain pExplain, String pTarget, String pContentType) {

    StringBuilder sb = new StringBuilder();
    sb.append(pTarget);

    if (null != pExplain) {
      JSONObject ej = pExplain.toJSONObject();

      String prefix = "";
      String postfix = "";
      if (pContentType.indexOf("text/html") > -1) {
        prefix = "<!--";
        postfix = "-->";
      }

      if (pContentType.indexOf("/javascript") > -1) {
        prefix = "/*";
        postfix = "*/";
      }

      sb.append("\n");
      sb.append(prefix);
      sb.append(ej.toString(2));
      sb.append(postfix);
    }

    return sb.toString();
  }

  public static void print(Explain pExplain, PrintWriter pPW) {
    if (null != pExplain) {
      pPW.print(pExplain.toString());
    }
  }

}
