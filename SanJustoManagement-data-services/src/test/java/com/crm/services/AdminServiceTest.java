package com.crm.services;

import com.crm.data.model.Customer;
import com.crm.data.model.Organization;
import com.crm.data.model.Type;
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
public class AdminServiceTest extends TransactionalSupportTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(AdminServiceTest.class);

    @Test
    public void testGetAllCustomers() throws Exception {
        LOGGER.info("testGetAllCustomers");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        AdminService customerService = serviceFactory.getAdminService(user);
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

    @Test
    public void testCrudCustomers() throws Exception {
        LOGGER.info("testCrudCustomers");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        AdminService customerService = serviceFactory.getAdminService(user);

        Organization organization = customerService.getOneOrganization(1L, true);
        Type type = customerService.getOneType(1l);

        Customer customer = new Customer();
        customer.setName("Test Uno");
        customer.setAddress("Test Address");
        customer.setCity("Test City");
        customer.setEmail("test@email.com");
        customer.setNeighborhood("Test neighborhood");
        customer.setOrganization(organization);
        customer.setPhone("Test phone 1234");
        customer.setType(type);
        customer.setEnabled(true);

        Customer newCustomer = customerService.saveCustomer(customer);
        assertEquals("Id should be 2", 2, newCustomer.getId().longValue());

        newCustomer.setPhone("123");
        Customer modifyCustomer = customerService.saveCustomer(newCustomer);
        assertEquals("Phone should be 123", "123", modifyCustomer.getPhone());

        customerService.removeCustomer(modifyCustomer);
        Customer customerRemoved = customerService.getOneCustomer(2L,true);
        assertNull("Customer should be null",customerRemoved);
    }
}
