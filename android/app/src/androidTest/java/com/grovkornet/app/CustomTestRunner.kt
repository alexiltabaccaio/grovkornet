package com.grovkornet.app

import android.app.Application
import android.content.Context
import androidx.test.runner.AndroidJUnitRunner

/**
 * Runner personalizzato che sostituisce la MainApplication con la nostra TestApplication.
 * Questo bypassa l'intero bridge React Native durante l'esecuzione dei test strumentati.
 */
class CustomTestRunner : AndroidJUnitRunner() {
    override fun newApplication(cl: ClassLoader?, className: String?, context: Context?): Application {
        // Ignoriamo il className originale (MainApplication) e carichiamo la nostra TestApplication
        return super.newApplication(cl, TestApplication::class.java.name, context)
    }
}
