package com.crm.services.impl;

import com.crm.data.model.Branch;
import com.crm.data.model.Customer;
import com.crm.data.model.Organization;
import com.crm.data.model.Type;
import com.crm.services.AdminService;
import com.crm.utils.DateUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.Date;

public class AdminServiceImpl extends BaseServiceImpl implements AdminService {
    private static final Logger LOGGER = LogManager.getLogger(AdminServiceImpl.class);

    public Iterable<Customer> getAllCustomers(boolean onlyEnabled) throws Exception {
        Iterable<Customer> result;
        if (onlyEnabled) {
            result = customersRepository.findByOrganization(user.getOrganization());
        } else {
            result = customersRepository.findByEnabledIsTrueAndOrganization(user.getOrganization());
        }
        return result;
    }

    public Customer getOneCustomer(Long custId, boolean onlyEnabled) throws Exception {
        Customer customer = customersRepository.findByIdAndOrganization(custId, user.getOrganization());
        if (onlyEnabled && null != customer && customer.getEnabled()) {
            return customer;
        } else if (onlyEnabled) {
            return null;
        } else {
            return customer;
        }
    }

    public Customer saveCustomer(Long customerId, String name, String address, String neighborhood, String city, String phone,
                                 String email, Long typeId, boolean enabled) throws Exception{
        Customer customer;
        Type type;
        if (null!=typeId) {
            type = typesRepository.findByIdAndOrganizationAndEnabledIsTrue(typeId,user.getOrganization());
            if (null==type) {
                throw new Exception("Invalid type id");
            }
        } else {
            throw new Exception("Type Id cannot be null");
        }
        if (null!=customerId) {
            customer = customersRepository.findByIdAndOrganization(customerId,user.getOrganization());
            if (null==customer) {
                throw new Exception("Invalid Customer Id");
            }
            customer.setName(name);
            customer.setAddress(address);
            customer.setNeighborhood(neighborhood);
            customer.setCity(city);
            customer.setPhone(phone);
            customer.setEmail(email);
            customer.setType(type);
            customer.setEnabled(enabled);
        } else {
            customer = new Customer();
            customer.setName(name);
            customer.setAddress(address);
            customer.setNeighborhood(neighborhood);
            customer.setCity(city);
            customer.setPhone(phone);
            customer.setEmail(email);
            customer.setType(type);
            customer.setEnabled(enabled);
            customer.setOrganization(user.getOrganization());
            customer.setStartDate(DateUtils.getCurrentDate());
        }
        return customersRepository.save(customer);
    }

    public void removeCustomer(Long customerId) throws Exception {
        Customer customer = customersRepository.findByIdAndOrganization(customerId, user.getOrganization());
        if (null!=customer) {
            customersRepository.delete(customer);
        } else {
            throw new Exception("Cannot remove customer id " + customerId);
        }
    }

    public Organization getOneOrganization(Long orgId, boolean onlyEnabled) throws Exception {
        Organization organization = organizationsRepository.findOne(orgId);
        if (onlyEnabled && organization != null && organization.getEnabled()) {
            return organization;
        } else if (onlyEnabled) {
            return null;
        } else {
            return organization;
        }
    }

    public Type getOneType(Long typeId) throws Exception {
        return typesRepository.findByIdAndOrganizationAndEnabledIsTrue(typeId, user.getOrganization());
    }

    public Iterable<Branch> getAllBranches(Long customerId, boolean onlyEnabled) throws Exception {
        Iterable<Branch> result;
        Customer customer = customersRepository.findByIdAndOrganization(customerId,user.getOrganization());
        if (null!=customer) {
            if (onlyEnabled) {
                result = branchesRepository.findByOrganizationAndCustomerAndEnabledIsTrue(user.getOrganization(), customer);
            } else {
                result = branchesRepository.findByOrganizationAndCustomer(user.getOrganization(), customer);
            }
            return result;
        }
        throw new Exception("Customer doesn't exists");
    };

    public Branch getOneBranch(Long branchId, boolean onlyEnabled) throws Exception {
        Branch branch = branchesRepository.findByIdAndOrganization(branchId, user.getOrganization());
        if (onlyEnabled && null != branch && branch.getEnabled()) {
            return branch;
        } else if (onlyEnabled) {
            return null;
        } else {
            return branch;
        }
    };

    public Branch saveBranch(Long branchId, String name, String address, String neighborhood, String city, String phone,
                             Long customerId, Long typeId, boolean enabled) throws Exception {
        Customer customer;
        if (null!=customerId) {
            customer = customersRepository.findByIdAndOrganization(customerId, user.getOrganization());
            if (null==customer) {
                throw new Exception("Invalid Customer Id");
            }
        } else {
            throw new Exception("Customer Id cannot be null");
        }
        Type type;
        if (null!=typeId) {
            type = typesRepository.findByIdAndOrganizationAndEnabledIsTrue(typeId,user.getOrganization());
            if (null==type) {
                throw new Exception("Invalid Type Id");
            }
        } else {
            throw new Exception("Type Id cannot be null");
        }

        Branch branch;
        if (null!=branchId) {
            branch = branchesRepository.findByIdAndOrganization(branchId, user.getOrganization());
            if (null==branch) {
                throw new Exception("Invalid Branch Id");
            }
            branch.setName(name);
            branch.setAddress(address);
            branch.setNeighborhood(neighborhood);
            branch.setCity(city);
            branch.setPhone(phone);
            branch.setCustomer(customer);
            branch.setType(type);
            branch.setEnabled(enabled);
        } else {
            branch = new Branch();
            branch.setName(name);
            branch.setAddress(address);
            branch.setNeighborhood(neighborhood);
            branch.setCity(city);
            branch.setPhone(phone);
            branch.setCustomer(customer);
            branch.setType(type);
            branch.setEnabled(enabled);
            branch.setStartDate(DateUtils.getCurrentDate());
            branch.setOrganization(user.getOrganization());
        }
        return branchesRepository.save(branch);
    };

    public void removeBranch(Long branchId) throws Exception {
        if (null==branchId) {
            throw new Exception("Branch Id cannot be null");
        }
        Branch branch = branchesRepository.findByIdAndOrganization(branchId,user.getOrganization());
        if (null==branch) {
            throw new Exception("Invalid Branch Id");
        }
        branchesRepository.delete(branch);
    };
}
