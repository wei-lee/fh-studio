package com.feedhenry.studio;


public class ServerInit {

  private static final String LOG_DIR_PROPERTY = "fh.logdir";
  private static final String NODE_PROPERTY = "feedhenry.node";

  private static final String DEFAULT_LOG_DIR = "/var/log/feedhenry";
  private static final String DEFAULT_NODE = "node00";
  
  private static String sLogDir;
  private static String sNode;
  
  public static void doInit() {
    resolveLogDir();
    resolveNode();
    //resolveSetup();
  }
  
  public static String resolveLogDir() {
    if( null == sLogDir ) {
      String logDir = System.getProperty(LOG_DIR_PROPERTY);
    
      if( null == logDir || "".equals(logDir) ) {
        logDir = DEFAULT_LOG_DIR;
        System.setProperty(LOG_DIR_PROPERTY, logDir);
      }

      sLogDir = logDir;
      System.out.println(LOG_DIR_PROPERTY + " = " + sLogDir);
    }
    return sLogDir;  
  }
  
  public static String resolveNode() {
    if( null == sNode ) {
      String node = System.getProperty(NODE_PROPERTY);
    
      if( null == node || "".equals(node) ) {
        node = DEFAULT_NODE;
        System.setProperty(NODE_PROPERTY, node);
      }

      sNode = node;
      System.out.println(NODE_PROPERTY + " = " + sNode);
    }
    return sNode;
  }
}
