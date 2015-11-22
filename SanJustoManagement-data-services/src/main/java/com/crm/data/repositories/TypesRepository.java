package com.crm.data.repositories;

import com.crm.data.model.Organization;
import com.crm.data.model.Type;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TypesRepository extends CrudRepository<Type, Long>{

    Type findByIdAndOrganizationAndEnabledIsTrue(Long id,Organization organization);

    Type findByIdAndOrganizationAndTypeAndEnabledIsTrue(Long id,Organization organization, String type);

    Type findByIdAndOrganizationAndTypeAndEnabledIsTrueAndParentIdIsNull(Long id,Organization organization, String type);

    Type findByIdAndOrganizationAndTypeAndEnabledIsTrueAndParentId(Long id,Organization organization, String type, Long parentId);

    List<Type> findByOrganizationAndTypeAndEnabledIsTrue(Organization organization, String type);
}
