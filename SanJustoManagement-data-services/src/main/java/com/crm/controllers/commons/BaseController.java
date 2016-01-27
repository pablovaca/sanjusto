package com.crm.controllers.commons;

import com.crm.data.model.User;
import com.crm.services.SecurityService;
import com.crm.services.TreatmentService;
import com.crm.services.impl.ServiceFactory;
import com.crm.utils.DateUtils;
import com.crm.utils.JSONConverter;
import com.crm.utils.JSONUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.ParseException;
import java.util.Map;

/**
 *
 * Created by drobak on 26/11/14.
 */
public abstract class BaseController {
    private static final Logger LOGGER = LogManager.getLogger(BaseController.class);
    protected static final JSONConverter converter = new JSONConverter();

    @Autowired
    protected ServiceFactory serviceFactory;

    protected String FAIL_MSG_NO_RIGHTS="NO_RIGHTS";

    void setServiceFactory(ServiceFactory sf){serviceFactory=sf;}

    protected User getCurrentUser(JSONObject jsonParam) throws JSONException
    {
        String token=jsonParam.getString("token");

        if (token==null || token.isEmpty()) {
            return null;
        }

        SecurityService securityService = serviceFactory.getSecurityService();
        return  securityService.getUserByToken(token);

    }

    protected String callService(Object serviceToCall,Class serviceInterface,JSONObject jsonParam) throws JSONException, InvocationTargetException, IllegalAccessException, ParseException, Exception {
        try
        {
            Object callBack = callServiceRaw(serviceToCall,serviceInterface,jsonParam, null);
            return returnOK(callBack);
        }
        catch(Exception exception)
        {
            return returnFail(exception.getMessage());
        }
    }

    protected Object callServiceRaw(Object serviceToCall,Class serviceInterface,JSONObject jsonParam, HttpServletRequest request) throws JSONException, InvocationTargetException, IllegalAccessException, ParseException, Exception {
        String action=jsonParam.getString("action");

        if (action==null) {
            return returnFail("no action provided");
        }

        for (Method method :serviceInterface.getMethods())
        {
            Class<?>[] params = method.getParameterTypes();
            if (!method.getName().equals(action)) {
                continue;
            }
            Object [] methodParams=new Object[params.length];
            int pos;
            for(pos=0;pos<params.length;pos++) {
                String paramName="p"+(pos+1);

                if (!jsonParam.has(paramName))
                {
                    break;
                }

                if (params[pos].getName().equals("java.lang.String"))
                {
                    methodParams[pos]=jsonParam.getString(paramName);
                }
                else if (params[pos].getName().equals("java.lang.Long"))
                {
                    methodParams[pos]=jsonParam.getLong(paramName);
                }
                else if (params[pos].getName().equals("long"))
                {
                    methodParams[pos]=jsonParam.getLong(paramName);
                }
                else if (params[pos].getName().equals("java.lang.Integer"))
                {
                    methodParams[pos]=jsonParam.getInt(paramName);
                }
                else if (params[pos].getName().equals("int"))
                {
                    methodParams[pos]=jsonParam.getInt(paramName);
                }
                else if (params[pos].getName().equals("boolean"))
                {
                    methodParams[pos]=jsonParam.getBoolean(paramName);
                }
                else if (params[pos].getName().equals("java.util.Date"))
                {
                    methodParams[pos] = DateUtils.getUTCDate(jsonParam.getLong(paramName));

                }
                else if (params[pos].getName().equals("[B"))
                {
                    if(request != null){
                        try {
                            MultipartHttpServletRequest multipartRequest=(MultipartHttpServletRequest)request;
                            MultipartFile file=multipartRequest.getFile(jsonParam.getString(paramName));
                            if(file != null){
                                methodParams[pos]=file.getBytes();
                            }
                        } catch (Exception e) {
                            LOGGER.error("Error in " + this.getClass(), e);
                            throw new Exception("Invalid multipart file");
                        }
                    }
                }
                else if (params[pos].getName().equals("java.util.Map"))
                {
                    JSONArray param = (JSONArray)jsonParam.get(paramName);
                    methodParams[pos]= JSONUtils.jsonArrayToMap(param);
                }
                else if (params[pos].getName().equals("java.util.List"))
                {
                    JSONArray param = (JSONArray)jsonParam.get(paramName);
                    methodParams[pos] = JSONUtils.jsonArrayToList(param);
                }
                else {
                    throw new Exception("Param data type incorrect: "+paramName);
                }
            }

            if (pos!=params.length)
            {
                continue;
            }

            String paramName="p"+(pos+1);
            if (jsonParam.has(paramName))
            {
                continue;
            }

            return method.invoke(serviceToCall,methodParams);
        }

        throw new Exception("Called method is wrong or invalid number of parameters: " + action);
    }

    protected String returnFail(String message) {

        ControllerResponse result = new ControllerResponse("FAIL",message);
        try {
            return result.toJSONString();
        }
        catch(JSONException e)
        {
            return "{\"status\":\"FAIL\"}";
        }
    }

    protected String returnOK(Object resultObj) throws JSONException {
        return returnOK(resultObj, "");
    }

    protected String returnOK(Object resultObj,String token) throws JSONException {
        return returnOK(resultObj,token,null);
    }

    protected String returnOK(Object resultObj,String token,Map additionalInfo) throws JSONException {
        ControllerResponse result = new ControllerResponse("OK","",resultObj);
        result.setToken(token);
        result.setAdditionalInfo(additionalInfo);
        return result.toJSONString();
    }

    protected String makeJsonParam(String[] params) throws Exception {
        String jsonParam = "{action:\""+params[0]+"\";token:\""+params[1]+"\"";

        for (int i=2;i<params.length;i++){
            jsonParam += ";p"+(i-1)+":"+params[i]+"";
        }

        jsonParam += "}";
        return jsonParam;
    }
}
