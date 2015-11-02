package com.crm.controllers;

import com.crm.controllers.commons.BaseController;
import com.crm.data.model.User;
import com.crm.services.AdminService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.lang.reflect.InvocationTargetException;


@Controller
@RequestMapping(value = "/api/v1/admin")
@Transactional(propagation = Propagation.REQUIRES_NEW)
public class AdminController extends BaseController{

    protected static final Logger LOGGER = LogManager.getLogger(AdminController.class);

    @RequestMapping(value = "/customers/{page}/{size}", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String getAllCustomers(@RequestHeader("token") String token
                                                ,@PathVariable("page") Integer page
                                                ,@PathVariable("size") Integer size
                                                ,@RequestParam(value="onlyEnabled",required = false, defaultValue = "true") Boolean onlyEnabled) throws Exception{
        String[] params = new String[]{"getAllCustomers",token,onlyEnabled.toString(), String.valueOf(page), String.valueOf(size)};
        String param = this.makeJsonParam(params);
        return this.methodController(param);
    }

    @RequestMapping(value = "/branches/{page}/{size}", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String getAllBranches(@RequestHeader("token") String token
            ,@PathVariable("page") Integer page
            ,@PathVariable("size") Integer size
            ,@RequestParam(value="onlyEnabled",required = false, defaultValue = "true") Boolean onlyEnabled) throws Exception{
        String[] params = new String[]{"getAllBranches",token,onlyEnabled.toString(), String.valueOf(page), String.valueOf(size)};
        String param = this.makeJsonParam(params);
        return this.methodController(param);
    }

    @RequestMapping(value = "/contacts/{page}/{size}", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String getAllContacts(@RequestHeader("token") String token
            ,@PathVariable("page") Integer page
            ,@PathVariable("size") Integer size
            ,@RequestParam(value="onlyEnabled",required = false, defaultValue = "true") Boolean onlyEnabled) throws Exception{
        String[] params = new String[]{"getAllContacts",token,onlyEnabled.toString(), String.valueOf(page), String.valueOf(size)};
        String param = this.makeJsonParam(params);
        return this.methodController(param);
    }

    private String methodController(String param) {
        try {
            JSONObject jsonParam = new JSONObject(param);
            User user = getCurrentUser(jsonParam);
            if (user == null) {
                return returnFail(FAIL_MSG_NO_RIGHTS);
            }
            AdminService adminService = serviceFactory.getAdminService(user);
            String actionResult =  callService(adminService, AdminService.class, jsonParam);
            return actionResult;
        } catch (InvocationTargetException e) {
            Throwable target=e.getTargetException();
            if (target!=null)
            {
                return returnFail(target.getMessage());
            }
            LOGGER.error("Error in " + this.getClass(), e);
            return returnFail(e.getMessage());
        }catch (JSONException jsone) {
            LOGGER.error("Error in " + this.getClass(), jsone);
            LOGGER.error("Param=" + param);
            return returnFail(jsone.getMessage());
        }
        catch (Exception e) {
            LOGGER.error("Error in " + this.getClass(), e);
            return returnFail(e.getMessage());
        }
    }
}
