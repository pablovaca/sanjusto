package com.crm.data.repositories;

import com.crm.data.model.Contact;
import org.springframework.data.repository.CrudRepository;

public interface ContactsRepository extends CrudRepository<Contact, Long>{

}
