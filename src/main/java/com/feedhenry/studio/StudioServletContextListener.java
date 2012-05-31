package com.feedhenry.studio;

import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

public class StudioServletContextListener implements ServletContextListener {
  
  private static final SimpleDateFormat format = new SimpleDateFormat("EEE dd MMM HH:mm:ss zzz yyyy");

  @Override
  public void contextDestroyed(ServletContextEvent arg0) {
    System.out.println("=============================================");
    System.out.println("Studio stopped (" + format.format(new Date()) + ")");
    System.out.println("=============================================");
  }

  @Override
  public void contextInitialized(ServletContextEvent arg0) {
    System.out.println("=============================================");
    System.out.println("Studio started (" + format.format(new Date()) + ")");
    System.out.println("=============================================");
  }

}
