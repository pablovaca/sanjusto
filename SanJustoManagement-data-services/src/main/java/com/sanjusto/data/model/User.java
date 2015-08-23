package com.sanjusto.data.model;

public class User {

    private Long id;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String username;
    @ExcludeFieldFromJSON private String password;
    private boolean enabled;

    public User(){
    }

    public User(Long id, String firstName, String middleName, String lastName, String email, String username, String password, boolean enabled){
        this.id = id;
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.email = email;
        this.username = username;
        this.password = password;
        this.enabled = enabled;
    }

    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }

    public String getFirstName(){
        return firstName;
    }

    public void setFirstName(String firstName){
        this.firstName = firstName;
    }

    public String getMiddleName(){
        return middleName;
    }

    public void setMiddleName(String middleName){
        this.middleName = middleName;
    }

    public String getLastName(){
        return lastName;
    }

    public void setLastName(String lastName){
        this.lastName = lastName;
    }

    public String getEmail(){
        return email;
    }

    public void setEmail(String email){
        this.email = email;
    }

    public String getUsername(){
        return username;
    }

    public void setUsername(String username){
        this.username = username;
    }

    public String getPassword(){
        return password;
    }

    public void setPassword(String password){
        this.password = password;
    }

    public boolean getEnabled(){
        return enabled;
    }

    public void setEnabled(boolean enabled){
        this.enabled = enabled;
    }
}
