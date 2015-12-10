package com.crm.controllers;

import com.crm.controllers.commons.BaseController;
import com.crm.data.model.User;
import com.crm.services.AdminService;
import com.crm.services.TreatmentService;
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
@RequestMapping(value = "/api/v1/treatments")
@Transactional(propagation = Propagation.REQUIRES_NEW)
public class TreatmentController extends BaseController{

    protected static final Logger LOGGER = LogManager.getLogger(TreatmentController.class);

    @RequestMapping(value = "/all/{page}/{size}", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String getAllTreatments(@RequestHeader("token") String token
                                                ,@PathVariable("page") Integer page
                                                ,@PathVariable("size") Integer size) throws Exception {
        String[] params = new String[]{"getAllTreatments", token, String.valueOf(page), String.valueOf(size)};
        String param = this.makeJsonParam(params);
        return this.methodController(param);
    }

    @RequestMapping(value = "/locateCustomers", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String locateCustomers(@RequestHeader("token") String token
                                                , @RequestParam("search") String search) throws Exception {
        String[] params = new String[]{"locateCustomers", token, search};
        String param = this.makeJsonParam(params);
        return this.methodController(param);
    }

    @RequestMapping(value = "/locateBranches", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String locateBranches(@RequestHeader("token") String token
            , @RequestParam("search") String search) throws Exception {
        String[] params = new String[]{"locateBranches", token, search};
        String param = this.makeJsonParam(params);
        return this.methodController(param);
    }

    @RequestMapping(value = "/users", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String getAllUsers(@RequestHeader("token") String token) throws Exception {
        String[] params = new String[]{"getAllUsers", token};
        String param = this.makeJsonParam(params);
        return this.methodController(param);
    }

    @RequestMapping(value = "/types/{keyType}", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String getTypes(@RequestHeader("token") String token
                                        ,@PathVariable("keyType") String keyType) throws Exception {
        String[] params = new String[]{"getTypes", token, keyType};
        String param = this.makeJsonParam(params);
        return this.methodController(param);
    }

    @RequestMapping(value = "/branchByCustomer/{customerId}", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String getBranchesByCustomer(@RequestHeader("token") String token
            ,@PathVariable("customerId") long customerId) throws Exception {
        String[] params = new String[]{"getAllBranchesByCustomer", token, String.valueOf(customerId)};
        String param = this.makeJsonParam(params);
        return this.methodController(param);
    }

    @RequestMapping(value = "/new", produces = "application/json; charset=UTF-8", method = {RequestMethod.POST})
    public @ResponseBody String saveTreatment(@RequestHeader("token") String token
            ,@RequestParam("treatment") String treatment) throws Exception {
        String[] params = new String[]{"saveTreatment", token, treatment};
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
            TreatmentService treatmentService = serviceFactory.getTreatmentService(user);
            String actionResult =  callService(treatmentService, TreatmentService.class, jsonParam);
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
