package com.sanjusto.controllers;

import com.sanjusto.controllers.commons.BaseController;
import com.sanjusto.data.model.User;
import com.sanjusto.services.SecurityService;
import com.sanjusto.services.impl.ServiceFactory;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping(value = "/api/v1/sec")
@Transactional(propagation = Propagation.REQUIRES_NEW)
public class SecurityController extends BaseController {

    protected static final Logger LOGGER = LogManager.getLogger(TreatmentsController.class);

    @Autowired
    ServiceFactory serviceFactory;

    @RequestMapping(value = "/authenticate", produces = "application/json; charset=UTF-8", method = {RequestMethod.POST})
    public @ResponseBody String authenticate(@RequestParam("username") String username
                                                ,@RequestParam("password") String password) throws Exception {
        try {
            SecurityService securityService = serviceFactory.getSecurityService();
            User user = securityService.authenticateUser(username, password);
            if (user==null) {
                return returnFail("INVALID_CREDENTIALS");
            }
            String token = securityService.createTokenForUser(user);
            return returnOK(user,token);
        } catch (Exception ex) {
            LOGGER.debug(ex);
            return returnFail(ex.getMessage());
        }
    }

    @RequestMapping(value = "/user", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String userWithToken(@RequestHeader("token") String token) throws Exception {
        try {
            SecurityService securityService = serviceFactory.getSecurityService();
            User user = securityService.getUserByToken(token);
            if (user==null) {
                return returnFail("INVALID_CREDENTIALS");
            }
            String newToken = securityService.createTokenForUser(user);
            return returnOK(user,newToken);
        } catch (Exception ex) {
            LOGGER.debug(ex);
            return returnFail(ex.getMessage());
        }
    }

    @RequestMapping(value = "/credentials/change", produces = "application/json; charset=UTF-8", method = {RequestMethod.GET})
    public @ResponseBody String changePassword(@RequestHeader("token") String token,
                                               @RequestParam("oldPass") String oldPass,
                                               @RequestParam("newPass") String newPass) throws Exception {
        try {
            SecurityService securityService = serviceFactory.getSecurityService();
            User user = securityService.getUserByToken(token);
            if (user==null) {
                return returnFail("INVALID_CREDENTIALS");
            }
            securityService.changePassword(oldPass,newPass,user.getId());
            String newToken = securityService.createTokenForUser(user);
            return returnOK(user,newToken);
        } catch (Exception ex) {
            LOGGER.debug(ex);
            return returnFail(ex.getMessage());
        }
    }
}
