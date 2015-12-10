package com.crm.services.impl;

import com.crm.data.model.*;
import com.crm.services.TreatmentService;
import com.crm.services.dto.BranchDTO;
import org.apache.commons.lang.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.JSONObject;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

public class TreatmentServiceImpl extends BaseServiceImpl implements TreatmentService {
    private static final Logger LOGGER = LogManager.getLogger(TreatmentServiceImpl.class);

    private static final String SURVEY_TYPE = "SURVEY";
    private static final String PLAGUE_TYPE = "PLAGUES";
    private static final String PLAGUE_CONTROLLED_TYPE = "PLAGUES_CONTROLLED";
    private static final String WORK_DETAIL_TYPE = "JOB_DETAIL_TYPE";
    private static final String WORK_TYPE = "JOB_TYPE";
    private static final String TREATMENT_MOTIVES = "MOTIVES";

    public List<Customer> locateCustomers(String searchString) throws Exception {
        if (StringUtils.isBlank(searchString))
            return new ArrayList<Customer>();

        String localSearchString = searchString.replace(" ", "%");

        if (!localSearchString.startsWith("%")) {
            localSearchString = "%" + localSearchString;
        }

        if (!localSearchString.endsWith("%")) {
            localSearchString = localSearchString + "%";
        }

        PageRequest pageRequest = new PageRequest(0, 100, new Sort(Sort.Direction.ASC, "name"));

        return customersRepository.locateCustomers(user.getOrganization().getId(), localSearchString, pageRequest);
    }

    public List<Branch> locateBranches(String searchString) throws Exception {
        if (StringUtils.isBlank(searchString))
            return new ArrayList<Branch>();

        String localSearchString = searchString.replace(" ", "%");

        if (!localSearchString.startsWith("%")) {
            localSearchString = "%" + localSearchString;
        }

        if (!localSearchString.endsWith("%")) {
            localSearchString = localSearchString + "%";
        }

        PageRequest pageRequest = new PageRequest(0, 100, new Sort(Sort.Direction.ASC, "name"));

        return branchesRepository.locateBranches(user.getOrganization().getId(), localSearchString, pageRequest);
    }

    public Iterable<Treatment> getAllTreatments(int page, int size) throws Exception {
        PageRequest pageRequest = new PageRequest(page, size, new Sort(Sort.Direction.DESC, "treatmentDate"));
        Iterable<Treatment> result = treatmentsRepository.findByOrganization(user.getOrganization(), pageRequest);
        return result;
    }

    public Treatment getOneTreatment(Long treatmentId) throws  Exception {
        return treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
    }

    public Treatment saveTreatment(String treatment) throws Exception, DataIntegrityViolationException {
        JSONObject treatmentJSON = new JSONObject(treatment);
        Long treatmentId = treatmentJSON.getLong("treatmentId");
        Long branchId = treatmentJSON.getLong("branchId");
        boolean coordinated = treatmentJSON.getBoolean("treatmentCoordinated");
        boolean finished = treatmentJSON.getBoolean("treatmentFinished");
        Long motiveId = treatmentJSON.getLong("treatmentMotives");
        boolean certificate = treatmentJSON.getBoolean("treatmentCertified");
        String comments = treatmentJSON.getString("treatmentComments");
        Long userTreatmentId = treatmentJSON.getLong("employeeId");
        Date treatmentDate = new Date(treatmentJSON.getLong("treatmentDate"));

        return this.saveTreatment(treatmentId, branchId, coordinated, finished, motiveId, certificate,comments,userTreatmentId, treatmentDate);
    }

    private Treatment saveTreatment(Long treatmentId, Long branchId,boolean coordinated, boolean finished, Long motiveId,
                                   boolean certificate, String comments, Long userTreatmentId, Date treatmentDate) throws  Exception, DataIntegrityViolationException{
        Treatment treatment = new Treatment();
        if (treatmentId!=null && treatmentId > 0) {
            treatment = treatmentsRepository.findOne(treatmentId);
        }

        Branch branch = branchesRepository.findOne(branchId);
        User userTreatment = usersRepository.findOne(userTreatmentId);
        Type motive = null;
        if (motiveId != null) {
            motive = typesRepository.findByIdAndOrganizationAndTypeAndEnabledIsTrue(motiveId, user.getOrganization(), TREATMENT_MOTIVES);
            if (null==motive) {
                throw new Exception("INVALID_TREATMENT_MOTIVE");
            }
        }
        treatment.setBranch(branch);
        treatment.setCertificate(certificate);
        treatment.setCoordinated(coordinated);
        treatment.setFinished(finished);
        treatment.setComments(comments);
        treatment.setMotive(motive);
        treatment.setUser(userTreatment);
        treatment.setOrganization(user.getOrganization());
        if (treatmentDate!=null) {
            treatment.setTreatmentDate(treatmentDate);
        }
        treatmentsRepository.save(treatment);
        return treatment;
    }

