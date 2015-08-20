package com.sanjusto.services;

import com.sanjusto.data.model.Customer;
import com.sanjusto.services.impl.ServiceFactory;
import com.sanjusto.utils.TransactionalSupportTest;
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
    private static final Logger log = LoggerFactory.getLogger(TreatmentServiceTest.class);

    @Test
    public void testGetAllCustomers() throws Exception {
        log.info("testGetAllCustomers");
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService customerService = serviceFactory.getTreatmentService();
        Iterable<Customer> result = customerService.getAllCustomers(true);
        assertNotNull(result);
        int counter = 0;
        for (Customer customer:result) {
            assertNotNull(customer);
            counter++;
        }
        log.info("counter " + counter);
        assertEquals("Should be equals to 1",1,counter);
        log.info("testGetAllCustomers");
    }
}
