package com.sanjusto.services;

import com.sanjusto.data.model.User;

public interface SecurityService {

    User authenticateUser(String username, String password) throws Exception;
    User setPassword(String username, String password) throws Exception;
    String createTokenForUser(User user);
    User getUserByToken(String encoded);
    void changePassword(String oldPassword, String newPassword, Long userId) throws Exception;

}
