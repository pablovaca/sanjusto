package com.crm.utils;

import java.io.UnsupportedEncodingException;
import java.security.SecureRandom;

public class RandomStringBuilder {
    SecureRandom rn = new SecureRandom();

    protected String randomString(int lo, int hi){
        int n = rand(lo, hi);
        byte b[] = new byte[n];
        for (int i = 0; i < n; i++)
            b[i] = (byte)rand('a', 'z');


        try {
            return new String(b,0,n, "UTF8");
        } catch (UnsupportedEncodingException e) {
            return "";
        }
    }

    private int rand(int lo, int hi){

        int n = hi - lo + 1;
        int i = rn.nextInt(n);
        if (i < 0)
            i = -i;
        return lo + i;
    }

    public String generate(int size)
    {
        return randomString(size, size);
    }
}
