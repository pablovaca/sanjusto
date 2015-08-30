package com.crm.utils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.*;

public class JSONUtils {
    public static Map<String, String> jsonArrayToMap(JSONArray jsonArray) throws JSONException {
        Map<String, String> retMap = new HashMap<String, String>();

        if(jsonArray != null) {
            for(int i=0;i< jsonArray.length();i++){
                JSONObject object = jsonArray.getJSONObject(i);
                @SuppressWarnings("unchecked")
                Iterator<String> keysItr = object.keys();
                String first = object.get(keysItr.next()).toString();
                String second = object.get(keysItr.next()).toString();
                retMap.put(first, second);
            }
        }
        return retMap;
    }

    public static List<Long> jsonArrayToList(JSONArray jsonArray) throws JSONException {
        List<Long> resultList = new ArrayList<Long>();

        if(jsonArray != null){
            for (int i = 0; i < jsonArray.length(); i++) {
                String value = jsonArray.getString(i);
                resultList.add(Long.valueOf(value));
            }
        }
        return resultList;
    }
}
