package com.sanjusto.services.impl;

public class InvalidTokenException extends RuntimeException {
  private static final long serialVersionUID = 7631662718996476238L;

  public InvalidTokenException(String string, Exception e) {
    super(string, e);
  }
}
