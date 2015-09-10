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

    @RequestMapping(value = "/all", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String getAllCustomers(@RequestHeader("token") String token) throws Exception{
        String[] params = new String[]{"getAllTreatments",};
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
