package com.grovkornet.nativefilmcamera.managers

import android.os.PowerManager
import org.junit.Assert.*
import org.junit.Test
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

class DeviceHealthManagerTest {

    private class TestMockContext : android.content.ContextWrapper(null)

    @Test
    fun register_triggersInitialUpdates() {
        val mockContext = TestMockContext()
        val reportedThermal = AtomicReference<String>()
        val reportedLowRam = AtomicBoolean(false)
        
        val manager = DeviceHealthManager(
            context = mockContext,
            onDeviceHealthUpdate = { thermal, lowRam ->
                reportedThermal.set(thermal)
                reportedLowRam.set(lowRam)
            },
            getPowerManager = { null },
            getActivityManager = { null },
            getMainExecutor = { java.util.concurrent.Executor { runnable -> runnable.run() } }
        )
        
        manager.register()
        
        assertEquals("normal", reportedThermal.get())
        assertFalse(reportedLowRam.get())
    }

    @Test
    fun register_calledMultipleTimes_doesNotTriggerMultipleCallbacks() {
        val mockContext = TestMockContext()
        var callbackCount = 0
        
        val manager = DeviceHealthManager(
            context = mockContext,
            onDeviceHealthUpdate = { _, _ -> callbackCount++ },
            getPowerManager = { null },
            getActivityManager = { null },
            getMainExecutor = { java.util.concurrent.Executor { runnable -> runnable.run() } }
        )
        
        manager.register()
        manager.register()
        
        assertEquals(1, callbackCount)
    }

    @Test
    fun unregister_worksCorrectly() {
        val mockContext = TestMockContext()
        val manager = DeviceHealthManager(
            context = mockContext,
            onDeviceHealthUpdate = { _, _ -> },
            getPowerManager = { null },
            getActivityManager = { null },
            getMainExecutor = { java.util.concurrent.Executor { runnable -> runnable.run() } }
        )
        
        manager.register()
        manager.unregister()
        manager.unregister() // Should handle double unregister safely
    }

    @Test
    fun mapThermalStatus_reflectionTest() {
        val mockContext = TestMockContext()
        val manager = DeviceHealthManager(
            context = mockContext,
            onDeviceHealthUpdate = { _, _ -> },
            getPowerManager = { null },
            getActivityManager = { null },
            getMainExecutor = { java.util.concurrent.Executor { runnable -> runnable.run() } }
        )

        val method = DeviceHealthManager::class.java.getDeclaredMethod("mapThermalStatus", Int::class.java)
        method.isAccessible = true

        // THERMAL_STATUS_NONE = 0
        assertEquals("normal", method.invoke(manager, 0))
        // THERMAL_STATUS_LIGHT = 1
        assertEquals("normal", method.invoke(manager, 1))
        // THERMAL_STATUS_MODERATE = 2
        assertEquals("normal", method.invoke(manager, 2))
        // THERMAL_STATUS_SEVERE = 3
        assertEquals("warning", method.invoke(manager, 3))
        // THERMAL_STATUS_CRITICAL = 4
        assertEquals("critical", method.invoke(manager, 4))
        // THERMAL_STATUS_EMERGENCY = 5
        assertEquals("critical", method.invoke(manager, 5))
        // THERMAL_STATUS_SHUTDOWN = 6
        assertEquals("critical", method.invoke(manager, 6))
        // Undefined status
        assertEquals("normal", method.invoke(manager, 99))
    }
}
