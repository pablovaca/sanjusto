package com.crm.services.impl;

import com.crm.data.model.*;
import com.crm.services.AdminService;
import com.crm.utils.DateUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class AdminServiceImpl extends BaseServiceImpl implements AdminService {
    private static final Logger LOGGER = LogManager.getLogger(AdminServiceImpl.class);

    private static final String PRODUCT_UNIT = "PRODUCT_UNIT";
    private static final String CUSTOMER_TYPE = "CUSTOMER_TYPE";
    private static final String BRANCH_TYPE = "BRANCH_TYPE";

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
                                 String email, Long customerTypeId, boolean enabled) throws Exception{
        Customer customer;
        Type customerType;
        if (null!=customerTypeId) {
            customerType = typesRepository.findByIdAndOrganizationAndTypeAndEnabledIsTrue(customerTypeId, user.getOrganization(), CUSTOMER_TYPE);
            if (null==customerType) {
                throw new Exception("INVALID_CUSTOMER_TYPE");
            }
        } else {
            throw new Exception("CUSTOMER_TYPE_NULL");
        }
        if (null!=customerId) {
            customer = customersRepository.findByIdAndOrganization(customerId,user.getOrganization());
            if (null==customer) {
                throw new Exception("INVALID_CUSTOMER");
            }
        } else {
            customer = new Customer();
            customer.setOrganization(user.getOrganization());
            customer.setStartDate(DateUtils.getCurrentDate());
        }
        customer.setName(name);
        customer.setAddress(address);
        customer.setNeighborhood(neighborhood);
        customer.setCity(city);
        customer.setPhone(phone);
        customer.setEmail(email);
        customer.setType(customerType);
        customer.setEnabled(enabled);

        return customersRepository.save(customer);
    }

    public void removeCustomer(Long customerId) throws Exception {
        Customer customer = customersRepository.findByIdAndOrganization(customerId, user.getOrganization());
        if (null!=customer) {
            customersRepository.delete(customer);
        } else {
            throw new Exception("INVALID_CUSTOMER");
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
        throw new Exception("INVALID_CUSTOMER");
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
                             Long customerId, Long branchTypeId, boolean enabled) throws Exception {
        Customer customer;
        if (null!=customerId) {
            customer = customersRepository.findByIdAndOrganization(customerId, user.getOrganization());
            if (null==customer) {
                throw new Exception("INVALID_CUSTOMER");
            }
        } else {
            throw new Exception("CUSTOMER_ID_NULL");
        }
        Type branchType;
        if (null!=branchTypeId) {
            branchType = typesRepository.findByIdAndOrganizationAndTypeAndEnabledIsTrue(branchTypeId, user.getOrganization(), BRANCH_TYPE);
            if (null==branchType) {
                throw new Exception("INVALID_BRANCH_TYPE");
            }
        } else {
            throw new Exception("BRANCH_TYPE_ID_NULL");
        }

        Branch branch;
        if (null!=branchId) {
            branch = branchesRepository.findByIdAndOrganization(branchId, user.getOrganization());
            if (null==branch) {
                throw new Exception("INVALID_BRANCH");
            }
        } else {
            branch = new Branch();
            branch.setStartDate(DateUtils.getCurrentDate());
            branch.setOrganization(user.getOrganization());
        }
        branch.setName(name);
        branch.setAddress(address);
        branch.setNeighborhood(neighborhood);
        branch.setCity(city);
        branch.setPhone(phone);
        branch.setCustomer(customer);
        branch.setType(branchType);
        branch.setEnabled(enabled);

        return branchesRepository.save(branch);
    };

    public void removeBranch(Long branchId) throws Exception {
        if (null==branchId) {
            throw new Exception("BRANCH_ID_NULL");
        }
        Branch branch = branchesRepository.findByIdAndOrganization(branchId,user.getOrganization());
        if (null==branch) {
            throw new Exception("INVALID_BRANCH");
        }
        branchesRepository.delete(branch);
    }

    public Iterable<Contact> getAllContactsByCustomer(Long customerId, boolean onlyEnabled) throws Exception {
        Iterable<Contact> result;
        Customer customer = customersRepository.findByIdAndOrganization(customerId,user.getOrganization());
        if (null!=customer) {
            if (onlyEnabled) {
                result = contactsRepository.findByCustomerAndEnabledIsTrueAndOrganization(customer, user.getOrganization());
            } else {
                result = contactsRepository.findByCustomerAndOrganization(customer, user.getOrganization());
            }
            return result;
        }
        throw new Exception("INVALID_CUSTOMER");
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
                throw new Exception("INVALID_CUSTOMER");
            }
        } else {
            throw new Exception("CUSTOMER_ID_NULL");
        }

        Contact contact;
        if (null!=contactId) {
            contact = contactsRepository.findByIdAndOrganization(contactId, user.getOrganization());
            if (null==contact) {
                throw new Exception("INVALID_CONTACT");
            }
        } else {
            contact = new Contact();
        }
        contact.setFirstName(firstName);
        contact.setMiddleName(middleName);
        contact.setLastName(lastName);
        contact.setPhone(phone);
        contact.setEmail(email);
        contact.setEnabled(enabled);
        contact.setOrganization(user.getOrganization());
        contact.setCustomer(customer);

        return contactsRepository.save(contact);
    }

    public void removeContact(Long contactId) throws Exception {
        if (null==contactId) {
            throw new Exception("CONTACT_ID_NULL");
        }
        Contact contact = contactsRepository.findByIdAndOrganization(contactId,user.getOrganization());
        if (null==contact) {
            throw new Exception("INVALID_CONTACT");
        }
        contactsRepository.delete(contact);
    }

    public List<Contact> getContactsByBranch(Long branchId, boolean onlyEnabled) throws Exception {
        List<Contact> contacts = new ArrayList<Contact>();
        if (null==branchId) {
            throw new Exception("BRANCH_ID_NULL");
        }
        Branch branch = branchesRepository.findByIdAndOrganization(branchId,user.getOrganization());
        if (null==branch) {
            throw new Exception("INVALID_BRANCH");
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

    public Iterable<Product> getAllProducts() throws Exception {
        return productsRepository.findByOrganization(user.getOrganization());
    }

    public Product getOneProduct(Long productId) throws Exception {
        Product product = productsRepository.findByIdAndOrganization(productId, user.getOrganization());
        return product;
    }

    public Product saveProduct(Long productId, String productName, String productDescription, Double qty, Long unitTypeId) throws Exception {
        if (null == unitTypeId) {
            throw new Exception("UNIT_PRODUCT_ID_NULL");
        }
        Type productUnit = typesRepository.findByIdAndOrganizationAndTypeAndEnabledIsTrue(unitTypeId, user.getOrganization(), PRODUCT_UNIT);
        if (null == productUnit) {
            throw new Exception("INVALID_PRODUCT_UNIT");
        }

        Product product;
        if (null == productId) {
            product = new Product();
            product.setOrganization(user.getOrganization());
        } else {
            product = productsRepository.findByIdAndOrganization(productId, user.getOrganization());
            if (null == product) {
                throw new Exception("INVALID PRODUCT");
            }
        }
        product.setName(productName);
        product.setDescription(productDescription);
        product.setQuantity(qty);
        product.setUnit(productUnit);

        return productsRepository.save(product);
    }

    public void removeProduct(Long productId) throws Exception, DataIntegrityViolationException {
        Product product = productsRepository.findByIdAndOrganization(productId, user.getOrganization());
        if (null == product) {
            throw new Exception("INVALID PRODUCT");
        }
        productsRepository.delete(product);
    }
}
