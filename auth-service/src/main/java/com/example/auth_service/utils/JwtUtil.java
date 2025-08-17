package com.example.auth_service.util;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;

import java.util.Date;

public class JwtUtil {

    // Minst 256 bit (32 tecken) för HMAC-SHA256
    private static final String SECRET = "supersecretjwtkey1234567890123456";

    public static String generateToken(String username, String role) throws Exception {
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .claim("role", role)
                .issuer("auth-service")
                .expirationTime(new Date(new Date().getTime() + 60 * 60 * 1000)) 
                .build();

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
        SignedJWT signedJWT = new SignedJWT(header, claimsSet);

        signedJWT.sign(new MACSigner(SECRET.getBytes()));

        return signedJWT.serialize();
    }

    public static String getSecret() {
        return SECRET;
    }
    public static String extractUsername(String token) {
    try {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7); 
        }

        SignedJWT signedJWT = SignedJWT.parse(token);

        JWSVerifier verifier = new MACVerifier(SECRET.getBytes());
        if (!signedJWT.verify(verifier)) {
            return null;
        }

        Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        if (expirationTime.before(new Date())) {
            return null;
        }

        return signedJWT.getJWTClaimsSet().getSubject();
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
}
}
