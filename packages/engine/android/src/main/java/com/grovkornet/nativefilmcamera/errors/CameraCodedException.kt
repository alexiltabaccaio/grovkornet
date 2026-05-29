package com.grovkornet.nativefilmcamera.errors

import expo.modules.kotlin.exception.CodedException

/**
 * CameraCodedException wraps Expo's CodedException to propagate structured camera errors
 * defined in camera-errors.json directly to JavaScript catch blocks.
 * 
 * - code: Maps directly to the name of the CameraErrorCode enum (e.g. "E_CAMERA_UNAUTHORIZED").
 * - message: Human-readable debug or fallback description.
 * 
 * When thrown in native Kotlin async functions, Expo Modules automatically convert this
 * to a JS Error containing error.code and error.message.
 */
class CameraCodedException(code: CameraErrorCode, message: String? = null, cause: Throwable? = null) :
    CodedException(code.name, message ?: code.name, cause)
