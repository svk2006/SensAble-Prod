package com.sensable.app.perception

import android.content.Context
import android.content.ContextWrapper
import android.graphics.ImageFormat
import android.util.Log
import android.util.Size
import android.widget.FrameLayout
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicLong

/**
 * Gate B: SensAble native perception view with MediaPipe HandLandmarker.
 *
 * Architecture:
 *   CameraX ImageAnalysis
 *     → ImageProxy
 *     → toBitmap() (independently-owned representation)
 *     → MPImage (BitmapImageBuilder)
 *     → HandLandmarker.detectAsync (LIVE_STREAM mode, CPU delegate)
 *     → ImageProxy.close() immediately in finally block
 *     → resultListener callback (Logcat metrics)
 */
class SensAblePerceptionView(context: Context) : FrameLayout(context) {

    companion object {
        private const val TAG = "SensAblePerception"
        private const val MODEL_NAME = "hand_landmarker.task"
        private const val ANALYSIS_WIDTH = 1280
        private const val ANALYSIS_HEIGHT = 720
        private const val FPS_WINDOW_MS = 1000L
    }

    // Single-thread executor for CameraX analysis & MediaPipe submission
    private val perceptionExecutor = Executors.newSingleThreadExecutor { runnable ->
        Thread(runnable, "SensAble-Perception").apply { isDaemon = true }
    }

    // Counters and state
    private val frameCounter = AtomicLong(0L)
    private val mpCallbackCounter = AtomicLong(0L)
    private val droppedFramesCounter = AtomicLong(0L)

    private var cameraProvider: ProcessCameraProvider? = null
    private var handLandmarker: HandLandmarker? = null

    // Image metadata tracking for coordinate alignment
    @Volatile private var lastImageWidth = ANALYSIS_WIDTH
    @Volatile private var lastImageHeight = ANALYSIS_HEIGHT
    @Volatile private var lastRotationDegrees = 270

    // Latency tracking: timestampMs -> sendTimeMs
    private val sendTimesMs = ConcurrentHashMap<Long, Long>()

    // FPS / Rate tracking
    private var cameraFpsWindowStart = System.currentTimeMillis()
    private var cameraFpsWindowCount = 0

    private var mpRateWindowStart = System.currentTimeMillis()
    private var mpRateWindowCount = 0

    private val previewView = PreviewView(context).apply {
        scaleType = PreviewView.ScaleType.FILL_CENTER
        implementationMode = PreviewView.ImplementationMode.COMPATIBLE
    }