    public void removeTreatment(Long treatmentId) throws Exception, DataIntegrityViolationException {
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("INVALID_TREATMENT");
        }
        treatmentsRepository.delete(treatment);
    }

    public Iterable<TreatmentWork> getAllWorksByTreatment(Long treatmentId) throws Exception {
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("INVALID_TREATMENT");
        }
        return treatmentsWorksRepository.findByTreatment(treatment);
    }

    public TreatmentWork getOneWork(Long treatmentWorkId) throws Exception {
        TreatmentWork tw = treatmentsWorksRepository.findById(treatmentWorkId);
        if (null!=tw && !user.getOrganization().equals(tw.getTreatment().getOrganization())) {
            return null;
        }
        return tw;
    }

    public TreatmentWork saveTreatmentWork(Long treatmentId, Long typeId) throws Exception, DataIntegrityViolationException {
        if (null==treatmentId) {
            throw new Exception("TREATMENT_ID_NULL");
        }
        if (null==typeId) {
            throw new Exception("TYPE_ID_NULL");
        }
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("INVALID_TREATMENT");
        }
        Type type = typesRepository.findByIdAndOrganizationAndTypeAndEnabledIsTrue(typeId, user.getOrganization(), WORK_TYPE);
        if (null==type) {
            throw new Exception("INVALID_WORK_TYPE");
        }
        TreatmentWork tw = new TreatmentWork(treatment,type);
        return treatmentsWorksRepository.save(tw);
    }

    public void removeTreatmentWork(Long treatmentWorkId) throws Exception, DataIntegrityViolationException {
        TreatmentWork tw = treatmentsWorksRepository.findById(treatmentWorkId);
        if (null==tw) {
            throw new Exception("INVALID_WORK");
        }
        treatmentsWorksRepository.delete(tw);
    }

    public Iterable<TreatmentWorkDetail> getAllDetailsByWork(Long workId) throws Exception {
        TreatmentWork tw = treatmentsWorksRepository.findById(workId);
        if (null==tw) {
            throw new Exception("INVALID_WORK_ID");
        }
        return treatmentsWorksDetailsRepository.findByTreatmentWork(tw);
    }

    public TreatmentWorkDetail getOneWorkDetail(Long workDetailId) throws Exception {
        TreatmentWorkDetail twd = treatmentsWorksDetailsRepository.findById(workDetailId);
        if (null!=twd && !user.getOrganization().equals(twd.getTreatmentWork().getTreatment().getOrganization())) {
            return null;
        }
        return twd;
    }

    public TreatmentWorkDetail saveWorkDetail(Long workId, Long typeId) throws Exception, DataIntegrityViolationException {
        if (null==workId) {
            throw new Exception("WORK_ID_NULL");
        }
        if (null==typeId) {
            throw new Exception("TYPE_ID_NULL");
        }
        TreatmentWork tw = treatmentsWorksRepository.findById(workId);
        if (null==tw) {
            throw new Exception("INVALID_WORK_ID");
        }
        Type type = typesRepository.findByIdAndOrganizationAndTypeAndEnabledIsTrue(typeId, user.getOrganization(), WORK_DETAIL_TYPE);
        if (null==type) {
            throw new Exception("INVALID_WORK_DETAIL_TYPE");
        }
        TreatmentWorkDetail twd = new TreatmentWorkDetail(tw,type);
        return treatmentsWorksDetailsRepository.save(twd);
    }

    public void removeWorkDetail(Long workDetailId) throws Exception, DataIntegrityViolationException {
        TreatmentWorkDetail twd = treatmentsWorksDetailsRepository.findById(workDetailId);
        if (null==twd) {
            throw new Exception("INVALID_WORK_DETAIL_ID");
        }
        treatmentsWorksDetailsRepository.delete(twd);
    }

    public Iterable<TreatmentProduct> getAllProductsByTreatment(Long treatmentId) throws Exception {
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("INVALID_TREATMENT");
        }
        return treatmentsProductsRepository.findByTreatment(treatment);
    }

    public TreatmentProduct getOneTreatmentProduct(Long treatmentProductId) throws Exception {
        TreatmentProduct tp = treatmentsProductsRepository.findById(treatmentProductId);
        if (null!=tp && !user.getOrganization().equals(tp.getTreatment().getOrganization())) {
            return null;
        }
        return tp;
    }

    public TreatmentProduct saveTreatmentProduct(Long treatmentId, Long productId, Double qty) throws Exception, DataIntegrityViolationException {
        if (null==treatmentId) {
            throw new Exception("TREATMENT_ID_NULL");
        }
        if (null==productId) {
            throw new Exception("PRODUCT_ID_NULL");
        }
        if (null==qty || qty<0) {
            qty=0D;
        }
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("INVALID_TREATMENT");
        }
        Product product = productsRepository.findByIdAndOrganization(productId, user.getOrganization());
        if (null==product) {
            throw new Exception("INVALID_PRODUCT");
        }
        TreatmentProduct tp = new TreatmentProduct(treatment,product, qty);
        return treatmentsProductsRepository.save(tp);
    }

    public void removeTreatmentProduct(Long treatmentProductId) throws Exception, DataIntegrityViolationException {
        TreatmentProduct tp = treatmentsProductsRepository.findById(treatmentProductId);
        if (null==tp) {
            throw new Exception("INVALID_PRODUCT");
        }
        treatmentsProductsRepository.delete(tp);
    }

    public Iterable<TreatmentPlague> getAllPlaguesByTreatment(Long treatmentId) throws Exception {
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("INVALID_TREATMENT");
        }
        return treatmentsPlaguesRepository.findByTreatment(treatment);
    }

    public TreatmentPlague getOneTreatmentPlague(Long treatmentPlagueId) throws Exception {
        TreatmentPlague tp = treatmentsPlaguesRepository.findById(treatmentPlagueId);
        if (null!=tp && !user.getOrganization().equals(tp.getTreatment().getOrganization())) {
            return null;
        }
        return tp;
    }

    public TreatmentPlague saveTreatmentPlague(Long treatmentId, Long plagueId, Long controlled) throws Exception, DataIntegrityViolationException {
        if (null==treatmentId) {
            throw new Exception("TREATMENT_ID_NULL");
        }
        if (null==plagueId) {
            throw new Exception("PLAGUE_ID_NULL");
        }
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("INVALID_TREATMENT");
        }
        Type plague = typesRepository.findByIdAndOrganizationAndTypeAndEnabledIsTrue(plagueId, user.getOrganization(), PLAGUE_TYPE);
        if (null==plague) {
            throw new Exception("INVALID_PLAGUE_TYPE");
        }
        Type controlledType = typesRepository.findByIdAndOrganizationAndTypeAndEnabledIsTrue(controlled, user.getOrganization(), PLAGUE_CONTROLLED_TYPE);
        if (null==controlledType) {
            throw new Exception("INVALID_CONTROLLED_TYPE");
        }
        TreatmentPlague tp = new TreatmentPlague(treatment,plague, controlledType);
        return treatmentsPlaguesRepository.save(tp);
    }

    public void removeTreatmentPlague(Long treatmentPlagueId) throws Exception, DataIntegrityViolationException {
        TreatmentPlague tp = treatmentsPlaguesRepository.findById(treatmentPlagueId);
        if (null==tp) {
            throw new Exception("INVALID_PLAGUE");
        }
        treatmentsPlaguesRepository.delete(tp);
    }

    public Iterable<TreatmentSurvey> getAllSurveyByTreatment(Long treatmentId) throws Exception {
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("Invalid Treatment");
        }
        return treatmentsSurveysRepository.findByTreatment(treatment);
    }

    public TreatmentSurvey getOneTreatmentSurvey(Long treatmentSurveyId) throws Exception {
        TreatmentSurvey ts = treatmentsSurveysRepository.findById(treatmentSurveyId);
        if (null!=ts && !user.getOrganization().equals(ts.getTreatment().getOrganization())) {
            return null;
        }
        return ts;
    }

    public TreatmentSurvey saveTreatmentSurvey(Long treatmentId, Long surveyTypeId, Long surveySubtypeId, boolean checked) throws Exception, DataIntegrityViolationException {
        if (null==treatmentId) {
            throw new Exception("TREATMENT_ID_NULL");
        }
        if (null==surveyTypeId) {
            throw new Exception("SURVEY_ID_NULL");
        }
        if (null==surveySubtypeId) {
            throw new Exception("SUB_SURVEY_ID_NULL");
        }
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("INVALID_TREATMENT");
        }
        Type survey = typesRepository.findByIdAndOrganizationAndTypeAndEnabledIsTrueAndParentIdIsNull(surveyTypeId, user.getOrganization(), SURVEY_TYPE);
        if (null==survey) {
            throw new Exception("INVALID_SURVEY_TYPE");
        }
        Type subSurvey = typesRepository.findByIdAndOrganizationAndTypeAndEnabledIsTrueAndParentId(surveySubtypeId, user.getOrganization(), SURVEY_TYPE, surveyTypeId);
        if (null==subSurvey) {
            throw new Exception("INVALID_SURVEY_SUBTYPE");
        }
        TreatmentSurvey ts = new TreatmentSurvey(treatment, survey, subSurvey, checked);
        return treatmentsSurveysRepository.save(ts);
    }

    public void removeTreatmentSurvey(Long treatmentSurveyId) throws Exception, DataIntegrityViolationException {
        TreatmentSurvey ts = treatmentsSurveysRepository.findById(treatmentSurveyId);
        if (null==ts) {
            throw new Exception("INVALID_SURVEY");
        }
        treatmentsSurveysRepository.delete(ts);
    }

    public List<User> getAllUsers() throws Exception {
        return usersRepository.findByOrganizationOrderByLastNameAsc(user.getOrganization());
    }

    public List<Type> getTypes(String keyType) throws Exception {
        return typesRepository.findByOrganizationAndTypeAndEnabledIsTrue(user.getOrganization(), keyType);
    }

    public List<BranchDTO> getAllBranchesByCustomer(Long customerId) throws Exception {
           return branchesRepository.findBranchByCustomerEnabled(user.getOrganization().getId(), customerId);
    };
}