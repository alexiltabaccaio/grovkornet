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
}
