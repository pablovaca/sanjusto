/*
 * Cloud Foundry 2012.02.03 Beta
 * Copyright (c) [2009-2012] VMware, Inc. All Rights Reserved.
 *
 * This product is licensed to you under the Apache License, Version 2.0 (the "License").
 * You may not use this product except in compliance with the License.
 *
 * This product includes a number of subcomponents with
 * separate copyright notices and license terms. Your use of these
 * subcomponents is subject to the terms and conditions of the
 * subcomponent's license, as noted in the LICENSE file.
 */
package com.crm.services.impl;

import static org.springframework.security.jwt.codec.Codecs.b64UrlDecode;
import static org.springframework.security.jwt.codec.Codecs.b64UrlEncode;
import static org.springframework.security.jwt.codec.Codecs.concat;
import static org.springframework.security.jwt.codec.Codecs.utf8Decode;
import static org.springframework.security.jwt.codec.Codecs.utf8Encode;

import java.nio.CharBuffer;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.crypto.codec.Base64;
import org.springframework.security.jwt.crypto.sign.InvalidSignatureException;
import org.springframework.security.jwt.crypto.sign.MacSigner;
import org.springframework.security.jwt.crypto.sign.RsaSigner;
import org.springframework.security.jwt.crypto.sign.RsaVerifier;
import org.springframework.security.jwt.crypto.sign.SignatureVerifier;
import org.springframework.security.jwt.crypto.sign.Signer;
import org.springframework.util.Assert;

/**
 * This class encodes and decodes tokens from objects to strings and the other way around
 * It also signs the tokens for security
 * 
 * @author andres.postiglioni
 */
class TokenEncoder implements InitializingBean {

  /**
   * Field name for token id.
   */
  protected static final Logger logger = LogManager.getLogger(TokenEncoder.class);

  private ObjectMapper objectMapper = new ObjectMapper();

  private String verifierKey = new RandomValueStringGenerator().generate();

  private Signer signer = new MacSigner(verifierKey);

  private String signingKey = verifierKey;

  private SignatureVerifier verifier;

  static byte[] PERIOD = utf8Encode(".");
  
  /**
   * Get the verification key for the token signatures.
   * 
   * @return the key used to verify tokens
   */
  public Map<String, String> getKey() {
    Map<String, String> result = new LinkedHashMap<String, String>();
    result.put("alg", signer.algorithm());
    result.put("value", verifierKey);
    return result;
  }
  
  public void setKeyPair(KeyPair keyPair) {
    PrivateKey privateKey = keyPair.getPrivate();
    Assert.state(privateKey instanceof RSAPrivateKey, "KeyPair must be an RSA ");
    signer = new RsaSigner((RSAPrivateKey) privateKey);
    RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
    verifier = new RsaVerifier(publicKey);
    verifierKey = "-----BEGIN PUBLIC KEY-----\n" + new String(Base64.encode(publicKey.getEncoded())) + "\n-----END PUBLIC KEY-----";
  }

  /**
   * Sets the JWT signing key. It can be either a simple MAC key or an RSA key. RSA keys should be in OpenSSH format,
   * as produced by <tt>ssh-keygen</tt>.
   * 
   * @param key the key to be used for signing JWTs.
   */
  public void setSigningKey(String key) {
    Assert.hasText(key);
    key = key.trim();

    this.signingKey = key;

    if (isPublic(key)) {
      signer = new RsaSigner(key);
      logger.info("Configured with RSA signing key");
    }
    else {
      // Assume it's a MAC key
      this.verifierKey = key;
      signer = new MacSigner(key);
    }
  }

  /**
   * @return true if the key has a public verifier
   */
  private boolean isPublic(String key) {
    return key.startsWith("-----BEGIN");
  }
  
  /**
   * @return true if the signing key is a public key
   */
  public boolean isPublic() {
    return signer instanceof RsaSigner;
  }

