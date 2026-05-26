package com.grovkornet.app

import android.app.Application
import android.content.Context
import androidx.test.runner.AndroidJUnitRunner

/**
 * Custom runner that replaces MainApplication with our TestApplication.
 * This bypasses the entire React Native bridge during instrumented test execution.
 */
class CustomTestRunner : AndroidJUnitRunner() {
    override fun newApplication(cl: ClassLoader?, className: String?, context: Context?): Application {
        // Ignore the original className (MainApplication) and load our TestApplication
        return super.newApplication(cl, TestApplication::class.java.name, context)
    }
}