    init {
        addView(previewView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        Log.d(TAG, "=== SensAblePerceptionView attached — starting Gate B pipeline ===")

        val lifecycleOwner = resolveLifecycleOwner()
        if (lifecycleOwner == null) {
            Log.e(TAG, "GATE B BLOCKED: No LifecycleOwner found in context chain.")
            return
        }

        setupMediaPipe()
        startCamera(lifecycleOwner)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        Log.d(TAG, "=== SensAblePerceptionView detached — stopping Gate B pipeline ===")
        stopCamera()
        closeMediaPipe()
    }

    private fun resolveLifecycleOwner(): LifecycleOwner? {
        var ctx: Context = context
        while (ctx is ContextWrapper) {
            if (ctx is LifecycleOwner) return ctx as LifecycleOwner
            ctx = ctx.baseContext
        }
        return null
    }

    // ─── MediaPipe Initialization ─────────────────────────────────────────────

    private fun setupMediaPipe() {
        try {
            val baseOptions = BaseOptions.builder()
                .setModelAssetPath(MODEL_NAME)
                .setDelegate(Delegate.CPU)
                .build()

            val options = HandLandmarker.HandLandmarkerOptions.builder()
                .setBaseOptions(baseOptions)
                .setMinHandDetectionConfidence(0.5f)
                .setMinTrackingConfidence(0.5f)
                .setMinHandPresenceConfidence(0.5f)
                .setNumHands(2)
                .setRunningMode(RunningMode.LIVE_STREAM)
                .setResultListener { result, inputImage ->
                    onMediaPipeResult(result, inputImage)
                }
                .setErrorListener { error ->
                    Log.e(TAG, "MEDIAPIPE_ERROR: ${error.message}", error)
                }
                .build()

            handLandmarker = HandLandmarker.createFromOptions(context, options)
            Log.d(TAG, "MEDIA_PIPE_INITIALIZED: HandLandmarker created successfully (CPU delegate, maxHands=2)")
        } catch (e: Exception) {
            Log.e(TAG, "GATE B FAILURE: MediaPipe init failed: ${e.message}", e)
        }
    }

    private fun closeMediaPipe() {
        try {
            handLandmarker?.close()
            handLandmarker = null
            Log.d(TAG, "MEDIA_PIPE_CLOSED: Resources released")
        } catch (e: Exception) {
            Log.e(TAG, "Error closing MediaPipe: ${e.message}", e)
        }
    }

    // ─── CameraX Setup ────────────────────────────────────────────────────────

    private fun startCamera(lifecycleOwner: LifecycleOwner) {
        val future = ProcessCameraProvider.getInstance(context)
        future.addListener({
            try {
                val provider = future.get()
                cameraProvider = provider
                bindUseCases(provider, lifecycleOwner)
            } catch (e: Exception) {
                Log.e(TAG, "GATE B FAILURE: ProcessCameraProvider.get() threw: ${e.message}", e)
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun bindUseCases(provider: ProcessCameraProvider, lifecycleOwner: LifecycleOwner) {
        val cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA

        val preview = Preview.Builder().build().also {
            it.setSurfaceProvider(previewView.surfaceProvider)
        }

        val resolutionSelector = ResolutionSelector.Builder()
            .setResolutionStrategy(
                ResolutionStrategy(
                    Size(ANALYSIS_WIDTH, ANALYSIS_HEIGHT),
                    ResolutionStrategy.FALLBACK_RULE_CLOSEST_LOWER_THEN_HIGHER
                )
            )
            .build()

        val imageAnalysis = ImageAnalysis.Builder()
            .setResolutionSelector(resolutionSelector)
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_YUV_420_888)
            .build()

        imageAnalysis.setAnalyzer(perceptionExecutor) { imageProxy ->
            analyzeFrame(imageProxy)
        }

        provider.unbindAll()

        try {
            provider.bindToLifecycle(lifecycleOwner, cameraSelector, preview, imageAnalysis)
            Log.d(TAG, "GATE B: CameraX bound to front camera with ImageAnalysis + MediaPipe")
        } catch (e: Exception) {
            Log.e(TAG, "GATE B FAILURE: bindToLifecycle failed: ${e.message}", e)
        }
    }

    fun stopCameraIfRunning() {
        stopCamera()
    }

    private fun stopCamera() {
        cameraProvider?.unbindAll()
        cameraProvider = null
        Log.d(TAG, "CameraX unbound. Analyzed frames: ${frameCounter.get()}, MP callbacks: ${mpCallbackCounter.get()}")
    }

    // ─── Frame Analyzer (Gate B) ──────────────────────────────────────────────

    private fun analyzeFrame(imageProxy: ImageProxy) {
        val frameNumber = frameCounter.incrementAndGet()
        val timestampNs = imageProxy.imageInfo.timestamp
        val timestampMs = timestampNs / 1_000_000L
        val width = imageProxy.width
        val height = imageProxy.height
        val rotation = imageProxy.imageInfo.rotationDegrees

        lastImageWidth = width
        lastImageHeight = height
        lastRotationDegrees = rotation

        // Camera FPS tracking
        cameraFpsWindowCount++
        val now = System.currentTimeMillis()
        val elapsedCamera = now - cameraFpsWindowStart
        if (elapsedCamera >= FPS_WINDOW_MS) {
            val cameraFps = cameraFpsWindowCount * 1000.0 / elapsedCamera
            Log.d(TAG, "~~~ Camera FPS: ${"%.1f".format(cameraFps)} | Total camera frames: $frameNumber ~~~")
            cameraFpsWindowCount = 0
            cameraFpsWindowStart = now
        }

        val landmarker = handLandmarker
        if (landmarker == null) {
            imageProxy.close()
            return
        }

        try {
            // Convert ImageProxy to Bitmap (independent copy, safe for async MP inference)
            val bitmap = imageProxy.toBitmap()

            // Build MPImage
            val mpImage = BitmapImageBuilder(bitmap).build()

            // Record send time for latency calculation
            sendTimesMs[timestampMs] = System.currentTimeMillis()

            // Send to MediaPipe
            landmarker.detectAsync(mpImage, timestampMs)

            Log.d(
                TAG,
                "FRAME_SENT_TO_MEDIAPIPE: Frame #$frameNumber (${width}x${height} rot=${rotation}° ts=$timestampMs ms)"
            )

        } catch (e: Exception) {
            droppedFramesCounter.incrementAndGet()
            Log.e(TAG, "FRAME_PROCESSING_ERROR on Frame #$frameNumber: ${e.message}", e)
        } finally {
            // CRITICAL: Always close ImageProxy immediately to return buffer to CameraX pool
            imageProxy.close()
        }
    }

    private fun resolveReactContext(): ReactContext? {
        var ctx: Context? = context
        while (ctx is ContextWrapper) {
            if (ctx is ReactContext) return ctx
            ctx = ctx.baseContext
        }
        return null
    }

    // ─── MediaPipe Result Listener ────────────────────────────────────────────

    private fun onMediaPipeResult(result: HandLandmarkerResult, inputImage: MPImage) {
        val callbackNum = mpCallbackCounter.incrementAndGet()
        val timestampMs = result.timestampMs()

        val sendTime = sendTimesMs.remove(timestampMs)
        val latencyMs = if (sendTime != null) System.currentTimeMillis() - sendTime else -1L

        val detectedHands = result.handedness().size
        val landmarkCount = result.landmarks().sumOf { it.size }

        // Instrumentation required by Gate B & C:
        Log.d(
            TAG,
            "MEDIAPIPE_CALLBACK #$callbackNum: ts=$timestampMs ms | DETECTED_HANDS=$detectedHands | LANDMARK_COUNT=$landmarkCount | latency=${if (latencyMs >= 0) "${latencyMs}ms" else "N/A"}"
        )

        // Construct React Native landmark event payload
        val payload: WritableMap = Arguments.createMap()
        payload.putDouble("timestampMs", timestampMs.toDouble())
        payload.putInt("imageWidth", lastImageWidth)
        payload.putInt("imageHeight", lastImageHeight)
        payload.putInt("rotationDegrees", lastRotationDegrees)

        val handsArray: WritableArray = Arguments.createArray()
        if (detectedHands > 0) {
            result.handedness().forEachIndexed { index, categoryList ->
                val category = categoryList.firstOrNull()
                val label = category?.categoryName() ?: "Right"
                val score = (category?.score() ?: 0.0f).toDouble()
                val landmarksList = result.landmarks().getOrNull(index)

                val handMap: WritableMap = Arguments.createMap()
                handMap.putString("handedness", label)
                handMap.putDouble("confidence", score)

                val landmarksArray: WritableArray = Arguments.createArray()
                landmarksList?.forEach { lm ->
                    val lmMap: WritableMap = Arguments.createMap()
                    lmMap.putDouble("x", lm.x().toDouble())
                    lmMap.putDouble("y", lm.y().toDouble())
                    lmMap.putDouble("z", lm.z().toDouble())
                    landmarksArray.pushMap(lmMap)
                }
                handMap.putArray("landmarks", landmarksArray)
                handsArray.pushMap(handMap)

                val wrist = landmarksList?.getOrNull(0)
                val indexTip = landmarksList?.getOrNull(8)
                Log.d(
                    TAG,
                    "  -> Hand #$index: label=$label score=${"%.2f".format(score)} wrist=(${wrist?.x()?.let { "%.3f".format(it) }}, ${wrist?.y()?.let { "%.3f".format(it) }}) indexTip=(${indexTip?.x()?.let { "%.3f".format(it) }}, ${indexTip?.y()?.let { "%.3f".format(it) }})"
                )
            }
        }
        payload.putArray("hands", handsArray)

        // Emit event to React Native JS layer
        val reactContext = resolveReactContext()
        if (reactContext != null && reactContext.hasActiveReactInstance()) {
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("SensAbleHandLandmarks", payload)

            Log.d(TAG, "LANDMARK_EVENT_EMITTED: timestamp=$timestampMs ms | hands=$detectedHands | landmarks=$landmarkCount")
        }

        // MP Callback Rate tracking
        mpRateWindowCount++
        val now = System.currentTimeMillis()
        val elapsedMp = now - mpRateWindowStart
        if (elapsedMp >= FPS_WINDOW_MS) {
            val mpRate = mpRateWindowCount * 1000.0 / elapsedMp
            val totalDropped = droppedFramesCounter.get()
            Log.d(
                TAG,
                "~~~ MediaPipe Rate: ${"%.1f".format(mpRate)} Hz | Hands: $detectedHands | Latency: ${latencyMs}ms | Dropped: $totalDropped | Total Callbacks: $callbackNum ~~~"
            )
            mpRateWindowCount = 0
            mpRateWindowStart = now
        }
    }

    override fun requestLayout() {
        super.requestLayout()
        post(measureAndLayout)
    }

    private val measureAndLayout = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }
}
