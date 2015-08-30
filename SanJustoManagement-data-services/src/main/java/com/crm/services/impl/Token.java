package com.crm.services.impl;

class Token {
    private long userId;
    private long expireTime;

    Token(long userId, long time) {
        this.userId = userId;
        this.expireTime = time;
    }

    public boolean isExpired() {
        return System.currentTimeMillis() > this.expireTime;
    }

    public long getExpireTime() {
        return this.expireTime;
    }



    public long getUserId() {
        return userId;
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof Token)) {
            return false;
        } else {
            Token t = (Token) obj;
            return userId == t.userId && expireTime == t.expireTime;
        }
    }

    @Override
    public int hashCode() {
        return (userId + "-" + expireTime).hashCode();
    }
}
