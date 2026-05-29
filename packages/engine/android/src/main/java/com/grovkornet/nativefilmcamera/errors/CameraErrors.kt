package com.grovkornet.nativefilmcamera.errors

// Generated from camera-errors.json. Do not modify directly.
enum class CameraErrorCode(val code: Int, val severity: String) {
    E_CAMERA_UNAUTHORIZED(1001, "fatal"),
    E_SHADER_COMPILE_FAILED(1002, "fatal"),
    E_PRESET_PREVIEW_FAILED(1003, "warning"),
    E_FILE_DELETE_FAILED(1004, "warning"),
    E_ENGINE_LIBRARY_LOAD_FAILED(1005, "fatal"),
    E_CAMERA_BIND_FAILED(1006, "fatal"),
    E_GALLERY_WRITE_FAILED(1007, "warning"),
    E_WATERMARK_EMBED_FAILED(1008, "warning"),
    E_AUTHENTICITY_VERIFICATION_FAILED(1009, "warning"),
    E_TORCH_SET_FAILED(1010, "warning"),
    E_FILAMENT_INIT_FAILED(1011, "fatal"),
    E_PIPELINE_INIT_FAILED(1012, "fatal");
}
