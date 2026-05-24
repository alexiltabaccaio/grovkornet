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
    fun onStop_restoresTorchIfLogicalEnabled() {
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
        assertEquals("camera_id_1", setTorchCalledWithId)
        assertEquals(true, setTorchCalledWithState)
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
}
