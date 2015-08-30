package com.crm.services;

import com.crm.data.model.Customer;
import com.crm.data.model.User;
import com.crm.services.impl.ServiceFactory;
import com.crm.utils.TransactionalSupportTest;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

/**
 * Created by pvaca on 8/17/15.
 */
public class TreatmentServiceTest extends TransactionalSupportTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(TreatmentServiceTest.class);

    @Test
    public void testGetAllCustomers() throws Exception {
        LOGGER.info("testGetAllCustomers");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService customerService = serviceFactory.getTreatmentService(user);
        Iterable<Customer> result = customerService.getAllCustomers(true);
        assertNotNull("Result should not be null",result);
        int counter = 0;
        for (Customer customer:result) {
            assertNotNull("Customer should not be null",customer);
            counter++;
        }
        LOGGER.info("counter " + counter);
        assertEquals("Should be equals to 1",1,counter);
        LOGGER.info("testGetAllCustomers");
    }
}
