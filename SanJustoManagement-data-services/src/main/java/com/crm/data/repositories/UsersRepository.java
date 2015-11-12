package com.crm.data.repositories;

import com.crm.data.model.Organization;
import com.crm.data.model.User;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface UsersRepository extends CrudRepository<User, Long>{

    User findByUsername(String username);

    User findByUsernameAndEnabledIsTrue(String username);

    List<User> findByOrganizationOrderByLastNameAsc(Organization organization);
}
