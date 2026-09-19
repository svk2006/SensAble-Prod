package com.sensable.app.perception

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * Gate A: ReactPackage that registers SensAblePerceptionViewManager.
 *
 * Registered manually in MainApplication.kt.
 * No autolink configuration needed for a view-only package.
 */
class SensAblePerceptionPackage : ReactPackage {

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        emptyList()

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        listOf(SensAblePerceptionViewManager())
}
