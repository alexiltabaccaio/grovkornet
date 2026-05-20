package com.grovkornet.nativefilmcamera.rendering

import android.graphics.SurfaceTexture
import android.view.Surface
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.grovkornet.nativefilmcamera.state.CameraConfiguration
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class LiveFilmProcessorTest {

    @Test
    fun testLiveInitializationAndTeardown() = runBlocking {
        val processor = LiveFilmProcessor()
        
        val width = 128
        val height = 128
        val st = SurfaceTexture(0)
        st.setDefaultBufferSize(width, height)
        
        processor.prepare(st, width, height)
        
        assertEquals("Initial DRS scale should be 1.0f", 1.0f, processor.getDrsScale(), 0.001f)
        
        processor.release()
        st.release()
    }

    @Test
    fun testLiveRendering() = runBlocking {
        val processor = LiveFilmProcessor()
        val width = 128
        val height = 128
        
        val stInput = SurfaceTexture(0)
        stInput.setDefaultBufferSize(width, height)
        
        processor.prepare(stInput, width, height)
        
        val stOutput = SurfaceTexture(0)
        stOutput.setDefaultBufferSize(width, height)
        val surface = Surface(stOutput)
        
        val params = CameraConfiguration(
            saturation = 1.0f,
            contrast = 1.0f,
            ev = 0.0f,
            whiteBalance = 5000.0f,
            tint = 0.0f
        )
        
        val dummyMatrix = FloatArray(16) { 0f }
        dummyMatrix[0] = 1f
        dummyMatrix[5] = 1f
        dummyMatrix[10] = 1f
        dummyMatrix[15] = 1f

        // Render frames to verify it doesn't crash and handles surface drawing
        for (i in 0..5) {
            processor.renderLiveFrame(surface, params, dummyMatrix)
        }
        
        processor.release()
        surface.release()
        stOutput.release()
        stInput.release()
    }

    @Test
    fun testLiveDrsScaling() = runBlocking {
        val processor = LiveFilmProcessor()
        val width = 64
        val height = 64
        val st = SurfaceTexture(0)
        st.setDefaultBufferSize(width, height)
        
        processor.prepare(st, width, height)
        
        assertEquals(1.0f, processor.getDrsScale(), 0.001f)
        
        for (i in 1..10) {
            processor.simulateFrameTime(20.0f)
        }
        assertTrue("DRS scale should scale down under load", processor.getDrsScale() < 1.0f)
        
        processor.release()
        st.release()
    }
}
