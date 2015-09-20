package com.crm.data.repositories;

import com.crm.data.model.Organization;
import com.crm.data.model.Type;
import org.springframework.data.repository.CrudRepository;

public interface TypesRepository extends CrudRepository<Type, Long>{

    public Type findByIdAndOrganizationAndEnabledIsTrue(Long id,Organization organization);

    public Type findByIdAndOrganizationAndTypeAndEnabledIsTrue(Long id,Organization organization, String type);

    public Type findByIdAndOrganizationAndTypeAndEnabledIsTrueAndParentIdIsNull(Long id,Organization organization, String type);

    public Type findByIdAndOrganizationAndTypeAndEnabledIsTrueAndParentId(Long id,Organization organization, String type, Long parentId);
}