  /**
   * The key used for verifying signatures produced by this class. This is not used but is returned from the endpoint
   * to allow resource servers to obtain the key.
   * 
   * For an HMAC key it will be the same value as the signing key and does not need to be set. For and RSA key, it
   * should be set to the String representation of the public key, in a standard format (e.g. OpenSSH keys)
   * 
   * @param key the signature verification key (typically an RSA public key)
   */
  public void setVerifierKey(String key) {
    this.verifierKey = key;
    try {
        Signer signer = new RsaSigner(verifierKey);
        throw new IllegalArgumentException("Private key cannot be set as verifierKey property");
    }
    catch (Exception expected) {
      // Expected
    }
  }

  public String encode(Token token) {
    try {
      String content = asString(token);
      
      return encodeAndSign(content);
    }
    catch (Exception e) {
      throw new InvalidTokenException("Invalid token", e);
    }
  }

  private String asString(Token token) throws Exception {
    Map<String, ?> tokenMap = this.asMap(token);
    String content = objectMapper.writeValueAsString(tokenMap);
    return content;
  }

  private String encodeAndSign(String content) {
    byte[] claims = utf8Encode(content);
    byte[] b64Claims = b64UrlEncode(claims);
    
    byte[] crypto = signer.sign(claims);
    byte[] b64Crypto = b64UrlEncode(crypto);
    
    return utf8Decode(concat(b64Claims, PERIOD, b64Crypto));
  }

  public Token decode(String encoded) {
    try {
      int period = encoded.indexOf('.');

      CharBuffer buffer = CharBuffer.wrap(encoded, 0, period);

      buffer.limit(period).position(0);
      byte[] claims = b64UrlDecode(buffer);
      
      boolean emptyCrypto = period + 1 == encoded.length() - 1;

      byte[] crypto;

      if (emptyCrypto) {
        crypto = new byte[0];
      } else {
        buffer.limit(encoded.length()).position(period + 1);
        crypto = b64UrlDecode(buffer);
      }

      verifier.verify(claims, crypto);
      
      String content = utf8Decode(claims);
      
      @SuppressWarnings("rawtypes")
      Map readValue = objectMapper.readValue(content, Map.class);
      
      @SuppressWarnings("unchecked")
      Token decoded = this.fromMap(readValue);

      return decoded;
    }
    catch (Exception e) {
      throw new InvalidTokenException("Invalid token", e);
    }
  }
  
  private Map<String, ?> asMap(Token token) {
    Map<String, Object> tokenMap = new HashMap<String, Object>();
    tokenMap.put("userId", token.getUserId());
    tokenMap.put("expireTime", token.getExpireTime());
    
    return tokenMap;
  }

  private Token fromMap(Map<String, ?> readValue) {
    Long uid = (Long) Long.valueOf(readValue.get("userId").toString());
    Long exp = (Long) readValue.get("expireTime");

    return new Token(uid, exp);
  }
  
  public void afterPropertiesSet() throws Exception {
    SignatureVerifier verifier = new MacSigner(verifierKey);
    try {
      verifier = new RsaVerifier(verifierKey);
    }
    catch (Exception e) {
      logger.warn("Unable to create an RSA verifier from verifierKey (ignoreable if using MAC)");
    }
    // Check the signing and verification keys match
    if (signer instanceof RsaSigner) {
      byte[] test = "test".getBytes();
      try {
        verifier.verify(test, signer.sign(test));
        logger.info("Signing and verification RSA keys match");
      }
      catch (InvalidSignatureException e) {
        logger.error("Signing and verification RSA keys do not match");
      }
    }
    else if (verifier instanceof  MacSigner){
      // Avoid a race condition where setters are called in the wrong order. Use of == is intentional.
      Assert.state(this.signingKey == this.verifierKey,
          "For MAC signing you do not need to specify the verifier key separately, and if you do it must match the signing key");
    }
    this.verifier = verifier;
  }
}
