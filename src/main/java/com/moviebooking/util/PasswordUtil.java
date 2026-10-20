
package com.moviebooking.util;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;

public final class PasswordUtil {

    private static final int ITERATIONS = 210_000;
    private static final int KEY_LENGTH = 256;
    private static final int SALT_LENGTH = 16;
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordUtil() {
    }

    public static String generateSalt() {
        byte[] salt = new byte[SALT_LENGTH];
        RANDOM.nextBytes(salt);
        return toHex(salt);
    }

    public static String hashPassword(String password, String saltHex)
            throws Exception {

        byte[] salt = fromHex(saltHex);

        PBEKeySpec spec = new PBEKeySpec(
                password.toCharArray(), salt, ITERATIONS, KEY_LENGTH);

        try {
            SecretKeyFactory factory =
                    SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");

            return toHex(factory.generateSecret(spec).getEncoded());
        } finally {
            spec.clearPassword();
        }
    }

    public static boolean verifyPassword(
            String password, String saltHex, String storedHash)
            throws Exception {

        String calculatedHash = hashPassword(password, saltHex);

        return MessageDigest.isEqual(
                fromHex(calculatedHash), fromHex(storedHash));
    }

    private static String toHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();

        for (byte b : bytes) {
            result.append(String.format("%02x", b & 0xff));
        }

        return result.toString();
    }

    private static byte[] fromHex(String hex) {
        if (hex == null || hex.length() % 2 != 0) {
            throw new IllegalArgumentException("Invalid hexadecimal value.");
        }

        byte[] result = new byte[hex.length() / 2];

        for (int i = 0; i < result.length; i++) {
            int index = i * 2;
            result[i] = (byte) Integer.parseInt(
                    hex.substring(index, index + 2), 16);
        }

        return result;
    }
}
