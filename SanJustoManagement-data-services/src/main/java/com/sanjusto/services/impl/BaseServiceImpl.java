package com.sanjusto.services.impl;

import com.sanjusto.data.model.User;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class BaseServiceImpl {
    @Autowired
    protected ServiceFactory serviceFactory;

    protected User user;

    public void setUser(User user) {
        if (this.user != null)
            throw new IllegalStateException("Cannot change user");
        this.user = user;
    }

    public User getUser() {
        return this.user;
    }
}
