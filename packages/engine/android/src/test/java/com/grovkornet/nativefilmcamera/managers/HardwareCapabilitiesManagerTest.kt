package com.grovkornet.nativefilmcamera.managers

import android.content.Context
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.util.Range
import android.util.Size
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.core.Camera
import androidx.camera.core.CameraInfo
import androidx.camera.core.ZoomState
import androidx.lifecycle.LiveData
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import io.mockk.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34], manifest = Config.NONE)
class HardwareCapabilitiesManagerTest {

    private lateinit var context: Context
    private lateinit var cameraManager: CameraManager
    private lateinit var mockCamera: Camera
    private lateinit var mockCameraInfo: CameraInfo
    private lateinit var mockCamera2Info: Camera2CameraInfo
    private lateinit var mockMap: WritableMap
    private lateinit var mockArray: WritableArray

    @Before
    fun setUp() {
        context = mockk(relaxed = true)
        cameraManager = mockk(relaxed = true)
        mockCamera = mockk(relaxed = true)
        mockCameraInfo = mockk(relaxed = true)
        mockCamera2Info = mockk(relaxed = true)
        mockMap = mockk(relaxed = true)
        mockArray = mockk(relaxed = true)

        every { context.getSystemService(Context.CAMERA_SERVICE) } returns cameraManager
        every { mockCamera.cameraInfo } returns mockCameraInfo

        mockkStatic(Arguments::class)
        every { Arguments.createMap() } returns mockMap
        every { Arguments.createArray() } returns mockArray

        mockkStatic(Camera2CameraInfo::class)
        every { Camera2CameraInfo.from(mockCameraInfo) } returns mockCamera2Info

        // Default zoomState setup to prevent ClassCastException on LiveData generic type erasure
        val mockZoomLiveData = mockk<LiveData<ZoomState>>(relaxed = true)
        every { mockZoomLiveData.value } returns null
        every { mockCameraInfo.zoomState } returns mockZoomLiveData
    }

    @After
    fun tearDown() {
        unmockkAll()
    }

    @Test
    fun testGetAvailableCameras_filtersBackCamerasAndCalculatesFocalLength() {
        val manager = HardwareCapabilitiesManager(context)
        
        every { cameraManager.cameraIdList } returns arrayOf("0", "1")
        
        val chars0 = mockk<CameraCharacteristics>(relaxed = true)
        every { cameraManager.getCameraCharacteristics("0") } returns chars0
        every { chars0.get(CameraCharacteristics.LENS_FACING) } returns CameraCharacteristics.LENS_FACING_BACK
        every { chars0.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS) } returns floatArrayOf(4.5f)
        every { chars0.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE) } returns android.util.SizeF(6.0f, 4.5f)
        
        val chars1 = mockk<CameraCharacteristics>(relaxed = true)
        every { cameraManager.getCameraCharacteristics("1") } returns chars1
        every { chars1.get(CameraCharacteristics.LENS_FACING) } returns CameraCharacteristics.LENS_FACING_FRONT

        val result = manager.getAvailableCameras()

        assertSame(mockArray, result)
        // Verify only back camera id "0" is added
        verify(exactly = 1) { mockMap.putString("id", "0") }
        verify(exactly = 0) { mockMap.putString("id", "1") }
        
        verify { mockMap.putDouble("focalLength", 4.5) }
        verify { mockMap.putInt("focalLength35mm", any()) }
    }

    @Test
    fun testPopulateCapabilities_populatesMetadataCorrectly() {
        val manager = HardwareCapabilitiesManager(context)
        every { cameraManager.cameraIdList } returns emptyArray()

        // Mock Stream Configuration for resolution sizing
        val mockStreamConfigMap = mockk<android.hardware.camera2.params.StreamConfigurationMap>(relaxed = true)
        val sizes = arrayOf(Size(1920, 1080), Size(3840, 2160))
        every { mockStreamConfigMap.getOutputSizes(android.graphics.SurfaceTexture::class.java) } returns sizes

        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES) } returns intArrayOf(
            CameraCharacteristics.CONTROL_AF_MODE_AUTO, 
            CameraCharacteristics.CONTROL_AF_MODE_CONTINUOUS_PICTURE
        )
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.NOISE_REDUCTION_AVAILABLE_NOISE_REDUCTION_MODES) } returns intArrayOf(1, 2)
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.EDGE_AVAILABLE_EDGE_MODES) } returns intArrayOf(1)
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES) } returns arrayOf(Range(15, 30), Range(30, 60))
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP) } returns mockStreamConfigMap
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE) } returns Range(100, 3200)
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_POST_RAW_SENSITIVITY_BOOST_RANGE) } returns Range(100, 200)

        // Mock Zoom state
        val mockZoomState = mockk<ZoomState>(relaxed = true)
        every { mockZoomState.minZoomRatio } returns 1.0f
        every { mockZoomState.maxZoomRatio } returns 10.0f
        
        val mockZoomLiveData = mockk<LiveData<ZoomState>>(relaxed = true)
        every { mockZoomLiveData.value } returns mockZoomState
        every { mockCameraInfo.zoomState } returns mockZoomLiveData

        val event = mockk<WritableMap>(relaxed = true)
        manager.populateCapabilities(event, mockCamera)

        verify { event.putBoolean("supportsFocus", true) }
        verify { event.putInt("isoMin", 100) }
        verify { event.putInt("isoMax", 6400) }
        verify { event.putDouble("minZoom", 1.0) }
        verify { event.putDouble("maxZoom", 10.0) }
        verify { event.putInt("maxFps", 60) }
        verify { event.putInt("maxResolutionWidth", 3840) }
    }

    @Test
    fun testPopulateCapabilities_capsMaxIsoTo12800() {
        val manager = HardwareCapabilitiesManager(context)
        every { cameraManager.cameraIdList } returns emptyArray()

        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES) } returns intArrayOf()
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.NOISE_REDUCTION_AVAILABLE_NOISE_REDUCTION_MODES) } returns intArrayOf()
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.EDGE_AVAILABLE_EDGE_MODES) } returns intArrayOf()
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES) } returns emptyArray()
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP) } returns null
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE) } returns Range(100, 6400)
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_POST_RAW_SENSITIVITY_BOOST_RANGE) } returns Range(100, 800) // 8x boost -> 51200 ISO, should be capped to 12800

        val event = mockk<WritableMap>(relaxed = true)
        manager.populateCapabilities(event, mockCamera)

        verify { event.putInt("isoMax", 12800) }
    }

    @Test
    fun testPopulateCapabilities_fallsBackOnLowBoostValue() {
        val manager = HardwareCapabilitiesManager(context)
        every { cameraManager.cameraIdList } returns emptyArray()

        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES) } returns intArrayOf()
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.NOISE_REDUCTION_AVAILABLE_NOISE_REDUCTION_MODES) } returns intArrayOf()
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.EDGE_AVAILABLE_EDGE_MODES) } returns intArrayOf()
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_AE_AVAILABLE_TARGET_FPS_RANGES) } returns emptyArray()
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP) } returns null
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.SENSOR_INFO_SENSITIVITY_RANGE) } returns Range(100, 1600)
        every { mockCamera2Info.getCameraCharacteristic(CameraCharacteristics.CONTROL_POST_RAW_SENSITIVITY_BOOST_RANGE) } returns Range(100, 100) // boost <= 100 -> fallback boost 400x -> 1600 * 4 = 6400

        val event = mockk<WritableMap>(relaxed = true)
        manager.populateCapabilities(event, mockCamera)

        verify { event.putInt("isoMax", 6400) }
    }
}
