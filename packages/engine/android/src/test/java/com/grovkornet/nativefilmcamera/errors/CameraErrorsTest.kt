package com.grovkornet.nativefilmcamera.errors

import org.junit.Test
import org.junit.Assert.*

class CameraErrorsTest {

    @Test
    fun cameraErrorCode_valuesAreCorrect() {
        // Exercise Kotlin 1.9+ synthetic entries property
        assertNotNull(CameraErrorCode.entries)

        for (code in CameraErrorCode.values()) {
            assertNotNull(code.code)
            assertNotNull(code.severity)
            assertNotNull(code.category)
        }
        
        val unauthorized = CameraErrorCode.E_CAMERA_UNAUTHORIZED
        assertEquals(1001, unauthorized.code)
        assertEquals("fatal", unauthorized.severity)
        assertEquals("permissions", unauthorized.category)

        // Exercise auto-generated valueOf method to achieve 100% enum coverage
        val valueOfResult = CameraErrorCode.valueOf("E_CAMERA_UNAUTHORIZED")
        assertEquals(unauthorized, valueOfResult)
    }

    @Test
    fun cameraCodedException_constructorsAndDefaultArgs() {
        // Test combinations of default arguments to cover Kotlin's synthetic method extensions and null checks
        val code = CameraErrorCode.E_CAMERA_UNAUTHORIZED
        val cause = RuntimeException("Root cause")

        val ex1 = CameraCodedException(code)
        assertEquals(code.name, ex1.code)
        assertEquals(code.name, ex1.message)
        assertNull(ex1.cause)

        val ex2 = CameraCodedException(code, "Custom message")
        assertEquals(code.name, ex2.code)
        assertEquals("Custom message", ex2.message)
        assertNull(ex2.cause)

        val ex3 = CameraCodedException(code, "Custom message", cause)
        assertEquals(code.name, ex3.code)
        assertEquals("Custom message", ex3.message)
        assertEquals(cause, ex3.cause)

        val ex4 = CameraCodedException(code, null, cause)
        assertEquals(code.name, ex4.code)
        assertEquals(code.name, ex4.message)
        assertEquals(cause, ex4.cause)
    }

