package com.grovkornet.nativefilmcamera.ui

import com.grovkornet.nativefilmcamera.camera.CameraEngine
import com.grovkornet.nativefilmcamera.errors.CameraCodedException

class CameraView {
    private external fun nativePrepare(width: Int, height: Int)
}
