package com.anonymous.Grovkornet

import android.app.Application

/**
 * Applicazione fittizia usata solo durante i test strumentati.
 * Impedisce l'inizializzazione di React Native, evitando crash e ANR
 * dovuti alla mancanza del server Metro nell'ambiente di test.
 */
class TestApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Non inizializziamo nulla qui per mantenere l'ambiente puro.
    }
}
