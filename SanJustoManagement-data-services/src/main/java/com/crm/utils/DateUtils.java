package com.crm.utils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class DateUtils {

    public static Date getCurrentDate() {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(System.currentTimeMillis());
        return calendar.getTime();
    }

    public static Date getUTCDate(Long milliseconds){
        //Date converted to UTC
        if (milliseconds==null) return null;

        TimeZone currentTimezone = TimeZone.getDefault();
        Date currentDateUTC = new Date(milliseconds - currentTimezone.getRawOffset());

        return currentDateUTC;
    }

    /*
     * Receives a String in the format YYYYMMDDHH24MMSS and returns the corresponding UTC date.
     */
    public static Date getUTCDateFromString(String date) throws ParseException, Exception{
        DateFormat df = new SimpleDateFormat("yyyyMMddHHmmss", Locale.ENGLISH);
        Date result =  df.parse(date);
        return getUTCDate(result.getTime());
    }

    public static long getCurrentTime() throws Exception {
        return System.currentTimeMillis();
    }

    public static boolean isSameDay(Date date1,Date date2)
    {
        if (date1==null && date2==null)
            return true;
        if (date1==null || date2==null)
            return false;

        return org.apache.commons.lang.time.DateUtils.isSameDay(date1,date2);

    }

    public static Calendar getDateFromString(String stringDate) {
        //format expected YYYYMMDD
        Calendar calendar = Calendar.getInstance();
        calendar.set(new Integer(stringDate.substring(0, 4)), new Integer(stringDate.substring(4, 6))-1, new Integer(stringDate.substring(6, 8)),0,0,0);
        return calendar;
    }

    public static final long MILLIS_IN_DAY=24L*60L*60L*1000L;
    public static Date addDays(Date date,long days)
    {
        return new Date(date.getTime()+days*MILLIS_IN_DAY);

    }
    public static int elapsedDays(Date dateFrom,Date dateTo)
    {
        long timeGap=dateTo.getTime()-dateFrom.getTime();
        return Math.round(timeGap/MILLIS_IN_DAY);


    }
}
