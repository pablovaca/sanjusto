package com.crm.services;

import com.crm.data.model.*;
import com.crm.services.impl.ServiceFactory;
import com.crm.utils.TransactionalSupportTest;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;

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
        Iterable<Customer> result = adminService.getAllCustomers(true,0,5);
        assertNotNull("Result should not be null", result);
        int counter = 0;
        for (Customer customer:result) {
            assertNotNull("Customer should not be null",customer);
            counter++;
        }
        LOGGER.info("counter " + counter);
        assertEquals("Should be equals to 1", 4, counter);
        LOGGER.info("testGetAllCustomers");
    }

    @Test
    public void testCrudCustomers() throws Exception {
        LOGGER.info("testCrudCustomers");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        Customer newCustomer = adminService.saveCustomer(null, "Test Customer", "Test Customer Address", "Test Neighborhood", "Test City",
                "123 Test", "emailCustomer@email.com", 1L, true);
        assertEquals("Id should be 2", 5, newCustomer.getId().longValue());

        Customer modifyCustomer = adminService.saveCustomer(newCustomer.getId(), "Test Customer", "Test Customer Address", "Test Neighborhood", "Test City",
                "123", "emailCustomer@email.com", 1L, true);
        assertEquals("Phone should be 123", "123", modifyCustomer.getPhone());

        adminService.removeCustomer(modifyCustomer.getId());
        Customer customerRemoved = adminService.getOneCustomer(5L);
        assertNull("Customer should be null", customerRemoved);
    }

    @Test
    public void testGetBranches() throws Exception {
        LOGGER.info("testGetBranches");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        Iterable<Branch> branches = adminService.getAllBranchesByCustomer(1L, true, 0 , 5);
        assertNotNull("Branches should not be null", branches);
        int counter=0;
        for (Branch branch:branches) {
            assertNotNull(branch);
            LOGGER.info("Branch " + branch.getName() + " - " + branch.getCustomer().getName());
            counter++;
        }
        assertEquals("Quantity of branches should be 2", 2, counter);
    }

    @Test
    public void testCrudBranches() throws Exception {
        LOGGER.info("testCrudBranches");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        Branch newBranch = adminService.saveBranch(null, "Test Branch", "Test Branch Address", "Test Branch Neighborhood", "Test Branch City", "123 Branch",
                1L, 26L, true);
        assertEquals("Branch should have id 3",6L,newBranch.getId().longValue());
        Branch modifyBranch = adminService.saveBranch(null, "Test Branch", "Test Branch Address", "Test Branch Neighborhood", "Test Branch City", "123",
                1L, 26L, true);
        assertEquals("Branch new phone number should be 123","123",modifyBranch.getPhone());

        adminService.removeBranch(modifyBranch.getId());
        Branch removedBranch = adminService.getOneBranch(modifyBranch.getId());
        assertNull("Branch should be null", removedBranch);
    }

    @Test
    public void testGetContact() throws Exception {
        LOGGER.info("testGetBranches");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        Iterable<Contact> contacts = adminService.getAllContactsByCustomer(1L, true, 0, 5);
        assertNotNull("Contacts should not be null", contacts);
        int counter=0;
        for (Contact contact:contacts) {
            assertNotNull(contact);
            LOGGER.info("Contact " + contact.getEmail() + " - " + contact.getCustomer().getName());
            counter++;
        }
        assertEquals("Quantity of Contacts should be 4", 4, counter);
    }

    @Test
    public void testCrudContacts() throws Exception {
        LOGGER.info("testCrudBranches");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        Contact newContact = adminService.saveContact(null, "firstName", "middleName", "lastName", "123 phone", "email234@contact.com", true, 1L);
        assertEquals("Contact should have id 5", 8L, newContact.getId().longValue());
        Contact modifyContact = adminService.saveContact(null, "firstName", "middleName", "lastName", "12345", "emai234l@contact.com", true, 1L);
        assertEquals("Contact new phone number should be 12345", "12345", modifyContact.getPhone());

        adminService.removeContact(modifyContact.getId());
        Contact removedContact = adminService.getOneContact(modifyContact.getId());
        assertNull("Contact should be null", removedContact);
    }

    @Test
    public void testGetContactByBranch() throws Exception {
        LOGGER.info("testGetBranches");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        List<Contact> contacts = adminService.getContactsByBranch(1L, true);
        assertNotNull("Contacts should not be null", contacts);
        int counter=0;
        for (Contact contact:contacts) {
            assertNotNull(contact);
            LOGGER.info("Contact " + contact.getEmail() + " - " + contact.getCustomer().getName());
            counter++;
        }
        assertEquals("Quantity of Contacts should be 2", 2, counter);
    }

    @Test
    public void testGetAllProduct() throws Exception {
        LOGGER.info("testGetAllProduct");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        Iterable<Product> products = adminService.getAllProducts();
        assertNotNull("Should not be null", products);
        int counter=0;
        for (Product product:products) {
            assertNotNull(product);
            LOGGER.info("Product " + product.getId() + " - " + product.getName());
            counter++;
        }
        assertEquals("Should be 3", 3, counter);
    }

    @Test
    public void testGetOneProduct() throws Exception {
        LOGGER.info("testGetOneProduct");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        Product product = adminService.getOneProduct(1L);
        assertNotNull("Should not be null", product);
        assertEquals("Should be FIPRONIL 2%", "FIPRONIL 2%", product.getName());
    }

    @Test
    public void testSaveNewProduct() throws Exception {
        LOGGER.info("testSaveNewProduct");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        String name = "Product Test";
        String description = "Product Test description";
        Double qty = 10.5D;
        Long unitTypeId = 25L;
        Product product = adminService.saveProduct(null, name, description, qty, unitTypeId);
        LOGGER.info("Product " + product.getId());
        assertNotNull("Should not be null", product);
        adminService.removeProduct(product.getId());
        Product newProduct = adminService.getOneProduct(product.getId());
        assertNull("Should be null", newProduct);
    }

    @Test
    public void testRemoveProductWithTreatment() throws Exception {
        LOGGER.info("testRemoveProductWithTreatment");
        User user = getTestUser();
        AdminService adminService = getAdminService(user);

        try {
            adminService.removeProduct(1L);
            Product newProduct = adminService.getOneProduct(1L);
            fail();
        } catch (DataIntegrityViolationException die) {
            LOGGER.info("Error", die);
        }
    }

    private AdminService getAdminService(User user) throws Exception {
        ServiceFactory serviceFactory = getServiceFactory();
        AdminService adminService = serviceFactory.getAdminService(user);
        return adminService;
    }
}
