package com.crm.services;

import com.crm.data.model.*;

public interface AdminService {

    void setUser(User user);

    User getUser();

    Iterable<Customer> getAllCustomers(boolean onlyEnabled) throws Exception;

    Customer getOneCustomer(Long custId, boolean onlyEnabled) throws Exception;

    Customer saveCustomer(Long customerId, String name, String address, String neighborhood, String city, String phone,
                          String email, Long typeId, boolean enabled) throws Exception;

    void removeCustomer(Long customerId) throws Exception;

    Organization getOneOrganization(Long orgId, boolean onlyEnabled) throws Exception;

    Type getOneType(Long typeId) throws Exception;

    Iterable<Branch> getAllBranches(Long customerId, boolean onlyEnabled) throws Exception;

    Branch getOneBranch(Long branchId, boolean onlyEnabled) throws Exception;

    Branch saveBranch(Long branchId, String name, String address, String neighborhood, String city, String phone,
                      Long customerId, Long typeId, boolean enabled) throws Exception;

    void removeBranch(Long branchId) throws Exception;
}