    @Test
    fun cameraErrorFactory_createsCorrectExceptions() {
        val cause = RuntimeException("JNI error")

        // Call factory methods both with and without cause parameter to cover default arguments
        val ex1 = CameraErrorFactory.createCameraUnauthorized()
        assertEquals("E_CAMERA_UNAUTHORIZED", ex1.code)
        assertTrue(ex1.message?.contains("camera permissions") == true)
        assertNull(ex1.cause)

        val ex1WithCause = CameraErrorFactory.createCameraUnauthorized(cause)
        assertEquals(cause, ex1WithCause.cause)

        val ex2 = CameraErrorFactory.createShaderCompileFailed("my_shader", "line 10 failed")
        assertEquals("E_SHADER_COMPILE_FAILED", ex2.code)
        assertTrue(ex2.message?.contains("my_shader") == true)
        assertNull(ex2.cause)

        val ex2WithCause = CameraErrorFactory.createShaderCompileFailed("my_shader", "line 10 failed", cause)
        assertEquals(cause, ex2WithCause.cause)

        val ex3 = CameraErrorFactory.createPresetPreviewFailed("low memory")
        assertEquals("E_PRESET_PREVIEW_FAILED", ex3.code)
        assertTrue(ex3.message?.contains("low memory") == true)
        assertNull(ex3.cause)

        val ex3WithCause = CameraErrorFactory.createPresetPreviewFailed("low memory", cause)
        assertEquals(cause, ex3WithCause.cause)

        val ex4 = CameraErrorFactory.createFileDeleteFailed("/path/to/file", "permission denied")
        assertEquals("E_FILE_DELETE_FAILED", ex4.code)
        assertTrue(ex4.message?.contains("/path/to/file") == true)
        assertNull(ex4.cause)

        val ex4WithCause = CameraErrorFactory.createFileDeleteFailed("/path/to/file", "permission denied", cause)
        assertEquals(cause, ex4WithCause.cause)

        val ex5 = CameraErrorFactory.createEngineLibraryLoadFailed("missing so file")
        assertEquals("E_ENGINE_LIBRARY_LOAD_FAILED", ex5.code)
        assertNull(ex5.cause)

        val ex5WithCause = CameraErrorFactory.createEngineLibraryLoadFailed("missing so file", cause)
        assertEquals(cause, ex5WithCause.cause)

        val ex6 = CameraErrorFactory.createCameraBindFailed("surface not ready")
        assertEquals("E_CAMERA_BIND_FAILED", ex6.code)
        assertNull(ex6.cause)

        val ex6WithCause = CameraErrorFactory.createCameraBindFailed("surface not ready", cause)
        assertEquals(cause, ex6WithCause.cause)

        val ex7 = CameraErrorFactory.createGalleryWriteFailed("disk full")
        assertEquals("E_GALLERY_WRITE_FAILED", ex7.code)
        assertNull(ex7.cause)

        val ex7WithCause = CameraErrorFactory.createGalleryWriteFailed("disk full", cause)
        assertEquals(cause, ex7WithCause.cause)

        val ex8 = CameraErrorFactory.createWatermarkEmbedFailed("bad format")
        assertEquals("E_WATERMARK_EMBED_FAILED", ex8.code)
        assertNull(ex8.cause)

        val ex8WithCause = CameraErrorFactory.createWatermarkEmbedFailed("bad format", cause)
        assertEquals(cause, ex8WithCause.cause)

        val ex9 = CameraErrorFactory.createAuthenticityVerificationFailed("signature mismatch")
        assertEquals("E_AUTHENTICITY_VERIFICATION_FAILED", ex9.code)
        assertNull(ex9.cause)

        val ex9WithCause = CameraErrorFactory.createAuthenticityVerificationFailed("signature mismatch", cause)
        assertEquals(cause, ex9WithCause.cause)

        val ex10 = CameraErrorFactory.createTorchSetFailed("hardware issue")
        assertEquals("E_TORCH_SET_FAILED", ex10.code)
        assertNull(ex10.cause)

        val ex10WithCause = CameraErrorFactory.createTorchSetFailed("hardware issue", cause)
        assertEquals(cause, ex10WithCause.cause)

        val ex11 = CameraErrorFactory.createFilamentInitFailed("null gl context")
        assertEquals("E_FILAMENT_INIT_FAILED", ex11.code)
        assertNull(ex11.cause)

        val ex11WithCause = CameraErrorFactory.createFilamentInitFailed("null gl context", cause)
        assertEquals(cause, ex11WithCause.cause)

        val ex12 = CameraErrorFactory.createPipelineInitFailed("invalid dimensions")
        assertEquals("E_PIPELINE_INIT_FAILED", ex12.code)
        assertNull(ex12.cause)

        val ex12WithCause = CameraErrorFactory.createPipelineInitFailed("invalid dimensions", cause)
        assertEquals(cause, ex12WithCause.cause)

        val ex13 = CameraErrorFactory.createLowMemory("50MB", "200MB")
        assertEquals("E_LOW_MEMORY", ex13.code)
        assertNull(ex13.cause)

        val ex13WithCause = CameraErrorFactory.createLowMemory("50MB", "200MB", cause)
        assertEquals(cause, ex13WithCause.cause)

        val ex14 = CameraErrorFactory.createThermalThrottling("critical")
        assertEquals("E_THERMAL_THROTTLING", ex14.code)
        assertNull(ex14.cause)

        val ex14WithCause = CameraErrorFactory.createThermalThrottling("critical", cause)
        assertEquals(cause, ex14WithCause.cause)

        val ex15 = CameraErrorFactory.createZoomOutOfBounds("5.0", "3.0")
        assertEquals("E_ZOOM_OUT_OF_BOUNDS", ex15.code)
        assertNull(ex15.cause)

        val ex15WithCause = CameraErrorFactory.createZoomOutOfBounds("5.0", "3.0", cause)
        assertEquals(cause, ex15WithCause.cause)

        val ex16 = CameraErrorFactory.createResolutionNotSupported("10000", "5000")
        assertEquals("E_RESOLUTION_NOT_SUPPORTED", ex16.code)
        assertNull(ex16.cause)

        val ex16WithCause = CameraErrorFactory.createResolutionNotSupported("10000", "5000", cause)
        assertEquals(cause, ex16WithCause.cause)
    }
}
