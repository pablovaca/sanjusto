package com.crm.data.repositories;

import com.crm.data.model.Organization;
import com.crm.data.model.Product;
import org.springframework.data.repository.CrudRepository;

public interface ProductsRepository extends CrudRepository<Product, Long>{

    Product findByIdAndOrganization(Long id, Organization organization);
}
