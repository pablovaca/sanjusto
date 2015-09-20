package com.crm.services;

import com.crm.data.model.*;
import com.crm.services.impl.ServiceFactory;
import com.crm.utils.DateUtils;
import com.crm.utils.TransactionalSupportTest;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.annotation.Rollback;

import static org.junit.Assert.*;

/**
 * Created by pvaca on 8/17/15.
 */
public class TreatmentServiceTest extends TransactionalSupportTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(TreatmentServiceTest.class);

    @Test
    public void testGetAllTreatments() throws Exception {
        LOGGER.info("testGetAllTreatments");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);
        Iterable<Treatment> result = treatmentService.getAllTreatments();
        assertNotNull("Result should not be null",result);
        int counter = 0;
        for (Treatment treatment:result) {
            assertNotNull("Customer should not be null",treatment);
            LOGGER.info(treatment.getId() + "-" + treatment.getBranch().getName() + "-" + treatment.getBranch().getCustomer().getName());
            counter++;
        }
        LOGGER.info("counter " + counter);
        assertEquals("Should be equals to 1",1,counter);
        LOGGER.info("testGetAllTreatments");
    }

    @Test
    public void testGetOneTreatment() throws Exception {
        LOGGER.info("testGetOneTreatment");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);
        Treatment treatment = treatmentService.getOneTreatment(1L);
        assertNotNull("Treatment should not be null", treatment);
        assertEquals("Branch Name should be Branch 1","Branch 1",treatment.getBranch().getName());
        LOGGER.info("testGetOneTreatment");
    }

    @Test
    public void testSaveTreatment() throws Exception {
        LOGGER.info("testInsertTreatment");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long branchId = 2L;
        boolean coordinated = true;
        boolean finished = false;
        boolean certificate = true;
        String comments = "Treatment comments";
        Treatment treatment = treatmentService.saveTreatment(null,branchId, coordinated, finished, null, certificate, comments, 1L, DateUtils.getCurrentDate());
        assertNotNull("Treatment id should not be null", treatment.getId());
        assertFalse("Finished should be false", treatment.getFinished());
        LOGGER.info("Treatment id " + treatment.getId());
        assertEquals("Treatment id should be 2", 2L, treatment.getId().longValue());
        finished = true;
        treatment = treatmentService.saveTreatment(treatment.getId(),branchId, coordinated, finished, null, certificate, comments, 1L, null);
        assertNotNull("Treatment should not be null", treatment);
        assertEquals("Treatment id should be 2", 2L, treatment.getId().longValue());
        assertTrue("Finished should be true", treatment.getFinished());
        LOGGER.info("testInsertTreatment");
        try {
            treatment = treatmentService.saveTreatment(null, branchId, coordinated, finished, null, certificate, comments, 1L, null);
        } catch (DataIntegrityViolationException die) {
            LOGGER.info(die.getMessage());
            assertTrue("Should be true", die.getMessage().contains("not-null property references a null"));
            LOGGER.info(die.getClass().getName());
            assertEquals("Should be equals","org.springframework.dao.DataIntegrityViolationException",die.getClass().getName());
        }

    }

    @Test
    public void testRemoveTreatment() throws Exception {
        LOGGER.info("testRemoveTreatment");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long branchId = 2L;
        boolean coordinated = true;
        boolean finished = false;
        boolean certificate = true;
        String comments = "Treatment comments";
        Treatment treatment = treatmentService.saveTreatment(null, branchId, coordinated, finished, null, certificate, comments, 1L, DateUtils.getCurrentDate());
        assertNotNull("Treatment id should not be null", treatment.getId());
        assertFalse("Finished should be false", treatment.getFinished());
        LOGGER.info("Treatment id " + treatment.getId());

        treatmentService.removeTreatment(treatment.getId());
        Treatment treatmentRemoved = treatmentService.getOneTreatment(treatment.getId());
        assertNull("Treatment Removed should be null", treatmentRemoved);
    }

    @Test
    public void testRemoveTreatmentWithWorks() throws Exception {
        LOGGER.info("testRemoveTreatmentWithWorks");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        try {
            treatmentService.removeTreatment(1L);
            Treatment treatment = treatmentService.getOneTreatment(1L);
            fail();
        } catch (DataIntegrityViolationException die) {
            LOGGER.info("Integrity error", die);
        }
    }

    @Test
    public void testGetAllWorks() throws Exception {
        LOGGER.info("testGetAllWorks");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);
        Iterable<TreatmentWork> result = treatmentService.getAllWorksByTreatment(1L);
        assertNotNull("Treatment work list should not be null", result);
        int counter=0;
        for (TreatmentWork tw:result) {
            counter++;
            LOGGER.info("TW: " + tw.getId() + " - " + tw.getTreatment().getBranch().getCustomer().getName() + " - " + tw.getTypeWork().getShortName());
        }
        assertEquals("Size of Treatment list should be equals to 2", 2, counter);
    }

    @Test
    public void testGetOneWorks() throws Exception {
        LOGGER.info("testGetOneWorks");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        TreatmentWork tw = treatmentService.getOneWork(1L);
        assertEquals("Treatment id related should be equals to 1", 1, tw.getTreatment().getId().longValue());
        assertEquals("Type id related should be equals to 4", 4, tw.getTypeWork().getId().longValue());
    }

    @Test
    public void testSaveNewWork() throws Exception {
        LOGGER.info("testSaveNewWork");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long treatmentId=1L;
        Long jobType=12L;
        TreatmentWork tw = treatmentService.saveTreatmentWork(treatmentId, jobType);
        assertNotNull("Should not be null", tw);
        treatmentService.removeTreatmentWork(tw.getId());
        TreatmentWork newTw = treatmentService.getOneWork(tw.getId());
        assertNull("Should be null", newTw);
    }

    @Test
    public void testRemoveWorkWithDetail() throws Exception {
        LOGGER.info("testRemoveTreatmentWithWorks");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        try {
            treatmentService.removeTreatmentWork(1L);
            TreatmentWork newTw = treatmentService.getOneWork(1L);
            assertNull(newTw);
        } catch (DataIntegrityViolationException die) {
            LOGGER.info("Integrity error", die);
        }
    }

    @Test
    public void testSaveNewWorkDuplicated() throws Exception {
        LOGGER.info("testSaveNewWorkDuplicated");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long treatmentId=1L;
        Long jobType=4L;
        try {
            TreatmentWork tw = treatmentService.saveTreatmentWork(treatmentId, jobType);
            fail();
        } catch (DataIntegrityViolationException die) {
            LOGGER.info("Mensaje: " + die.getMessage());
            assertEquals("Should be equals", "org.springframework.dao.DataIntegrityViolationException", die.getClass().getName());
        }
    }

    @Test
    public void testGetAllWorksDetails() throws Exception {
        LOGGER.info("testGetAllWorksDetails");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);
        Iterable<TreatmentWorkDetail> result = treatmentService.getAllDetailsByWork(1L);
        assertNotNull("Treatment work detail list should not be null", result);
        int counter=0;
        for (TreatmentWorkDetail twd:result) {
            counter++;
            LOGGER.info("TW: " + twd.getId() + " - " + twd.getTreatmentWork().getId());
            assertEquals("Work Id should be 1", 1, twd.getTreatmentWork().getId().longValue());
        }
        assertEquals("Size of Treatment detail list should be equals to 2", 2, counter);
    }

    @Test
    public void testGetOneWorkDetail() throws Exception {
        LOGGER.info("testGetOneWorkDetail");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        TreatmentWorkDetail twd = treatmentService.getOneWorkDetail(1L);
        assertEquals("Work id related should be equals to 1", 1, twd.getTreatmentWork().getId().longValue());
        assertEquals("Type id related should be equals to 4", 5, twd.getTypeWorkDetail().getId().longValue());
    }

    @Test
    public void testSaveNewWorkDetail() throws Exception {
        LOGGER.info("testSaveNewWorkDetail");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long workId=1L;
        Long jobDetailType=9L;
        TreatmentWorkDetail twd = treatmentService.saveWorkDetail(workId, jobDetailType);
        assertNotNull("Should not be null", twd);
        treatmentService.removeWorkDetail(twd.getId());
        TreatmentWorkDetail newTwd = treatmentService.getOneWorkDetail(twd.getId());
        assertNull("Should be null", newTwd);
    }

    @Test
    public void testSaveNewWorkDetailDuplicated() throws Exception {
        LOGGER.info("testSaveNewWorkDetailDuplicated");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long workId=1L;
        Long jobDetailType=5L;
        try {
            TreatmentWorkDetail twd = treatmentService.saveWorkDetail(workId, jobDetailType);
            fail();
        } catch (DataIntegrityViolationException die) {
            LOGGER.info("Mensaje: " + die.getMessage());
            assertEquals("Should be equals", "org.springframework.dao.DataIntegrityViolationException", die.getClass().getName());
        }
    }

    @Test
    public void testGetAllTreatmentProducts() throws Exception {
        LOGGER.info("testGetAllTreatmentProducts");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);
        Iterable<TreatmentProduct> result = treatmentService.getAllProductsByTreatment(1L);
        assertNotNull("Treatment work list should not be null", result);
        int counter=0;
        for (TreatmentProduct tp:result) {
            counter++;
            LOGGER.info("TW: " + tp.getId() + " - " + tp.getTreatment().getBranch().getCustomer().getName());
        }
        assertEquals("Size of Treatment list should be equals to 2", 2, counter);
    }

    @Test
    public void testGetOneTreatmentProduct() throws Exception {
        LOGGER.info("testGetOneTreatmentProduct");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        TreatmentProduct tp = treatmentService.getOneTreatmentProduct(1L);
        assertEquals("Treatment id related should be equals to 1", 1, tp.getTreatment().getId().longValue());
        assertEquals("Product id related should be equals to 1", 1, tp.getProduct().getId().longValue());
    }

    @Test
    public void testSaveNewTreatmentProduct() throws Exception {
        LOGGER.info("testSaveNewTreatmentProduct");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long treatmentId=1L;
        Long productId=3L;
        Double qty = 3.5D;
        TreatmentProduct tp = treatmentService.saveTreatmentProduct(treatmentId, productId, qty);
        assertNotNull("Should not be null", tp);
        treatmentService.removeTreatmentProduct(tp.getId());
        TreatmentProduct newTp = treatmentService.getOneTreatmentProduct(tp.getId());
        assertNull("Should be null", newTp);
    }

    @Test
    public void testSaveNewTreatmentProductDuplicated() throws Exception {
        LOGGER.info("testSaveNewTreatmentProductDuplicated");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long treatmentId=1L;
        Long productId=2L;
        Double qty = 3.5D;
        try {
            TreatmentProduct tp = treatmentService.saveTreatmentProduct(treatmentId, productId, qty);
            fail();
        } catch (DataIntegrityViolationException die) {
            LOGGER.info("Mensaje: " + die.getMessage());
            assertEquals("Should be equals", "org.springframework.dao.DataIntegrityViolationException", die.getClass().getName());
        }
    }

    @Test
    public void testGetAllTreatmentPlague() throws Exception {
        LOGGER.info("testGetAllTreatmentPlague");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);
        Iterable<TreatmentPlague> result = treatmentService.getAllPlaguesByTreatment(1L);
        assertNotNull("Treatment work list should not be null", result);
        int counter=0;
        for (TreatmentPlague tp:result) {
            counter++;
            LOGGER.info("TW: " + tp.getId() + " - " + tp.getTreatment().getBranch().getCustomer().getName());
        }
        assertEquals("Size of Treatment list should be equals to 1", 1, counter);
    }

    @Test
    public void testGetOneTreatmentPlague() throws Exception {
        LOGGER.info("testGetOneTreatmentPlague");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        TreatmentPlague tp = treatmentService.getOneTreatmentPlague(1L);
        assertEquals("Treatment id related should be equals to 1", 1, tp.getTreatment().getId().longValue());
        assertEquals("Plague id related should be equals to 19", 19, tp.getTypePlague().getId().longValue());
    }

    @Test
    public void testSaveNewTreatmentPlague() throws Exception {
        LOGGER.info("testSaveNewTreatmentPlague");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long treatmentId = 1L;
        Long plagueId = 20L;
        Long controlled = 16L;
        TreatmentPlague tp = treatmentService.saveTreatmentPlague(treatmentId, plagueId, controlled);
        assertNotNull("Should not be null", tp);
        treatmentService.removeTreatmentPlague(tp.getId());
        TreatmentPlague newTp = treatmentService.getOneTreatmentPlague(tp.getId());
        assertNull("Should be null", newTp);
    }

    @Test
    public void testSaveNewTreatmentPlagueDuplicated() throws Exception {
        LOGGER.info("testSaveNewTreatmentPlagueDuplicated");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long treatmentId = 1L;
        Long plagueId = 19L;
        Long controlled = 16L;
        try {
            TreatmentPlague tp = treatmentService.saveTreatmentPlague(treatmentId, plagueId, controlled);
            fail();
        } catch (DataIntegrityViolationException die) {
            LOGGER.info("Mensaje: " + die.getMessage());
            assertEquals("Should be equals", "org.springframework.dao.DataIntegrityViolationException", die.getClass().getName());
        }
    }

    @Test
    public void testGetAllTreatmentSurvey() throws Exception {
        LOGGER.info("testGetAllTreatmentSurvey");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);
        Iterable<TreatmentSurvey> result = treatmentService.getAllSurveyByTreatment(1L);
        assertNotNull("Treatment work list should not be null", result);
        int counter=0;
        for (TreatmentSurvey ts:result) {
            counter++;
            LOGGER.info("TW: " + ts.getId() + " - " + ts.getTreatment().getBranch().getCustomer().getName());
        }
        assertEquals("Size of Treatment list should be equals to 1", 1, counter);
    }

    @Test
    public void testGetOneTreatmentSurvey() throws Exception {
        LOGGER.info("testGetOneTreatmentSurvey");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        TreatmentSurvey ts = treatmentService.getOneTreatmentSurvey(1L);
        assertEquals("Treatment id related should be equals to 1", 1, ts.getTreatment().getId().longValue());
        assertEquals("Survey type id related should be equals to 21", 21, ts.getTypeSurvey().getId().longValue());
        assertEquals("Survey Subtype id related should be equals to 22", 22, ts.getSubTypeSurvey().getId().longValue());
    }

    @Test
    public void testSaveNewTreatmentSurvey() throws Exception {
        LOGGER.info("testSaveNewTreatmentSurvey");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long treatmentId = 1L;
        Long surveyTypeId = 21L;
        Long surveySubType = 23L;
        boolean checked = true;
        TreatmentSurvey ts = treatmentService.saveTreatmentSurvey(treatmentId, surveyTypeId, surveySubType, checked);
        assertNotNull("Should not be null", ts);
        treatmentService.removeTreatmentSurvey(ts.getId());
        TreatmentSurvey newTs = treatmentService.getOneTreatmentSurvey(ts.getId());
        assertNull("Should be null", newTs);
    }

    @Test
    public void testSaveNewTreatmentSurveyDuplicated() throws Exception {
        LOGGER.info("testSaveNewTreatmentSurveyDuplicated");
        User user = getTestUser();
        ServiceFactory serviceFactory = getServiceFactory();
        TreatmentService treatmentService = serviceFactory.getTreatmentService(user);

        Long treatmentId = 1L;
        Long surveyTypeId = 21L;
        Long surveySubType = 22L;
        boolean checked = true;
        try {
            TreatmentSurvey ts = treatmentService.saveTreatmentSurvey(treatmentId, surveyTypeId, surveySubType, checked);
            fail();
        } catch (DataIntegrityViolationException die) {
            LOGGER.info("Mensaje: " + die.getMessage());
            assertEquals("Should be equals", "org.springframework.dao.DataIntegrityViolationException", die.getClass().getName());
        }
    }
}