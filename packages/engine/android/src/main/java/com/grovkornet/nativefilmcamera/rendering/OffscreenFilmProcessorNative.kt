package com.grovkornet.nativefilmcamera.rendering


import com.facebook.jni.HybridData
import com.facebook.soloader.SoLoader

open class OffscreenFilmProcessorNative {
    private val mHybridData: HybridData

    init {
        mHybridData = initHybrid()
    }

    private external fun initHybrid(): HybridData

    open external fun prepare(width: Int, height: Int, assetManager: Any)
    open external fun processBitmap(input: Any, output: Any, statePtr: Long, invertY: Boolean)
    open external fun processHardwareBuffer(hardwareBuffer: Any, statePtr: Long, invertY: Boolean)
    open external fun updateOverlay(bitmaps: Any)
    open external fun getDrsScale(): Float
    open external fun simulateFrameTime(frameTimeMs: Float)
    open external fun release()
}
