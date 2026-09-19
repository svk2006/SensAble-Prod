package com.sensable.app.perception

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

/**
 * Gate A: ViewManager for SensAblePerceptionView.
 *
 * Registered name "SensAblePerceptionView" matches the JS requireNativeComponent call.
 * No custom props needed for Gate A — the view manages its own CameraX lifecycle internally.
 *
 * Interop note: With newArchEnabled=true (RN 0.87), the Fabric interop layer wraps
 * legacy SimpleViewManagers automatically. No Codegen spec file needed for Gate A.
 */
class SensAblePerceptionViewManager : SimpleViewManager<SensAblePerceptionView>() {

    override fun getName(): String = "SensAblePerceptionView"

    override fun createViewInstance(reactContext: ThemedReactContext): SensAblePerceptionView {
        return SensAblePerceptionView(reactContext)
    }

    override fun onDropViewInstance(view: SensAblePerceptionView) {
        super.onDropViewInstance(view)
        // View's onDetachedFromWindow handles cleanup — this is a safety call.
        view.stopCameraIfRunning()
    }
}
