package com.crm.services;

import com.crm.data.model.User;
import com.crm.services.impl.ServiceFactory;
import com.crm.utils.TransactionalSupportTest;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

public class SecurityServiceTest extends TransactionalSupportTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityServiceTest.class);

    @Test
    public void testSetPassword() throws Exception {
        LOGGER.info("testSetPassword");
        ServiceFactory serviceFactory = getServiceFactory();
        SecurityService securityService = serviceFactory.getSecurityService();
        User user = securityService.setPassword("pvaca","123456");
        assertNotNull("User should not be null",user);
        assertNotNull("Password should not be null",user.getPassword());
        LOGGER.info("password");
        LOGGER.info(user.getPassword());
    }

    @Test
    public void testAuthenticateUserEnabled() throws Exception {
        LOGGER.info("testAuthenticateUser");
        ServiceFactory serviceFactory = getServiceFactory();
        SecurityService securityService = serviceFactory.getSecurityService();
        User user = securityService.authenticateUser("pvaca", "123456");
        assertNotNull("User should not be null",user);
    }

    @Test
    public void testAuthenticateUserDisabled() throws Exception {
        LOGGER.info("testAuthenticateUserDisabled");
        ServiceFactory serviceFactory = getServiceFactory();
        SecurityService securityService = serviceFactory.getSecurityService();
        User user = securityService.authenticateUser("udisabled", "123456");
        assertNull("User should be null",user);
    }

    @Test
    public void testAuthenticateUserNonExistent() throws Exception {
        LOGGER.info("testAuthenticateUserNonExistent");
        ServiceFactory serviceFactory = getServiceFactory();
        SecurityService securityService = serviceFactory.getSecurityService();
        User user = securityService.authenticateUser("nonExistent", "123456");
        assertNull("User should be null",user);
    }

    @Test
    public void testCreateTokenForUser() throws Exception {
        LOGGER.info("testCreateTokenForUser");
        ServiceFactory serviceFactory = getServiceFactory();
        SecurityService securityService = serviceFactory.getSecurityService();
        User user = securityService.authenticateUser("pvaca", "123456");
        assertNotNull("User should not be null",user);

        String token = securityService.createTokenForUser(user);
        LOGGER.info("token " + token);
        assertNotNull("Token should not be null",token);

        User newUser = securityService.getUserByToken(token);
        assertNotNull("New user should not be null",newUser);
        LOGGER.info("User " + newUser.getEmail());
    }

    @Test
    public void testChangePassword() throws Exception {
        LOGGER.info("testChangePassword");
        ServiceFactory serviceFactory = getServiceFactory();
        SecurityService securityService = serviceFactory.getSecurityService();
        User user = securityService.authenticateUser("pvaca", "123456");
        assertNotNull("should not be null after authenticate",user);
        securityService.changePassword("123456", "654321", user.getId());
        user = securityService.authenticateUser("pvaca", "654321");
        assertNotNull("Should not be null after change password",user);
    }
}
