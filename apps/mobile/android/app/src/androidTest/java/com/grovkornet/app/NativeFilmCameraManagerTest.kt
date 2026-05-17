package com.grovkornet.app

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class NativeFilmCameraManagerTest {

    @Test
    fun testPropsAreSetCorrectly() {
        // InstrumentationRegistry fornisce un contesto reale
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val manager = NativeFilmCameraManager()
        val view = NativeFilmCameraView(context)

        // Verifichiamo che i setter del Manager aggiornino correttamente la View
        manager.setSaturation(view, 0.5f)
        assertEquals("Saturation non impostata correttamente", 0.5f, view.saturation)

        manager.setContrast(view, 1.5f)
        assertEquals("Contrast non impostato correttamente", 1.5f, view.contrast)

        manager.setGrainIntensity(view, 0.8f)
        assertEquals("GrainIntensity non impostata correttamente", 0.8f, view.grainIntensity)

        manager.setGrainEnabled(view, false)
        assertFalse("GrainEnabled dovrebbe essere false", view.grainEnabled)

        manager.setChromaticAberration(view, 0.2f)
        assertEquals("Aberration non impostata correttamente", 0.2f, view.aberration)
    }
}
