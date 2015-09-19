package com.crm.services.impl;

import com.crm.data.model.*;
import com.crm.services.AdminService;
import com.crm.utils.DateUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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

    public Customer getOneCustomer(Long custId) throws Exception {
        Customer customer = customersRepository.findByIdAndOrganization(custId, user.getOrganization());
        if (null != customer) {
            return customer;
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

    public Organization getOneOrganization(Long orgId) throws Exception {
        Organization organization = organizationsRepository.findOne(orgId);
        if (null != organization) {
            return organization;
        } else {
            return organization;
        }
    }

    public Type getOneType(Long typeId) throws Exception {
        return typesRepository.findByIdAndOrganizationAndEnabledIsTrue(typeId, user.getOrganization());
    }

    public Iterable<Branch> getAllBranchesByCustomer(Long customerId, boolean onlyEnabled) throws Exception {
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

    public Branch getOneBranch(Long branchId) throws Exception {
        Branch branch = branchesRepository.findByIdAndOrganization(branchId, user.getOrganization());
        if (null != branch) {
            return branch;
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
    }

    public Iterable<Contact> getAllContactsByCustomer(Long customerId, boolean onlyEnabled) throws Exception {
        Iterable<Contact> result;
        Customer customer = customersRepository.findByIdAndOrganization(customerId,user.getOrganization());
        if (null!=customer) {
            if (onlyEnabled) {
                result = contactsRepository.findByCustomerAndEnabledIsTrueAndOrganization(customer,user.getOrganization());
            } else {
                result = contactsRepository.findByCustomerAndOrganization(customer, user.getOrganization());
            }
            return result;
        }
        throw new Exception("Customer doesn't exists");
    }

    public Contact getOneContact(Long contactId) throws Exception {
        Contact contact = contactsRepository.findByIdAndOrganization(contactId, user.getOrganization());
        if (null != contact) {
            return contact;
        } else {
            return contact;
        }
    }

    public Contact saveContact(Long contactId, String firstName, String middleName, String lastName, String phone, String email,
                        boolean enabled, Long customerId) throws Exception {
        Customer customer;
        if (null!=customerId) {
            customer = customersRepository.findByIdAndOrganization(customerId, user.getOrganization());
            if (null==customer) {
                throw new Exception("Invalid Customer Id");
            }
        } else {
            throw new Exception("Customer Id cannot be null");
        }

        Contact contact;
        if (null!=contactId) {
            contact = contactsRepository.findByIdAndOrganization(contactId, user.getOrganization());
            if (null==contact) {
                throw new Exception("Invalid Contact Id");
            }
            contact.setFirstName(firstName);
            contact.setMiddleName(middleName);
            contact.setLastName(lastName);
            contact.setPhone(phone);
            contact.setEmail(email);
            contact.setEnabled(enabled);
            contact.setOrganization(user.getOrganization());
            contact.setCustomer(customer);
        } else {
            contact = new Contact();
            contact.setFirstName(firstName);
            contact.setMiddleName(middleName);
            contact.setLastName(lastName);
            contact.setPhone(phone);
            contact.setEmail(email);
            contact.setEnabled(enabled);
            contact.setOrganization(user.getOrganization());
            contact.setCustomer(customer);
        }
        return contactsRepository.save(contact);
    }

    public void removeContact(Long contactId) throws Exception {
        if (null==contactId) {
            throw new Exception("Contact Id cannot be null");
        }
        Contact contact = contactsRepository.findByIdAndOrganization(contactId,user.getOrganization());
        if (null==contact) {
            throw new Exception("Invalid Contact Id");
        }
        contactsRepository.delete(contact);
    }

    public List<Contact> getContactsByBranch(Long branchId, boolean onlyEnabled) throws Exception {
        List<Contact> contacts = new ArrayList<Contact>();
        if (null==branchId) {
            throw new Exception("Branch Id cannot be null");
        }
        Branch branch = branchesRepository.findByIdAndOrganization(branchId,user.getOrganization());
        if (null==branch) {
            throw new Exception("Invalid Branch Id");
        }
        Iterable<BranchContact> results;
        if (onlyEnabled) {
            results = branchesContactsRepository.findByBranchAndEnabledIsTrue(branch);
        } else {
            results = branchesContactsRepository.findByBranch(branch);
        }
        for (BranchContact branchContact:results) {
            contacts.add(branchContact.getContact());
        }
        return contacts;
    }
}
