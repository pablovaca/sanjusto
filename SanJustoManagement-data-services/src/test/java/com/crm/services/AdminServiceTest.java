package com.crm.services;

import com.crm.data.model.*;
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
        AdminService adminService = getAdminService(user);
        Iterable<Customer> result = adminService.getAllCustomers(true);
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
        AdminService adminService = getAdminService(user);

        Customer newCustomer = adminService.saveCustomer(null, "Test Customer", "Test Customer Address", "Test Neighborhood", "Test City",
                                                        "123 Test", "emailCustomer@email.com", 1L, true);
        assertEquals("Id should be 2", 2, newCustomer.getId().longValue());

        Customer modifyCustomer = adminService.saveCustomer(newCustomer.getId(), "Test Customer", "Test Customer Address", "Test Neighborhood", "Test City",
                                                        "123", "emailCustomer@email.com", 1L, true);
        assertEquals("Phone should be 123", "123", modifyCustomer.getPhone());

        adminService.removeCustomer(modifyCustomer.getId());
        Customer customerRemoved = adminService.getOneCustomer(2L,true);
        assertNull("Customer should be null",customerRemoved);
    }

    @Test
    public void testGetBranches() throws Exception {
        LOGGER.info("testGetBranches");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        Iterable<Branch> branches = adminService.getAllBranches(1L,true);
        assertNotNull("Branches should not be null",branches);
        int counter=0;
        for (Branch branch:branches) {
            assertNotNull(branch);
            LOGGER.info("Branch " + branch.getName() + " - " + branch.getCustomer().getName());
            counter++;
        }
        assertEquals("Quantity of branches should be 2",2,counter);
    }

    @Test
    public void testCrudBranches() throws Exception {
        LOGGER.info("testCrudBranches");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        Branch newBranch = adminService.saveBranch(null,"Test Branch","Test Branch Address","Test Branch Neighborhood", "Test Branch City", "123 Branch",
                                                    1L, 26L,true);
        assertEquals("Branch should have id 3",3L,newBranch.getId().longValue());
        Branch modifyBranch = adminService.saveBranch(null,"Test Branch","Test Branch Address","Test Branch Neighborhood", "Test Branch City", "123",
                1L, 26L,true);
        assertEquals("Branch new phone number should be 123","123",modifyBranch.getPhone());

        adminService.removeBranch(modifyBranch.getId());
        Branch removedBranch = adminService.getOneBranch(modifyBranch.getId(),true);
        assertNull("Branch should be null",removedBranch);
    }

    private AdminService getAdminService(User user) throws Exception {
        ServiceFactory serviceFactory = getServiceFactory();
        AdminService adminService = serviceFactory.getAdminService(user);
        return adminService;
    }
}
