package com.crm.data.repositories;

import com.crm.data.model.Treatment;
import com.crm.data.model.TreatmentProduct;
import org.springframework.data.repository.CrudRepository;

public interface TreatmentsProductsRepository extends CrudRepository<TreatmentProduct, Long>{

    Iterable<TreatmentProduct> findByTreatment(Treatment treatment);

    TreatmentProduct findById(Long id);
}
