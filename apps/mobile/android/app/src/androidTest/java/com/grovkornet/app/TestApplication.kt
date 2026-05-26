package com.grovkornet.app

import android.app.Application

/**
 * Dummy application used only during instrumented tests.
 * Prevents React Native initialization, avoiding crashes and ANRs
 * due to the absence of the Metro server in the test environment.
 */
class TestApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // We do not initialize anything here to keep the environment pure.
    }
}
