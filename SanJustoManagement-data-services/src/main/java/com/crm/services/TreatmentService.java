package com.crm.services;

import com.crm.data.model.*;
import com.crm.services.dto.BranchDTO;
import org.json.JSONObject;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Date;
import java.util.List;

public interface TreatmentService {

    void setUser(User user);

    User getUser();

    List<Customer> locateCustomers(String searchString) throws Exception;

    List<Branch> locateBranches(String searchString) throws Exception;

    Iterable<Treatment> getAllTreatments(int page, int size) throws Exception;

    Treatment getOneTreatment(Long treatmentId) throws  Exception;

    Treatment saveTreatment(String treatment) throws Exception, DataIntegrityViolationException;

    void removeTreatment(Long treatmentId) throws Exception, DataIntegrityViolationException;

    Iterable<TreatmentWork> getAllWorksByTreatment(Long treatmentId) throws Exception;

    TreatmentWork getOneWork(Long treatmentWorkId) throws Exception;

    TreatmentWork saveTreatmentWork(Long treatmentId, Long typeId) throws Exception, DataIntegrityViolationException;

    void removeTreatmentWork(Long treatmentWorkId) throws Exception, DataIntegrityViolationException;

    Iterable<TreatmentWorkDetail> getAllDetailsByWork(Long workId) throws Exception;

    TreatmentWorkDetail getOneWorkDetail(Long workDetailId) throws Exception;

    TreatmentWorkDetail saveWorkDetail(Long workId, Long typeId) throws Exception, DataIntegrityViolationException;

    void removeWorkDetail(Long workDetailId) throws Exception, DataIntegrityViolationException;

    Iterable<TreatmentProduct> getAllProductsByTreatment(Long treatmentId) throws Exception;

    TreatmentProduct getOneTreatmentProduct(Long treatmentProductId) throws Exception;

    //TreatmentProduct saveTreatmentProduct(Long treatmentId, Long productId, Double qty) throws Exception, DataIntegrityViolationException;

    //void removeTreatmentProduct(Long treatmentProductId) throws Exception, DataIntegrityViolationException;

    Iterable<TreatmentPlague> getAllPlaguesByTreatment(Long treatmentId) throws Exception;

    TreatmentPlague getOneTreatmentPlague(Long treatmentPlagueId) throws Exception;

    TreatmentPlague saveTreatmentPlague(Long treatmentId, Long plagueId, Long controlled) throws Exception, DataIntegrityViolationException;

    void removeTreatmentPlague(Long treatmentPlagueId) throws Exception, DataIntegrityViolationException;

    Iterable<TreatmentSurvey> getAllSurveyByTreatment(Long treatmentId) throws Exception;

    TreatmentSurvey getOneTreatmentSurvey(Long treatmentSurveyId) throws Exception;

    TreatmentSurvey saveTreatmentSurvey(Long treatmentId, Long surveyTypeId, Long surveySubtypeId, boolean checked) throws Exception, DataIntegrityViolationException;

    void removeTreatmentSurvey(Long treatmentSurveyId) throws Exception, DataIntegrityViolationException;

    List<User> getAllUsers() throws Exception;

    List<Type> getTypes(String keyType) throws Exception;

    List<BranchDTO> getAllBranchesByCustomer(Long customerId) throws Exception;

    Iterable<Product> getAllProducts() throws Exception;
}
