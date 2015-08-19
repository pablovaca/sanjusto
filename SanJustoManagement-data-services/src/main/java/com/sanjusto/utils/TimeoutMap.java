package com.sanjusto.utils;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.lang.ref.WeakReference;
import java.util.*;

/**
 * Created by drobak on 18/02/15.
 * <p/>
 * A map with the ability to set a expireTime for each element.
 */
public class TimeoutMap {

    protected static final Logger log = LogManager.getLogger(TimeoutMap.class);
    static private Timer timer = new Timer(true);

    private static final int TIME_BETWEEN_CLEANUPS = (1000 * 60) * 10;  //10 mins
    private static List<WeakReference<TimeoutMap>> allMaps = new ArrayList<WeakReference<TimeoutMap>>();

    static {
        //This runs as soon as the first instance is created
        timer.schedule(new CleanupTask(), TIME_BETWEEN_CLEANUPS, TIME_BETWEEN_CLEANUPS);
    }

    private Map<Object, MapElement> valuesMap = null;
    private String description = null;

    public TimeoutMap(int initialCapacity, String description) {
        this.description = description;
        if (initialCapacity > 0)
            valuesMap = Collections.synchronizedMap(new HashMap<Object, MapElement>(initialCapacity));
        else
            valuesMap = Collections.synchronizedMap(new HashMap<Object, MapElement>());
        allMaps.add(new WeakReference(this));
    }

    public TimeoutMap(String description) {
        this(-1, description);
    }

    public TimeoutMap() {
        this(-1, "UNNAMED TimeoutMap");
    }

    synchronized public void put(Object key, Object value, long timeout) {
        valuesMap.put(key, new MapElement(value, timeout));
    }

    synchronized public Object get(Object key) {
        MapElement o = valuesMap.get(key);
        if (o == null)
            return null;
        if (o.expired()) {
            valuesMap.remove(key);
            return null;
        }

        return o.getValue();
    }

    synchronized public void remove(Object key) {
        valuesMap.remove(key);
    }

    synchronized private void cleanupMap() {
        Object[] keys = valuesMap.keySet().toArray(); //need to convert to array to avoid java.util.ConcurrentModificationException
        for (Object key : keys) {
            this.get(key); //call to 'get' will check expireTime and remove if necessary
        }
    }

    public String getDescription() {
        return description;
    }
    /************************************************/
    /**
     * ********************************************
     */
    public static void cleanupAllMaps() {
        synchronized(TimeoutMap.class) {
            int cant = allMaps.size();
            for (int i = 0; i < cant; i++) {
                WeakReference<TimeoutMap> reference = allMaps.get(i);
                TimeoutMap ht = reference.get();
                if (ht != null)
                    ht.cleanupMap();
                else {
                    allMaps.remove(i);
                    cant--;
                    i--;
                }
            }
        }
    }

    private static class CleanupTask extends TimerTask {
        public void run() {
            try {
                cleanupAllMaps();
            } catch (Exception e) {
                log.error("CleanupTask: Error inside cleanupAllMaps()",e);
            }
        }
    }

    private static class MapElement {
        private Object value;
        private long expireTime;

        boolean expired() {
            return expireTime < System.currentTimeMillis();
        }

        Object getValue() {
            return value;
        }

        MapElement(Object value, long timeout) {
            this.value = value;
            this.expireTime = System.currentTimeMillis() + timeout;
        }
    }

}
