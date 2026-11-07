package de.lauri.minigames;

import android.webkit.JavascriptInterface;

/**
 * Native Rust Core Bridge (liblauju_app_core.so) for Audio Mini Games.
 * Provides memory-safe SHA-256 hashing, payload integrity verification, and input sanitization.
 */
public final class RustAppCore {

    private static boolean nativeLoaded = false;

    static {
        try {
            System.loadLibrary("lauju_app_core");
            nativeLoaded = true;
        } catch (Throwable ignored) {
            nativeLoaded = false;
        }
    }

    public static boolean isNativeLoaded() {
        return nativeLoaded;
    }

    public static native String sha256Hex(String input);
    public static native boolean verifyIntegrity(String payload, String expectedSha256);
    public static native String sanitizeInput(String raw);

    @JavascriptInterface
    public boolean isRustActive() {
        return nativeLoaded;
    }

    @JavascriptInterface
    public String hashSha256(String input) {
        if (input == null) return "";
        if (nativeLoaded) {
            try {
                String res = sha256Hex(input);
                if (res != null) return res;
            } catch (Throwable ignored) {}
        }
        return "";
    }

    @JavascriptInterface
    public String sanitize(String raw) {
        if (raw == null) return "";
        if (nativeLoaded) {
            try {
                String res = sanitizeInput(raw);
                if (res != null) return res;
            } catch (Throwable ignored) {}
        }
        return raw.trim();
    }
}