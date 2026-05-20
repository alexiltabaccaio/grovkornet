# Keep the classes and methods that are bound via JNI
-keep class com.grovkornet.nativefilmcamera.rendering.LiveFilmProcessor {
    private external <methods>;
}

-keep class com.grovkornet.nativefilmcamera.rendering.OffscreenFilmProcessor {
    private external <methods>;
}
