package com.crm.utils;

public class RandomPasswordBuilder extends RandomStringBuilder{

    public String generate(int size)
    {
        return generate(size,size);
    }

    public String generate()
    {
        return generate(10,12);
    }

    public String generate(int lo,int hi)
    {
        StringBuilder password=new StringBuilder(randomString(lo, hi));

        int changeLetters=rn.nextInt(3);
        for(int i=0;i<changeLetters;i++) {
            int pos = rn.nextInt(password.length());
            char c = Character.toUpperCase(password.charAt(pos));
            password.setCharAt(pos, c);
        }
        return password.toString();
    }

}