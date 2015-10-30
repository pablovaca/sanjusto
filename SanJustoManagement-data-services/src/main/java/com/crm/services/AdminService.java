package com.crm.services;

import com.crm.data.model.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;

public interface AdminService {

    void setUser(User user);

    User getUser();

    Iterable<Customer> getAllCustomers(boolean onlyEnabled, int page, int size) throws Exception;

    Customer getOneCustomer(Long custId) throws Exception;

    Customer saveCustomer(Long customerId, String name, String address, String neighborhood, String city, String phone,
                          String email, Long customerTypeId, boolean enabled) throws Exception;

    void removeCustomer(Long customerId) throws Exception;

    Organization getOneOrganization(Long orgId) throws Exception;

    Type getOneType(Long typeId) throws Exception;

    Iterable<Branch> getAllBranchesByCustomer(Long customerId, boolean onlyEnabled) throws Exception;

    Branch getOneBranch(Long branchId) throws Exception;

    Branch saveBranch(Long branchId, String name, String address, String neighborhood, String city, String phone,
                      Long customerId, Long branchTypeId, boolean enabled) throws Exception;

    void removeBranch(Long branchId) throws Exception;

    Iterable<Contact> getAllContactsByCustomer(Long customerId, boolean onlyEnabled) throws Exception;

    Contact getOneContact(Long contactId) throws Exception;

    Contact saveContact(Long contactId, String firstName, String middleName, String lastName, String phone, String email,
                        boolean enabled, Long customerId) throws Exception;

    void removeContact(Long contactId) throws Exception;

    List<Contact> getContactsByBranch(Long branchId, boolean onlyEnabled) throws Exception;

    Iterable<Product> getAllProducts() throws Exception;

    Product getOneProduct(Long productId) throws Exception;

    Product saveProduct(Long productId, String productName, String productDescription, Double qty, Long unitTypeId) throws Exception;

    void removeProduct(Long productId) throws Exception, DataIntegrityViolationException;
}
