package com.crm.data.repositories;

import com.crm.data.model.Branch;
import com.crm.data.model.Contact;
import com.crm.data.model.Customer;
import com.crm.data.model.Organization;
import org.springframework.data.repository.CrudRepository;

public interface ContactsRepository extends CrudRepository<Contact, Long>{

    Iterable<Contact> findByCustomerAndEnabledIsTrueAndOrganization(Customer customer,Organization organization);

    Iterable<Contact> findByCustomerAndOrganization(Customer customer,Organization organization);

    Contact findByIdAndOrganization(Long contactId, Organization organization);
}
