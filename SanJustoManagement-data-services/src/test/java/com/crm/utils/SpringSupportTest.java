package com.crm.utils;

import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractJUnit4SpringContextTests;
import org.springframework.test.context.transaction.TransactionConfiguration;


@ContextConfiguration("classpath:applicationContext.xml")
@TransactionConfiguration(defaultRollback = true)
public abstract class SpringSupportTest extends AbstractJUnit4SpringContextTests {

    public static void setupEnvironment() {
        System.setProperty("env", "test");
        System.setProperty("spring.profiles.active", "test");
    }

    static {
        setupEnvironment();
    }

}
