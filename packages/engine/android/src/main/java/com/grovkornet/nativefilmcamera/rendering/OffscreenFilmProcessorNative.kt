package com.grovkornet.nativefilmcamera.rendering


import com.facebook.jni.HybridData
import com.facebook.soloader.SoLoader

class OffscreenFilmProcessorNative {
    private val mHybridData: HybridData

    init {
        mHybridData = initHybrid()
    }

    private external fun initHybrid(): HybridData

    external fun prepare(width: Int, height: Int, assetManager: Any)
    external fun processBitmap(input: Any, output: Any, statePtr: Long, invertY: Boolean)
    external fun processHardwareBuffer(hardwareBuffer: Any, statePtr: Long, invertY: Boolean)
    external fun updateOverlay(bitmaps: Any)
    external fun getDrsScale(): Float
    external fun simulateFrameTime(frameTimeMs: Float)
    external fun release()
}
