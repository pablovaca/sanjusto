package com.crm.services.impl;

import com.crm.data.model.*;
import com.crm.services.TreatmentService;
import com.crm.utils.DateUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.Date;
import java.util.List;

public class TreatmentServiceImpl extends BaseServiceImpl implements TreatmentService {
    private static final Logger LOGGER = LogManager.getLogger(TreatmentServiceImpl.class);

    public Iterable<Treatment> getAllTreatments() throws Exception {
        return treatmentsRepository.findByOrganization(user.getOrganization());
    }

    public Treatment getOneTreatment(Long treatmentId) throws  Exception {
        return treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
    }

    public Treatment saveTreatment(Long treatmentId, Long branchId,boolean coordinated, boolean finished, Long typeId,
                                   boolean certificate, String comments, Long userTreatmentId, Date treatmentDate) throws  Exception, DataIntegrityViolationException{
        Treatment treatment = new Treatment();
        if (treatmentId!=null) {
            treatment = treatmentsRepository.findOne(treatmentId);
        }
        Branch branch = branchesRepository.findOne(branchId);
        User userTreatment = usersRepository.findOne(userTreatmentId);
        Type type = null;
        if (typeId != null) {
            type = typesRepository.findOne(typeId);
        }
        treatment.setBranch(branch);
        treatment.setCertificate(certificate);
        treatment.setCoordinated(coordinated);
        treatment.setFinished(finished);
        treatment.setComments(comments);
        treatment.setMotive(type);
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
            throw new Exception("Invalid Treatment");
        }
        treatmentsRepository.delete(treatment);
    }

    public Iterable<TreatmentWork> getAllWorksByTreatment(Long treatmentId) throws Exception {
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("Invalid Treatment");
        }
        return treatmentsWorksRepository.findByTreatment(treatment);
    }

    public TreatmentWork getOneWork(Long treatmentWorkId) throws Exception {
        TreatmentWork tw = treatmentsWorksRepository.findOne(treatmentWorkId);
        if (null!=tw && !user.getOrganization().equals(tw.getTreatment().getOrganization())) {
            return null;
        }
        return tw;
    }

    public TreatmentWork saveTreatmentWork(Long treatmentId, Long typeId) throws Exception, DataIntegrityViolationException {
        if (null==treatmentId) {
            throw new Exception("Treatment id cannot be null");
        }
        if (null==typeId) {
            throw new Exception("Type id cannot be null");
        }
        Treatment treatment = treatmentsRepository.findByIdAndOrganization(treatmentId, user.getOrganization());
        if (null==treatment) {
            throw new Exception("Invalid Treatment");
        }
        Type type = typesRepository.findByIdAndOrganizationAndEnabledIsTrue(typeId,user.getOrganization());
        if (null==type) {
            throw new Exception("Invalid Type");
        }
        TreatmentWork tw = new TreatmentWork(treatment,type);
        return treatmentsWorksRepository.save(tw);
    }

    public void removeTreatmentWork(Long treatmentWorkId) throws Exception, DataIntegrityViolationException {
        TreatmentWork tw = treatmentsWorksRepository.findOne(treatmentWorkId);
        if (null==tw) {
            throw new Exception("Invalid Treatment Work");
        }
        treatmentsWorksRepository.delete(tw);
    }
}