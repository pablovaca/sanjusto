package com.sanjusto.data.repositories;

import com.sanjusto.data.model.User;
import org.springframework.data.repository.CrudRepository;

public interface UsersRepository extends CrudRepository<User, Long>{

    User findByUsername(String username);

    User findByUsernameAndEnabledIsTrue(String username);
}
