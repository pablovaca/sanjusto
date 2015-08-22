package com.sanjusto.services.impl;

import com.sanjusto.data.model.User;
import com.sanjusto.data.repositories.UsersRepository;
import com.sanjusto.services.*;
import com.sanjusto.utils.DateUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;

public class SecurityServiceImpl implements SecurityService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private TokenEncoder tokenEncoder;

    protected static final Logger LOGGER = LogManager.getLogger(SecurityServiceImpl.class);
    private static long TOKEN_TIME_TO_LIVE = 1000L * 60L * 30L;

    public User authenticateUser(String username, String password) throws Exception {
        LOGGER.debug("authenticateUser ingresando -> " + DateUtils.getCurrentDate() + " " + DateUtils.getCurrentTime());
        if (password == null || password.isEmpty() || username == null || username.isEmpty()) {
            return null;
        }

        User user = getEnabledUser(username);
        if (null == user) {
            return null;
        }

        if (StringUtils.isEmpty(user.getPassword())) {
            return null;
        }

        if (PasswordHash.validatePassword(password, user.getPassword())) {
            return user;
        }

        return null;
    }

    public User setPassword(String username, String password) throws Exception {
        if (username == null || password == null)
            return null;
        LOGGER.debug("username " + username);
        LOGGER.debug("password " + password);
        User user = usersRepository.findByUsername(username);
        if (null == user)
            return null;

        String hash = PasswordHash.createHash(password);
        LOGGER.debug("hash " + hash);
        user.setPassword(hash);
        usersRepository.save(user);

        return user;
    }

    public String createTokenForUser(User user) {
        Token token =new Token(user.getId(), new Date().getTime() + TOKEN_TIME_TO_LIVE);
        return tokenEncoder.encode(token);
    }

    public User getUserByToken(String encoded){
        try {
            Token token = tokenEncoder.decode(encoded);
            if (token.isExpired()) {
                return null;
            } else {
                LOGGER.debug(token.getUserId());
                User user = usersRepository.findOne(token.getUserId());

                if(user == null) {
                    return null;
                }

                if (!user.getEnabled()) {
                    return null;
                }

                return user;
            }
        } catch (InvalidTokenException e) {
            return null;
        }
    }

    public void changePassword(String oldPassword, String newPassword, Long userId) throws Exception {
        User user = usersRepository.findOne(userId);

        if(newPassword == null){
            throw new Exception("La contraseña no puede ser vacía");
        }

        if (PasswordHash.validatePassword(oldPassword, user.getPassword())) {
            String hash = PasswordHash.createHash(newPassword);
            user.setPassword(hash);
            usersRepository.save(user);
        }
    }

    private User getEnabledUser(String username) {
        User user = usersRepository.findByUsernameAndEnabledIsTrue(username);
        if (user==null) {
            return null;
        }
        return user;

    }
}