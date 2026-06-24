package com.grovkornet.nativefilmcamera.managers

import android.hardware.camera2.CameraManager
import androidx.lifecycle.LifecycleOwner
import org.junit.Assert.*
import org.junit.Test
import java.lang.Exception

class CameraTorchManagerTest {

    @Test
    fun initialize_registersCallback() {
        var registerCalled = false

        val manager = CameraTorchManager(
            getTargetCameraId = { "0" },
            isTorchLogicalEnabled = { false },
            onTorchStateChanged = {},
            setTorchModeAction = { _, _ -> },
            registerTorchCallbackAction = { registerCalled = true },
            unregisterTorchCallbackAction = { }
        )

        manager.initialize()
        assertTrue("Should register torch callback on initialization", registerCalled)
    }

    @Test
    fun unregister_unregistersCallback() {
        var unregisterCalled = false

        val manager = CameraTorchManager(
            getTargetCameraId = { "back_camera" },
            isTorchLogicalEnabled = { true },
            onTorchStateChanged = {},
            setTorchModeAction = { _, _ -> },
            registerTorchCallbackAction = { },
            unregisterTorchCallbackAction = { unregisterCalled = true }
        )

        manager.unregister()
        assertTrue("Should unregister torch callback on unregister", unregisterCalled)
    }

    @Test
    fun restoreTorchIfLogicalEnabled_callsSetTorchMode_whenLogicalEnabled() {
        var setTorchCalledWithId: String? = null
        var setTorchCalledWithState: Boolean? = null

        val manager = CameraTorchManager(
            getTargetCameraId = { "back_camera" },
            isTorchLogicalEnabled = { true },
            onTorchStateChanged = {},
            setTorchModeAction = { id, enabled ->
                setTorchCalledWithId = id
                setTorchCalledWithState = enabled
            },
            registerTorchCallbackAction = { },
            unregisterTorchCallbackAction = { }
        )

        manager.restoreTorchIfLogicalEnabled()
        assertEquals("Should set torch mode for the correct camera", "back_camera", setTorchCalledWithId)
        assertEquals("Should set torch mode to true", true, setTorchCalledWithState)
    }

    @Test
    fun restoreTorchIfLogicalEnabled_doesNotCallSetTorchMode_whenLogicalDisabled() {
        var setTorchCalled = false

        val manager = CameraTorchManager(
            getTargetCameraId = { "back_camera" },
            isTorchLogicalEnabled = { false },
            onTorchStateChanged = {},
            setTorchModeAction = { _, _ -> setTorchCalled = true },
            registerTorchCallbackAction = { },
            unregisterTorchCallbackAction = { }
        )

        manager.restoreTorchIfLogicalEnabled()
        assertFalse("Should not call setTorchMode if torch is not logically enabled", setTorchCalled)
    }

    @Test
    fun onStop_doesNotRestoreTorch() {
        var setTorchCalledWithId: String? = null
        var setTorchCalledWithState: Boolean? = null

        val manager = CameraTorchManager(
            getTargetCameraId = { "camera_id_1" },
            isTorchLogicalEnabled = { true },
            onTorchStateChanged = {},
            setTorchModeAction = { id, enabled ->
                setTorchCalledWithId = id
                setTorchCalledWithState = enabled
            },
            registerTorchCallbackAction = { },
            unregisterTorchCallbackAction = { }
        )

        val mockLifecycleOwner = object : LifecycleOwner {
            override val lifecycle: androidx.lifecycle.Lifecycle
                get() = throw UnsupportedOperationException()
        }

        manager.onStop(mockLifecycleOwner)
        assertNull("Should not call setTorchMode on stop", setTorchCalledWithId)
        assertNull("Should not set torch state on stop", setTorchCalledWithState)
    }

    @Test
    fun callback_notifiesStateChange_whenTargetCameraMatches() {
        var reportedState: Boolean? = null

        val manager = CameraTorchManager(
            getTargetCameraId = { "camera_0" },
            isTorchLogicalEnabled = { false },
            onTorchStateChanged = { enabled -> reportedState = enabled },
            setTorchModeAction = { _, _ -> },
            registerTorchCallbackAction = { },
            unregisterTorchCallbackAction = { }
        )

        // Simulate callback for target camera
        manager.torchCallback.onTorchModeChanged("camera_0", true)
        assertEquals("Should report true for target camera", true, reportedState)

        // Simulate callback for different camera
        reportedState = null
        manager.torchCallback.onTorchModeChanged("camera_1", false)
        assertNull("Should ignore callbacks for non-target camera", reportedState)
    }

    @Test
    fun initialize_handlesException() {
        // Assert that register callback exception does not crash the manager
        val manager = CameraTorchManager(
            getTargetCameraId = { "0" },
            isTorchLogicalEnabled = { false },
            onTorchStateChanged = {},
            setTorchModeAction = { _, _ -> },
            registerTorchCallbackAction = { throw Exception("Mock JNI registration failure") },
            unregisterTorchCallbackAction = { }
        )
        try {
            manager.initialize()
        } catch (e: Exception) {
            fail("initialize should catch and log exceptions instead of throwing them")
        }
    }

    @Test
    fun unregister_handlesException() {
        // Assert that unregister callback exception does not crash the manager
        val manager = CameraTorchManager(
            getTargetCameraId = { "0" },
            isTorchLogicalEnabled = { false },
            onTorchStateChanged = {},
            setTorchModeAction = { _, _ -> },
            registerTorchCallbackAction = { },
            unregisterTorchCallbackAction = { throw Exception("Mock JNI unregistration failure") }
        )
        try {
            manager.unregister()
        } catch (e: Exception) {
            fail("unregister should catch and log exceptions instead of throwing them")
        }
    }

    @Test
    fun restoreTorchIfLogicalEnabled_handlesException() {
        // Assert that setTorchMode exception does not crash the manager
        val manager = CameraTorchManager(
            getTargetCameraId = { "0" },
            isTorchLogicalEnabled = { true },
            onTorchStateChanged = {},
            setTorchModeAction = { _, _ -> throw Exception("Mock hardware write failure") },
            registerTorchCallbackAction = { },
            unregisterTorchCallbackAction = { }
        )
        try {
            manager.restoreTorchIfLogicalEnabled()
        } catch (e: Exception) {
            fail("restoreTorchIfLogicalEnabled should catch and log exceptions instead of throwing them")
        }
    }

    @Test
    fun restoreTorchIfLogicalEnabled_handlesNullCameraId() {
        var setTorchCalled = false
        val manager = CameraTorchManager(
            getTargetCameraId = { null },
            isTorchLogicalEnabled = { true },
            onTorchStateChanged = {},
            setTorchModeAction = { _, _ -> setTorchCalled = true },
            registerTorchCallbackAction = { },
            unregisterTorchCallbackAction = { }
        )
        manager.restoreTorchIfLogicalEnabled()
        assertFalse("Should not call setTorchMode if target camera ID is null", setTorchCalled)
    }

    @Test
    fun callback_onTorchModeUnavailable_doesNotThrow() {
        val manager = CameraTorchManager(
            getTargetCameraId = { "0" },
            isTorchLogicalEnabled = { false },
            onTorchStateChanged = {},
            setTorchModeAction = { _, _ -> },
            registerTorchCallbackAction = { },
            unregisterTorchCallbackAction = { }
        )
        try {
            manager.torchCallback.onTorchModeUnavailable("0")
        } catch (e: Exception) {
            fail("onTorchModeUnavailable callback should run without throwing exceptions")
        }
    }
}
