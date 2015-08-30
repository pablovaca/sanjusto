package com.crm.data.repositories;

import com.crm.data.model.User;
import org.springframework.data.repository.CrudRepository;

public interface UsersRepository extends CrudRepository<User, Long>{

    User findByUsername(String username);

    User findByUsernameAndEnabledIsTrue(String username);
}
