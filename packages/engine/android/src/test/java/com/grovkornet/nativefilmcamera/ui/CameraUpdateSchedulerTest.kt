package com.grovkornet.nativefilmcamera.ui

import org.junit.Test
import org.junit.Assert.*

class CameraUpdateSchedulerTest {

    @Test
    fun schedule_executesImmediatelyOnFirstCall() {
        var updateCalled = false
        var currentTime = 1000L

        val scheduler = CameraUpdateScheduler(
            onUpdateCameraControls = { updateCalled = true },
            postDelayedAction = { _, _ -> fail("Should not post delayed on first call") },
            removeCallbacksAction = { },
            currentTimeProvider = { currentTime }
        )

        scheduler.schedule()

        assertTrue("Update should be called immediately", updateCalled)
        assertEquals("Update count should be 1", 1, scheduler.getAndResetUpdateCount())
    }

    @Test
    fun schedule_postsDelayedIfCalledBeforeMinInterval() {
        var updateCalls = 0
        var postedDelay = -1L
        var postedRunnable: Runnable? = null
        var currentTime = 1000L

        val scheduler = CameraUpdateScheduler(
            onUpdateCameraControls = { updateCalls++ },
            postDelayedAction = { r, delay -> 
                postedRunnable = r
                postedDelay = delay
            },
            removeCallbacksAction = { },
            currentTimeProvider = { currentTime }
        )

        // First call at 1000ms -> immediate
        scheduler.schedule()
        assertEquals(1, updateCalls)

        // Second call at 1010ms (10ms later, < 33ms interval) -> should post delayed
        currentTime = 1010L
        scheduler.schedule()

        assertEquals("Should not call update immediately second time", 1, updateCalls)
        assertNotNull("Should post runnable", postedRunnable)
        assertEquals("Delay should be remaining time (33 - 10 = 23)", 23L, postedDelay)

        // Simulate runnable execution after delay
        currentTime = 1033L
        postedRunnable?.run()

        assertEquals("Update should be called after runnable runs", 2, updateCalls)
        assertEquals("Update count should reflect 2 executions", 2, scheduler.getAndResetUpdateCount())
    }

    @Test
    fun release_removesCallbacks() {
        var removeCalled = false
        val scheduler = CameraUpdateScheduler(
            onUpdateCameraControls = { },
            postDelayedAction = { _, _ -> },
            removeCallbacksAction = { removeCalled = true },
            currentTimeProvider = { 1000L }
        )

        scheduler.release()
        assertTrue("Release should remove callbacks", removeCalled)
    }
}
