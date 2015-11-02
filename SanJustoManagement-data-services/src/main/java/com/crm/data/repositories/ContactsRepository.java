package com.crm.data.repositories;

import com.crm.data.model.Branch;
import com.crm.data.model.Contact;
import com.crm.data.model.Customer;
import com.crm.data.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;

public interface ContactsRepository extends CrudRepository<Contact, Long>{

    Page<Contact> findByCustomerAndEnabledIsTrueAndOrganization(Customer customer,Organization organization, Pageable pageable);

    Page<Contact> findByCustomerAndOrganization(Customer customer,Organization organization, Pageable pageable);

    Page<Contact> findByEnabledIsTrueAndOrganization(Organization organization, Pageable pageable);

    Page<Contact> findByOrganization(Organization organization, Pageable pageable);

    Contact findByIdAndOrganization(Long contactId, Organization organization);
}
