package com.sanjusto.utils;

import com.sanjusto.data.model.User;
import com.sanjusto.services.SecurityService;
import com.sanjusto.services.impl.ServiceFactory;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.transaction.TransactionConfiguration;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

@ContextConfiguration("classpath:applicationContext.xml")
@TransactionConfiguration(defaultRollback = true)
public abstract class TransactionalSupportTest extends AbstractTransactionalJUnit4SpringContextTests {

    @Autowired
    private ServiceFactory serviceFactory;

    @Autowired
    private EntityManagerFactory emf;

    @Autowired
    private EntityManager entityManager;

    static {
        SpringSupportTest.setupEnvironment();
    }

    protected Session getSession() {
        return entityManager.unwrap(Session.class);
    }

    protected ServiceFactory getServiceFactory() {
        return serviceFactory;
    }

    protected User getTestUser() {
        SecurityService securityService = serviceFactory.getSecurityService();
        try {
            return securityService.authenticateUser("pvaca", "123456");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
