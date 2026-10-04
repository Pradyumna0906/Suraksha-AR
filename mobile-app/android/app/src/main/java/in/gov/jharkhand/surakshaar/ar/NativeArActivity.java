package in.gov.jharkhand.surakshaar.ar;

import android.Manifest;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.drawable.GradientDrawable;
import android.content.ActivityNotFoundException;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.opengl.GLES11Ext;
import android.opengl.GLES20;
import android.opengl.GLSurfaceView;
import android.opengl.Matrix;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.Surface;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.google.ar.core.Anchor;
import com.google.ar.core.ArCoreApk;
import com.google.ar.core.Camera;
import com.google.ar.core.Config;
import com.google.ar.core.Frame;
import com.google.ar.core.HitResult;
import com.google.ar.core.InstantPlacementPoint;
import com.google.ar.core.Plane;
import com.google.ar.core.Session;
import com.google.ar.core.TrackingState;
import com.google.ar.core.exceptions.CameraNotAvailableException;
import com.google.ar.core.exceptions.UnavailableApkTooOldException;
import com.google.ar.core.exceptions.UnavailableArcoreNotInstalledException;
import com.google.ar.core.exceptions.UnavailableDeviceNotCompatibleException;
import com.google.ar.core.exceptions.UnavailableSdkTooOldException;
import com.google.ar.core.exceptions.UnavailableUserDeclinedInstallationException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * A native ARCore proof screen. It owns its own camera session and shows a camera background,
 * real horizontal-plane hit testing, one anchor, and an anchored training-object placeholder.
 */
public class NativeArActivity extends Activity {
    private static final int CAMERA_PERMISSION_REQUEST = 7001;
    private static final int PRACTICAL_PASS_SCORE = 80;
    public static final String EXTRA_MODULE = "module";
    public static final String EXTRA_OBJECT_LABEL = "objectLabel";
    public static final String EXTRA_LANGUAGE = "language";

    private GLSurfaceView surfaceView;
    private NativeArRenderer renderer;
    private Session session;
    private TextView statusView;
    private LinearLayout actionPanel;
    private TextView instructionView;
    private TextView scoreView;
    private TextView voiceStatusView;
    private TextToSpeech textToSpeech;
    private String language = "hi";
    private String effectiveSpeechLanguage = "hi";
    private String lastSpokenKey = "";
    private boolean speechReady;
    private boolean speechFailed;
    private boolean santaliFallback;
    private boolean santaliFallbackNoticeSpoken;
    private boolean installRequested = true;
    private boolean stopped = false;
    private boolean markerPlaced = false;
    private int placedMarkerCount = 0;
    private boolean drillFinished = false;
    private boolean safeDistanceReached = false;
    private int scenarioStep = 0;
    private int incorrectChoices = 0;
    private boolean correctChoiceFirst = Math.random() < 0.5;
    private String feedbackText = "";
    private String module = "fire";
    private String objectLabel = "Training object";

    private final BroadcastReceiver controlReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (SurakshaArEvents.ACTION_STOP.equals(action)) {
                stopSession();
                finish();
            } else if (SurakshaArEvents.ACTION_PAUSE.equals(action)) {
                pauseSession();
            } else if (SurakshaArEvents.ACTION_RESUME.equals(action)) {
                startOrResumeSession();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        module = getIntent().getStringExtra(EXTRA_MODULE);
        objectLabel = getIntent().getStringExtra(EXTRA_OBJECT_LABEL);
        language = getIntent().getStringExtra(EXTRA_LANGUAGE);
        if (module == null) module = "fire";
        if (objectLabel == null) objectLabel = "Training object";
        if (language == null) language = "hi";
        createArSurface();
        initSpeech();
        IntentFilter filter = new IntentFilter();
        filter.addAction(SurakshaArEvents.ACTION_STOP);
        filter.addAction(SurakshaArEvents.ACTION_PAUSE);
        filter.addAction(SurakshaArEvents.ACTION_RESUME);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(controlReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(controlReceiver, filter);
        }
        emitTracking("INITIALIZING", null);
    }

    private void createArSurface() {
        FrameLayout root = new FrameLayout(this);
        surfaceView = new GLSurfaceView(this);
        surfaceView.setPreserveEGLContextOnPause(true);
        surfaceView.setEGLContextClientVersion(2);
        renderer = new NativeArRenderer(this, this::onRendererEvent, module);
        surfaceView.setRenderer(renderer);
        surfaceView.setRenderMode(GLSurfaceView.RENDERMODE_CONTINUOUSLY);
        surfaceView.setOnTouchListener((view, event) -> {
            if (event.getAction() == MotionEvent.ACTION_UP) {
                final float x = event.getX();
                final float y = event.getY();
                surfaceView.queueEvent(() -> renderer.handleTap(x, y));
            }
            return true;
        });
        root.addView(surfaceView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        statusView = new TextView(this);
        statusView.setText("AR SAFETY PRACTICE\n" + objectLabel + "\nPoint at a flat surface");
        statusView.setTextColor(0xFFFFFFFF);
        statusView.setTextSize(13);
        statusView.setPadding(28, 20, 28, 20);
        statusView.setBackgroundColor(0xB3121A2A);
        FrameLayout.LayoutParams statusParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.TOP | Gravity.CENTER_HORIZONTAL);
        statusParams.topMargin = 70;
        root.addView(statusView, statusParams);

        buildTrainingPanel(root);

        TextView close = new TextView(this);
        close.setText("EXIT AR");
        close.setTextColor(0xFFFFFFFF);
        close.setTextSize(12);
        close.setPadding(28, 20, 28, 20);
        close.setBackgroundColor(0xB3A11C1C);
        close.setOnClickListener(view -> {
            stopSession();
            finish();
        });
        FrameLayout.LayoutParams closeParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL);
        closeParams.bottomMargin = 28;
        root.addView(close, closeParams);
        setContentView(root);
    }

    private void buildTrainingPanel(FrameLayout root) {
        actionPanel = new LinearLayout(this);
        actionPanel.setOrientation(LinearLayout.VERTICAL);
        actionPanel.setPadding(24, 18, 24, 18);
        actionPanel.setBackground(panelBackground(0xE8121A2A));
        FrameLayout.LayoutParams panelParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM);
        panelParams.leftMargin = 24;
        panelParams.rightMargin = 24;
        panelParams.bottomMargin = 102;
        root.addView(actionPanel, panelParams);
        renderTrainingPanel();
    }

    private GradientDrawable panelBackground(int color) {
        GradientDrawable background = new GradientDrawable();
        background.setColor(color);
        background.setCornerRadius(28f);
        return background;
    }

    private TextView panelText(String text, float size, int color) {
        TextView view = new TextView(this);
        view.setText(text);
        view.setTextColor(color);
        view.setTextSize(size);
        view.setPadding(8, 4, 8, 4);
        return view;
    }

    private void addChoice(String label, boolean correct) {
        TextView choice = panelText(label, 14, 0xFF17243A);
        choice.setGravity(Gravity.CENTER);
        choice.setPadding(18, 18, 18, 18);
        choice.setTypeface(null, 1);
        choice.setBackground(panelBackground(0xFFE7EDF5));
        choice.setOnClickListener(view -> submitChoice(correct));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.topMargin = 10;
        actionPanel.addView(choice, params);
    }

    private void renderTrainingPanel() {
        if (actionPanel == null) return;
        actionPanel.removeAllViews();
        String header = "FIRE".equals(module.toUpperCase())
            ? "FIRE & EVACUATION · AR TRAINING"
            : "GAS LEAK · AR TRAINING";
        actionPanel.addView(panelText(header, 11, 0xFF9DB6D8));
        addVoiceControls();
        instructionView = panelText("", 15, 0xFFFFFFFF);
        instructionView.setTypeface(null, 1);
        actionPanel.addView(instructionView);
        scoreView = panelText("", 12, 0xFFBFD0E8);
        actionPanel.addView(scoreView);

        if (!markerPlaced) {
            instructionView.setText(placementInstruction());
            scoreView.setText("Move the camera until the green floor target is over the chosen spot, then tap once. Camera does not detect hazards or exits automatically.\nPlaced: " + placedMarkerCount + "/3");
            speakCurrentGuidance(false);
            return;
        }

        if (drillFinished) {
            int score = safetyScore();
            boolean passed = score >= PRACTICAL_PASS_SCORE;
            instructionView.setText("Safety Score: " + score + "%  ·  " + (passed ? "PASS" : "RETRY REQUIRED"));
            scoreView.setText(passed
                ? "Practice record saved. Complete the in-app knowledge assessment for a QR-verifiable training record."
                : "Too many unsafe choices were selected. Restart the drill and review the guided decisions.");
            actionPanel.addView(panelText(markerLegend(), 12, 0xFFBFD0E8));
            addChoice("RESTART DRILL", true);
            speakCurrentGuidance(false);
            return;
        }

        instructionView.setText(stepInstruction());
        scoreView.setText(markerLegend() + (feedbackText.isEmpty() ? "" : "\n" + feedbackText) + "\nSafety score: " + safetyScore() + "%");
        addStepChoices();
        speakCurrentGuidance(false);
    }

    private void addVoiceControls() {
        LinearLayout controls = new LinearLayout(this);
        controls.setGravity(Gravity.CENTER_VERTICAL);
        voiceStatusView = panelText(voiceStatusText(), 11, 0xFFBFD0E8);
        controls.addView(voiceStatusView, new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        TextView repeat = panelText("🔊 REPEAT", 12, 0xFFFFFFFF);
        repeat.setGravity(Gravity.CENTER);
        repeat.setPadding(14, 10, 14, 10);
        repeat.setBackground(panelBackground(0xFF245A68));
        repeat.setOnClickListener(view -> speakCurrentGuidance(true));
        controls.addView(repeat);
        TextView setup = panelText("VOICE SETUP", 11, 0xFFFFFFFF);
        setup.setGravity(Gravity.CENTER);
        setup.setPadding(10, 10, 8, 10);
        setup.setOnClickListener(view -> openVoiceSetup());
        controls.addView(setup);
        actionPanel.addView(controls);

        LinearLayout languages = new LinearLayout(this);
        languages.setGravity(Gravity.CENTER);
        addVoiceLanguageButton(languages, "ENGLISH", "en");
        addVoiceLanguageButton(languages, "हिंदी", "hi");
        addVoiceLanguageButton(languages, "ᱥᱟᱱᱛᱟᱲᱤ", "sat");
        actionPanel.addView(languages);
    }

    private void addVoiceLanguageButton(LinearLayout row, String label, String code) {
        TextView button = panelText(label, 11, code.equals(language) ? 0xFF09251F : 0xFFFFFFFF);
        button.setGravity(Gravity.CENTER);
        button.setPadding(12, 8, 12, 8);
        button.setBackground(panelBackground(code.equals(language) ? 0xFF37D6A7 : 0xFF33445D));
        button.setOnClickListener(view -> selectSpeechLanguage(code));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f);
        params.setMargins(4, 2, 4, 4);
        row.addView(button, params);
    }

    private void selectSpeechLanguage(String code) {
        language = code;
        santaliFallbackNoticeSpoken = false;
        lastSpokenKey = "";
        if (textToSpeech != null && speechReady) configureSpeechLanguage();
        renderTrainingPanel();
    }

    private String voiceStatusText() {
        if (speechFailed) return "Voice unavailable · tap VOICE SETUP";
        if (!speechReady) return "Voice: starting…";
        String name = "en".equals(effectiveSpeechLanguage) ? "English" : "Hindi";
        if ("sat".equals(language) && !santaliFallback) name = "Santali";
        if (santaliFallback) return "Santali voice unavailable · speaking Hindi";
        return "Voice guide · " + name;
    }

    private void initSpeech() {
        textToSpeech = new TextToSpeech(this, status -> {
            if (status != TextToSpeech.SUCCESS || textToSpeech == null) {
                speechReady = false;
                speechFailed = true;
                refreshVoiceStatus();
                return;
            }
            configureSpeechLanguage();
            textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String utteranceId) {
                    updateVoicePlaybackStatus("Speaking · " + voiceLanguageName());
                }
                @Override public void onDone(String utteranceId) {
                    updateVoicePlaybackStatus(voiceStatusText());
                }
                @Override public void onError(String utteranceId) {
                    updateVoicePlaybackStatus("Voice playback failed · check volume/voice data");
                }
            });
            refreshVoiceStatus();
            speakCurrentGuidance(true);
        });
    }

    private void configureSpeechLanguage() {
        Locale requested = "en".equals(language) ? Locale.forLanguageTag("en-IN")
            : "sat".equals(language) ? Locale.forLanguageTag("sat-IN")
            : Locale.forLanguageTag("hi-IN");
        int result = textToSpeech.isLanguageAvailable(requested);
        santaliFallback = "sat".equals(language) && result < TextToSpeech.LANG_AVAILABLE;
        if (result >= TextToSpeech.LANG_AVAILABLE) {
            textToSpeech.setLanguage(requested);
            effectiveSpeechLanguage = language;
        } else {
            Locale fallback = "en".equals(language) ? Locale.US : new Locale("hi", "IN");
            int fallbackResult = textToSpeech.isLanguageAvailable(fallback);
            if (fallbackResult < TextToSpeech.LANG_AVAILABLE && !"en".equals(language)) {
                fallback = Locale.US;
                fallbackResult = textToSpeech.isLanguageAvailable(fallback);
            }
            if (fallbackResult >= TextToSpeech.LANG_AVAILABLE) {
                textToSpeech.setLanguage(fallback);
                effectiveSpeechLanguage = "en".equals(language) || "en".equals(fallback.getLanguage()) ? "en" : "hi";
            }
        }
        speechReady = effectiveSpeechLanguage != null && (result >= TextToSpeech.LANG_AVAILABLE
            || textToSpeech.isLanguageAvailable("en".equals(effectiveSpeechLanguage) ? Locale.US : new Locale("hi", "IN")) >= TextToSpeech.LANG_AVAILABLE);
        speechFailed = !speechReady;
        textToSpeech.setSpeechRate(0.88f);
        textToSpeech.setPitch(1.0f);
        lastSpokenKey = "";
    }

    private void refreshVoiceStatus() {
        runOnUiThread(() -> {
            if (voiceStatusView != null) voiceStatusView.setText(voiceStatusText());
        });
    }

    private void updateVoicePlaybackStatus(String text) {
        runOnUiThread(() -> {
            if (voiceStatusView != null) voiceStatusView.setText(text);
        });
    }

    private String voiceLanguageName() {
        if ("sat".equals(language) && !santaliFallback) return "Santali";
        return "en".equals(effectiveSpeechLanguage) ? "English" : "Hindi";
    }

    private void openVoiceSetup() {
        try {
            startActivity(new Intent(TextToSpeech.Engine.ACTION_INSTALL_TTS_DATA));
        } catch (ActivityNotFoundException error) {
            try {
                startActivity(new Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS));
            } catch (ActivityNotFoundException ignored) {
                android.widget.Toast.makeText(this, "Open Android Settings → Text-to-speech output → Install voice data.", android.widget.Toast.LENGTH_LONG).show();
            }
        }
    }

    private void speakCurrentGuidance(boolean repeat) {
        if (!speechReady || textToSpeech == null) return;
        String key = language + ":" + placedMarkerCount + ":" + scenarioStep + ":" + drillFinished + ":" + safeDistanceReached + ":" + feedbackText;
        if (!repeat && key.equals(lastSpokenKey)) return;
        String utterance = guidanceSpeechText();
        if (utterance.isEmpty()) return;
        lastSpokenKey = key;
        textToSpeech.speak(utterance, TextToSpeech.QUEUE_FLUSH, null, "raksha_ar_guide");
    }

    private String guidanceSpeechText() {
        String lang = effectiveSpeechLanguage;
        if ("sat".equals(language) && santaliFallback) {
            if (!santaliFallbackNoticeSpoken) {
                santaliFallbackNoticeSpoken = true;
                return "इस फ़ोन में संताली आवाज़ उपलब्ध नहीं है। हिंदी में निर्देश दिए जा रहे हैं।";
            }
            return hindiGuidanceText();
        }
        if ("sat".equals(lang)) return santaliGuidanceText();
        if ("hi".equals(lang)) return hindiGuidanceText();
        return englishGuidanceText();
    }

    private String englishGuidanceText() {
        if (!markerPlaced) return new String[] {"Move the green floor target over the simulated fire location and tap once. The camera does not detect real fire.", "Move the green floor target over the extinguisher station and tap once.", "Move the green floor target over the safe Exit B doorway and tap once."}[Math.min(placedMarkerCount, 2)];
        if (drillFinished) return "Drill complete. Safety score " + safetyScore() + " percent. Tap restart drill to practice again.";
        if (!feedbackText.isEmpty() && feedbackText.startsWith("Wrong")) return feedbackText;
        if ("gas".equals(module)) {
            switch (scenarioStep) {
                case 0: return "Gas leak practice. Select approved respiratory protective equipment. Do not enter a real gas hazard.";
                case 1: return safeDistanceReached ? "Movement check complete. Stay behind the marked safe boundary." : "Move back from the simulated leak while keeping the scene in view.";
                case 2: return "Alert your buddy. Do not continue alone.";
                default: return "Follow the marked safe exit. This is a training simulation, not gas detection.";
            }
        }
        switch (scenarioStep) {
            case 0: return "Choose Exit B, the clear route away from the simulated fire. Do not use Exit A.";
            case 1: return "Select a dry powder extinguisher for this practice scenario.";
            case 2: return "PASS step one: pull the safety pin.";
            case 3: return "PASS step two: keep the cylinder upright and angle the nozzle down toward the fire base, not the flames.";
            case 4: return "PASS step three: squeeze the lever to discharge dry chemical powder.";
            case 5: return "Powder is discharging. PASS step four: sweep the nozzle side to side across the fire base.";
            default: return "Leave by Exit B. Never re-enter the hazard area.";
        }
    }

    private String hindiGuidanceText() {
        if (!markerPlaced) return new String[] {"हरे फर्श वाले निशान को अभ्यास की आग की जगह पर लाएँ और एक बार टैप करें। कैमरा असली आग नहीं पहचानता।", "हरे निशान को अग्निशामक स्टेशन पर लाएँ और एक बार टैप करें।", "हरे निशान को सुरक्षित निकास बी के दरवाज़े पर लाएँ और एक बार टैप करें।"}[Math.min(placedMarkerCount, 2)];
        if (drillFinished) return "अभ्यास पूरा हुआ। आपका सुरक्षा स्कोर " + safetyScore() + " प्रतिशत है। फिर से अभ्यास करने के लिए रीस्टार्ट दबाएँ।";
        if (!feedbackText.isEmpty() && feedbackText.startsWith("Wrong")) {
            if ("gas".equals(module)) return scenarioStep == 0 ? "गलत। स्वीकृत श्वसन सुरक्षा उपकरण चुनें।" : scenarioStep == 1 ? "गलत। सुरक्षित सीमा के पीछे रहें।" : scenarioStep == 2 ? "गलत। आगे बढ़ने से पहले अपने साथी को सतर्क करें।" : "गलत। सुरक्षित निकास से बाहर जाएँ।";
            return scenarioStep == 0 ? "गलत। आग से दूर सुरक्षित निकास बी चुनें।" : scenarioStep == 1 ? "गलत। ड्राई पाउडर अग्निशामक चुनें।" : scenarioStep == 6 ? "खतरे वाले क्षेत्र में वापस न जाएँ। निकास बी से बाहर जाएँ।" : "पी ए एस एस क्रम याद रखें: पिन खींचें, आग के आधार पर निशाना लगाएँ, लीवर दबाएँ, फिर दाएँ-बाएँ घुमाएँ।";
        }
        if ("gas".equals(module)) {
            switch (scenarioStep) {
                case 0: return "गैस रिसाव का अभ्यास। स्वीकृत श्वसन सुरक्षा उपकरण चुनें। असली गैस खतरे में प्रवेश न करें।";
                case 1: return safeDistanceReached ? "दूरी का अभ्यास पूरा हुआ। सुरक्षित सीमा के पीछे रहें।" : "दृश्य को देखते हुए नकली रिसाव से पीछे हटें।";
                case 2: return "आगे बढ़ने से पहले अपने साथी को सतर्क करें। अकेले आगे न बढ़ें।";
                default: return "नक्शे में दिखाए सुरक्षित निकास से बाहर जाएँ। यह अभ्यास है, गैस पहचान नहीं।";
            }
        }
        switch (scenarioStep) {
            case 0: return "आग से दूर सुरक्षित रास्ता, निकास बी चुनें। निकास ए से न जाएँ।";
            case 1: return "इस अभ्यास की आग के लिए ड्राई पाउडर अग्निशामक चुनें।";
            case 2: return "पी ए एस एस का पहला कदम: सुरक्षा पिन खींचें।";
            case 3: return "दूसरा कदम: सिलेंडर सीधा रखें और नोज़ल को नीचे आग के आधार पर रखें, लपटों पर नहीं।";
            case 4: return "तीसरा कदम: लीवर दबाकर ड्राई केमिकल पाउडर छोड़ें।";
            case 5: return "पाउडर निकल रहा है। चौथा कदम: नोज़ल को आग के आधार पर दाएँ-बाएँ घुमाएँ।";
            default: return "निकास बी से बाहर जाएँ। खतरे वाले क्षेत्र में वापस न जाएँ।";
        }
    }

    private String santaliGuidanceText() {
        if (!markerPlaced) return new String[] {"ᱚᱛ ᱨᱮ ᱥᱮᱸᱜᱮᱞ ᱪᱤᱱᱦᱟᱹ ᱞᱟᱜᱟᱣ ᱞᱟᱹᱜᱤᱫ ᱴᱮᱯ ᱢᱮ।", "ᱤᱬᱤᱡᱽ ᱛᱷᱟᱶ ᱨᱮ ᱴᱮᱯ ᱢᱮ।", "ᱵᱟᱧᱪᱟᱣ ᱚᱰᱚᱠ ᱵᱤ ᱛᱷᱟᱶ ᱨᱮ ᱴᱮᱯ ᱢᱮ।"}[Math.min(placedMarkerCount, 2)];
        if (drillFinished) return "ᱪᱮᱥᱴᱟ ᱯᱩᱨᱟᱹᱣ ᱮᱱᱟ। ᱥᱩᱨᱚᱠᱥᱟ ᱥᱠᱚᱨ " + safetyScore() + " ᱯᱨᱚᱛᱤᱥᱚᱛ।";
        if ("gas".equals(module)) {
            switch (scenarioStep) {
                case 0: return "ᱜᱮᱥ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱥᱟᱢᱟᱱ ᱵᱟᱪᱷᱟᱣ ᱢᱮ।";
                case 1: return "ᱥᱩᱨᱚᱠᱥᱟ ᱥᱤᱢᱟ ᱠᱷᱚᱱ ᱚᱰᱚᱠ ᱢᱮ।";
                case 2: return "ᱟᱢᱟᱜ ᱜᱟᱛᱮ ᱥᱤᱜᱽᱱᱟᱞ ᱮᱢ ᱢᱮ।";
                default: return "ᱵᱟᱧᱪᱟᱣ ᱚᱰᱚᱠ ᱦᱚᱨ ᱛᱮ ᱥᱮᱱ ᱢᱮ।";
            }
        }
        switch (scenarioStep) {
            case 0: return "ᱥᱮᱸᱜᱮᱞ ᱠᱷᱚᱱ ᱥᱟᱢᱟᱝ ᱵᱟᱧᱪᱟᱣ ᱚᱰᱚᱠ ᱵᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ।";
            case 1: return "ᱰᱨᱟᱭ ᱯᱟᱣᱰᱟᱨ ᱤᱬᱤᱡᱽ ᱵᱟᱪᱷᱟᱣ ᱢᱮ।";
            case 2: return "ᱯᱤ ᱮ ᱮᱥ ᱮᱥ: ᱥᱟᱢᱟᱝ ᱯᱤᱱ ᱚᱨ ᱢᱮ।";
            case 3: return "ᱱᱚᱠᱟ ᱥᱮᱸᱜᱮᱞ ᱵᱩᱴᱟᱹ ᱥᱮᱫ ᱥᱟᱵᱽ ᱢᱮ।";
            case 4: return "ᱞᱤᱵᱷᱚᱨ ᱞᱤᱱ ᱢᱮ।";
            case 5: return "ᱥᱮᱸᱜᱮᱞ ᱵᱩᱴᱟᱹ ᱨᱮ ᱮᱴᱮᱫ ᱠᱚᱱᱮᱫ ᱟᱹᱪᱩᱨ ᱢᱮ।";
            default: return "ᱚᱰᱚᱠ ᱵᱤ ᱛᱮ ᱚᱰᱚᱠ ᱢᱮ। ᱦᱚᱨᱟ ᱨᱮ ᱟᱨᱦᱚᱸ ᱵᱟᱝ ᱨᱩᱣᱟᱹᱲ ᱢᱮ।";
        }
    }

    private String markerLegend() {
        return "fire".equals(module)
            ? "MARKERS: 🔥 SIMULATED FIRE  ·  🧯 EXTINGUISHER  ·  ➜ EXIT B"
            : "MARKERS: GAS LEAK (SIMULATED)  ·  SAFE BOUNDARY  ·  SAFE EXIT";
    }

    private String placementInstruction() {
        String[] fire = {"Move the green floor target to the simulated FIRE location, then tap once.", "Move the green floor target to the EXTINGUISHER station, then tap once.", "Move the green floor target to the safe EXIT B doorway, then tap once."};
        String[] gas = {"Move the green floor target beside the simulated GAS LEAK, then tap once.", "Move the green floor target to the SAFE BOUNDARY, then tap once.", "Move the green floor target to the safe EXIT doorway, then tap once."};
        String[] steps = "gas".equals(module) ? gas : fire;
        return "PLACE MARKER " + (placedMarkerCount + 1) + " OF 3\n" + steps[Math.min(placedMarkerCount, 2)];
    }

    private String stepInstruction() {
        if ("gas".equals(module)) {
            switch (scenarioStep) {
                case 0: return "Step 1 of 4 — Select the correct PPE for this simulated gas leak.";
                case 1: return "Step 2 of 4 — Maintain distance from the simulated leak.";
                case 2: return "Step 3 of 4 — Use the buddy system before continuing.";
                default: return "Step 4 of 4 — Follow the green safe-exit marker.";
            }
        }
        switch (scenarioStep) {
            case 0: return "Step 1 of 7 — Choose the marked exit that avoids the fire.";
            case 1: return "Step 2 of 7 — Select the extinguisher for this simulated fire.";
            case 2: return "Step 3 of 7 — Demonstrate PASS: pull the safety pin.";
            case 3: return "Step 4 of 7 — Keep the cylinder upright; tilt the nozzle down toward the fire base.";
            case 4: return "Step 5 of 7 — Squeeze the lever to discharge.";
            case 5: return "Step 6 of 7 — Sweep side to side across the fire base.";
            default: return "Step 7 of 7 — Follow the marked Exit B route; do not re-enter.";
        }
    }

    private void addStepChoices() {
        if ("gas".equals(module)) {
            switch (scenarioStep) {
                case 0: addChoicePair("Cloth mask", "Approved respiratory PPE"); return;
                case 1: addDistanceAction(); return;
                case 2: addChoicePair("Continue alone", "Alert buddy"); return;
                default: addChoicePair("Cross hazard area", "Follow green safe exit"); return;
            }
        }
        switch (scenarioStep) {
            case 0: addChoicePair("OPTION A · Exit A — hazard-side route", "OPTION B · Exit B — clear route"); return;
            case 1: addChoicePair("Water extinguisher", "Dry powder extinguisher"); return;
            case 2: addChoice("PULL PIN · remove the safety pin", true); return;
            case 3: addChoice("AIM · keep cylinder upright; point nozzle down to fire base", true); return;
            case 4: addChoice("SQUEEZE · press the operating lever", true); return;
            case 5: addChoice("SWEEP · move nozzle side to side", true); return;
            default: addChoicePair("Return through hazard zone", "Follow marked Exit B route"); return;
        }
    }

    private void addDistanceAction() {
        TextView guidance = panelText(safeDistanceReached
            ? "Movement check complete. Keep to the safe side of the marked boundary."
            : "Move back from the simulated leak while keeping the scene in view. Demo target: 0.8 m of horizontal movement.", 12, 0xFFBFD0E8);
        actionPanel.addView(guidance);
        TextView confirm = panelText(safeDistanceReached ? "Distance checked · Continue" : "Move back to continue", 14, 0xFF17243A);
        confirm.setGravity(Gravity.CENTER);
        confirm.setPadding(18, 18, 18, 18);
        confirm.setTypeface(null, 1);
        confirm.setBackground(panelBackground(safeDistanceReached ? 0xFF37D6A7 : 0xFF8793A5));
        confirm.setEnabled(safeDistanceReached);
        confirm.setOnClickListener(view -> submitChoice(true));
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.topMargin = 10;
        actionPanel.addView(confirm, params);
    }

    private void addChoicePair(String wrong, String correct) {
        if (correctChoiceFirst) {
            addChoice(correct, true);
            addChoice(wrong, false);
        } else {
            addChoice(wrong, false);
            addChoice(correct, true);
        }
    }

    private void submitChoice(boolean correct) {
        if (drillFinished) {
            restartDrill();
            return;
        }
        if (!correct) {
            incorrectChoices++;
            feedbackText = wrongFeedback();
            renderTrainingPanel();
            return;
        }
        scenarioStep++;
        surfaceView.queueEvent(() -> renderer.setScenarioStep(scenarioStep));
        correctChoiceFirst = Math.random() < 0.5;
        if ("gas".equals(module) && scenarioStep == 1) {
            safeDistanceReached = false;
            surfaceView.queueEvent(() -> renderer.beginSafetyDistanceCheck());
        }
        feedbackText = "Correct — " + nextFeedback();
        if (scenarioStep >= requiredSteps()) {
            drillFinished = true;
            emitDrillCompleted();
        }
        renderTrainingPanel();
    }

    private int requiredSteps() { return "gas".equals(module) ? 4 : 7; }
    private int safetyScore() { return Math.max(0, 100 - (incorrectChoices * 10)); }
    private String wrongFeedback() {
        if ("gas".equals(module)) {
            if (scenarioStep == 0) return "Wrong — select approved respiratory PPE.";
            if (scenarioStep == 1) return "Wrong — stay behind the safe boundary.";
            if (scenarioStep == 2) return "Wrong — alert your buddy; do not continue alone.";
            return "Wrong — use the green safe exit.";
        }
        if (scenarioStep == 0) return "Wrong — use Exit B; Exit A is in the simulated hazard zone.";
        if (scenarioStep == 1) return "Wrong — choose dry powder for this simulated fire.";
        if (scenarioStep == 6) return "Wrong — do not return through the hazard zone. Follow Exit B.";
        return "Use the PASS sequence: Pull, Aim at base, Squeeze, Sweep.";
    }
    private String nextFeedback() {
        if ("gas".equals(module)) {
            if (scenarioStep == 1) return "PPE selected. Move to the safe boundary.";
            if (scenarioStep == 2) return "Safe boundary maintained. Alert your buddy.";
            if (scenarioStep == 3) return "Buddy alerted. Now follow the safe exit.";
            return "safe exit selected.";
        }
        if (scenarioStep == 1) return "Exit B selected. Choose the extinguisher.";
        if (scenarioStep == 2) return "Dry powder selected. Pull the safety pin.";
        if (scenarioStep == 3) return "Pin removed. Aim at the base of the fire, not the flames.";
        if (scenarioStep == 4) return "Nozzle aimed. Squeeze the lever to discharge.";
        if (scenarioStep == 5) return "Discharge started. Sweep side to side across the fire base.";
        if (scenarioStep == 6) return "Simulated fire controlled. Leave by Exit B; never re-enter.";
        return "safe route selected.";
    }

    private void restartDrill() {
        drillFinished = false;
        markerPlaced = false;
        placedMarkerCount = 0;
        scenarioStep = 0;
        incorrectChoices = 0;
        feedbackText = "";
        safeDistanceReached = false;
        surfaceView.queueEvent(() -> renderer.resetScene());
        renderTrainingPanel();
    }

    private void emitDrillCompleted() {
        JSONObject event = new JSONObject();
        try {
            event.put("type", "AR_DRILL_COMPLETED");
            event.put("module", module);
            event.put("score", safetyScore());
            event.put("passed", safetyScore() >= PRACTICAL_PASS_SCORE);
        } catch (JSONException ignored) { }
        SurakshaArEvents.emit(this, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        startOrResumeSession();
        if (textToSpeech != null && speechReady) {
            configureSpeechLanguage();
            refreshVoiceStatus();
            speakCurrentGuidance(true);
        }
    }

    private void startOrResumeSession() {
        if (stopped) return;
        if (!ensureArCoreAndCamera()) return;
        try {
            if (session == null) {
                session = new Session(this);
                Config config = new Config(session);
                config.setPlaneFindingMode(Config.PlaneFindingMode.HORIZONTAL);
                // Keep placement usable while ARCore is still learning a low-texture floor.
                // The resulting anchor refines automatically when a horizontal plane is found.
                config.setInstantPlacementMode(Config.InstantPlacementMode.LOCAL_Y_UP);
                session.configure(config);
                renderer.setSession(session);
            }
            session.resume();
            surfaceView.onResume();
            emitTracking("INITIALIZING", null);
        } catch (UnavailableArcoreNotInstalledException | UnavailableApkTooOldException | UnavailableSdkTooOldException error) {
            emitError("Google Play Services for AR needs an update.");
        } catch (UnavailableDeviceNotCompatibleException error) {
            emitTracking("UNSUPPORTED", "This device does not support ARCore.");
        } catch (CameraNotAvailableException error) {
            emitError("Camera unavailable for ARCore.");
        }
    }

    private boolean ensureArCoreAndCamera() {
        try {
            ArCoreApk.InstallStatus installStatus = ArCoreApk.getInstance().requestInstall(this, installRequested);
            if (installStatus == ArCoreApk.InstallStatus.INSTALL_REQUESTED) {
                installRequested = false;
                return false;
            }
        } catch (UnavailableDeviceNotCompatibleException error) {
            emitTracking("UNSUPPORTED", "This device does not support ARCore.");
            return false;
        } catch (UnavailableUserDeclinedInstallationException error) {
            emitTracking("UNSUPPORTED", "Google Play Services for AR installation was declined.");
            return false;
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[] { Manifest.permission.CAMERA }, CAMERA_PERMISSION_REQUEST);
            return false;
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_REQUEST) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startOrResumeSession();
            } else {
                emitError("Camera permission is required for ARCore mode.");
            }
        }
    }

    @Override
    protected void onPause() {
        pauseSession();
        super.onPause();
    }

    private void pauseSession() {
        if (surfaceView != null) surfaceView.onPause();
        if (session != null) session.pause();
        if (!stopped) emitTracking("NOT_TRACKING", "AR session paused.");
    }

    private void stopSession() {
        if (stopped) return;
        stopped = true;
        if (surfaceView != null) surfaceView.onPause();
        if (renderer != null) renderer.clearAnchor();
        if (session != null) {
            session.pause();
            session.close();
            session = null;
        }
        emitTracking("STOPPED", null);
        emitEvent("AR_SESSION_STOPPED", null);
    }

    @Override
    protected void onDestroy() {
        stopSession();
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        try {
            unregisterReceiver(controlReceiver);
        } catch (IllegalArgumentException ignored) { }
        super.onDestroy();
    }

    private void onRendererEvent(String type, String state, String reason, String anchorId) {
        runOnUiThread(() -> {
            if ("AR_TRACKING_STATE_CHANGED".equals(type)) {
                String status = "AR SAFETY PRACTICE\n" + objectLabel + "\n" + state;
                if (reason != null) status += "\n" + reason;
                statusView.setText(status);
            } else if ("AR_PLANE_DETECTED".equals(type)) {
                statusView.setText(placementInstruction());
            } else if ("AR_MARKER_PLACED".equals(type)) {
                placedMarkerCount = Math.min(3, placedMarkerCount + 1);
                markerPlaced = placedMarkerCount == 3;
                if (markerPlaced) {
                    statusView.setText("SCENE MARKED · NOT AUTOMATIC DETECTION\nFire · Extinguisher · Exit B");
                    feedbackText = "Three separate scene points are now anchored to your surroundings.";
                } else {
                    statusView.setText("MARKER " + (placedMarkerCount + 1) + " OF 3\n" + placementInstruction());
                    feedbackText = "Marker " + placedMarkerCount + " anchored. Continue with the next real-world location.";
                }
                renderTrainingPanel();
            } else if ("AR_SAFE_DISTANCE_REACHED".equals(type)) {
                safeDistanceReached = true;
                feedbackText = "Demo movement check complete; you moved back from the decision point.";
                renderTrainingPanel();
            }
        });
        JSONObject event = new JSONObject();
        try {
            event.put("type", type);
            if (state != null) event.put("state", state);
            if (reason != null) event.put("reason", reason);
            if (anchorId != null) event.put("anchorId", anchorId);
        } catch (JSONException ignored) { }
        SurakshaArEvents.emit(this, event);
    }

    private void emitTracking(String state, String reason) {
        onRendererEvent("AR_TRACKING_STATE_CHANGED", state, reason, null);
    }

    private void emitError(String reason) {
        onRendererEvent("AR_TRACKING_STATE_CHANGED", "ERROR", reason, null);
    }

    private void emitEvent(String type, String anchorId) {
        onRendererEvent(type, null, null, anchorId);
    }
}

final class NativeArRenderer implements GLSurfaceView.Renderer {
    interface EventListener {
        void onEvent(String type, String state, String reason, String anchorId);
    }

    private final Context context;
    private final EventListener events;
    private final BackgroundRenderer background = new BackgroundRenderer();
    private final CubeRenderer objectRenderer = new CubeRenderer();
    private Session session;
    private Frame frame;
    private final Anchor[] sceneAnchors = new Anchor[3];
    private final String[] anchorIds = new String[3];
    private int scenarioStep;
    private long scenarioStepChangedAtMs;
    private int width;
    private int height;
    private boolean planeDetected;
    private boolean placementReady;
    private boolean usingInstantPlacement;
    private HitResult placementHit;
    private float placementTargetX;
    private float placementTargetY;
    private String lastTrackingState;
    private float pendingTapX = -1;
    private float pendingTapY = -1;
    private boolean distanceCheckPending;
    private boolean distanceBaselineReady;
    private boolean distanceCheckReported;
    private float baselineX;
    private float baselineZ;
    private final float[] viewMatrix = new float[16];
    private final float[] projectionMatrix = new float[16];
    private final float[] anchorModelMatrix = new float[16];

    private final String module;

    NativeArRenderer(Context context, EventListener events, String module) {
        this.context = context;
        this.events = events;
        this.module = module;
    }

    void setSession(Session session) {
        this.session = session;
    }

    void handleTap(float x, float y) {
        pendingTapX = x;
        pendingTapY = y;
    }

    void beginSafetyDistanceCheck() {
        distanceCheckPending = true;
        distanceBaselineReady = false;
        distanceCheckReported = false;
    }

    void clearAnchor() {
        for (int i = 0; i < sceneAnchors.length; i++) {
            if (sceneAnchors[i] != null) sceneAnchors[i].detach();
            sceneAnchors[i] = null;
            anchorIds[i] = null;
        }
    }

    void resetScene() {
        clearAnchor();
        scenarioStep = 0;
        scenarioStepChangedAtMs = System.currentTimeMillis();
    }

    void setScenarioStep(int step) {
        scenarioStep = step;
        scenarioStepChangedAtMs = System.currentTimeMillis();
    }

    @Override
    public void onSurfaceCreated(GL10 gl, EGLConfig config) {
        GLES20.glClearColor(0f, 0f, 0f, 1f);
        background.createOnGlThread();
        objectRenderer.createOnGlThread();
    }

    @Override
    public void onSurfaceChanged(GL10 gl, int width, int height) {
        this.width = width;
        this.height = height;
        GLES20.glViewport(0, 0, width, height);
    }

    @Override
    public void onDrawFrame(GL10 gl) {
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT | GLES20.GL_DEPTH_BUFFER_BIT);
        if (session == null || width == 0 || height == 0) return;
        try {
            session.setDisplayGeometry(getDisplayRotation(context), width, height);
            session.setCameraTextureName(background.getTextureId());
            frame = session.update();
            background.draw(frame);
            Camera camera = frame.getCamera();
            reportTracking(camera);
            if (camera.getTrackingState() != TrackingState.TRACKING) return;

            updateSafetyDistance(camera);

            updatePlaneState();
            processPendingTap();
            camera.getViewMatrix(viewMatrix, 0);
            camera.getProjectionMatrix(projectionMatrix, 0, 0.1f, 100f);
            boolean anyAnchor = false;
            for (int i = 0; i < sceneAnchors.length; i++) {
                Anchor sceneAnchor = sceneAnchors[i];
                if (sceneAnchor != null) {
                    // Instant-placement anchors can briefly be PAUSED while ARCore resolves the
                    // floor plane. Their last pose remains valid, so keep the training prop
                    // visible instead of making fire/extinguisher/exit vanish mid-scenario.
                    sceneAnchor.getPose().toMatrix(anchorModelMatrix, 0);
                    drawScenarioMarker(i);
                    anyAnchor = true;
                }
            }
            if (nextUnplacedMarker() >= 0 && placementReady && placementHit != null) {
                if (placementHit != null) {
                    placementHit.getHitPose().toMatrix(anchorModelMatrix, 0);
                    drawPlacementReticle();
                }
            }
        } catch (CameraNotAvailableException error) {
            events.onEvent("AR_TRACKING_STATE_CHANGED", "ERROR", "Camera unavailable for ARCore.", null);
        }
    }

    private void drawPlacementReticle() {
        // A bright, solid floor target makes the placement point visible in indoor lighting.
        drawMarker(0f, 0.010f, 0f, 0.25f, 0.012f, 0.25f, 0.08f, 0.92f, 0.58f);
        drawMarker(0f, 0.022f, -0.20f, 0.42f, 0.030f, 0.040f, 0.03f, 1.00f, 0.50f);
        drawMarker(0f, 0.022f, 0.20f, 0.42f, 0.030f, 0.040f, 0.03f, 1.00f, 0.50f);
        drawMarker(-0.20f, 0.022f, 0f, 0.040f, 0.030f, 0.42f, 0.03f, 1.00f, 0.50f);
        drawMarker(0.20f, 0.022f, 0f, 0.040f, 0.030f, 0.42f, 0.03f, 1.00f, 0.50f);
        drawMarker(0f, 0.035f, 0f, 0.075f, 0.035f, 0.075f, 1.00f, 1.00f, 1.00f);
    }

    private void updateSafetyDistance(Camera camera) {
        if (!"gas".equals(module) || distanceCheckReported) return;
        float[] position = camera.getPose().getTranslation();
        if (distanceCheckPending) {
            baselineX = position[0];
            baselineZ = position[2];
            distanceBaselineReady = true;
            distanceCheckPending = false;
            return;
        }
        if (!distanceBaselineReady) return;
        float dx = position[0] - baselineX;
        float dz = position[2] - baselineZ;
        if ((dx * dx) + (dz * dz) >= 0.64f) {
            distanceCheckReported = true;
            events.onEvent("AR_SAFE_DISTANCE_REACHED", "CHECKED", "Demo horizontal movement threshold reached.", null);
        }
    }

    private void reportTracking(Camera camera) {
        String state;
        String reason = null;
        if (camera.getTrackingState() == TrackingState.TRACKING) {
            state = "TRACKING";
        } else if (camera.getTrackingState() == TrackingState.PAUSED) {
            state = "LIMITED";
            reason = camera.getTrackingFailureReason().name();
        } else {
            state = "NOT_TRACKING";
        }
        String signature = state + ":" + (reason == null ? "" : reason);
        if (!signature.equals(lastTrackingState)) {
            lastTrackingState = signature;
            events.onEvent("AR_TRACKING_STATE_CHANGED", state, reason, null);
        }
    }

    private void updatePlaneState() {
        boolean horizontalPlaneTracking = false;
        for (Plane plane : frame.getUpdatedTrackables(Plane.class)) {
            if (plane.getType() == Plane.Type.HORIZONTAL_UPWARD_FACING && plane.getTrackingState() == TrackingState.TRACKING) {
                horizontalPlaneTracking = true;
                break;
            }
        }
        if (horizontalPlaneTracking && !planeDetected) {
            planeDetected = true;
            events.onEvent("AR_PLANE_DETECTED", "HORIZONTAL", null, null);
        }
        placementHit = findPlacementHit();
        placementReady = placementHit != null;
    }

    /**
     * Floors usually occupy the lower half of the preview, not its exact centre. Probe a small
     * lower-screen grid and remember the on-screen point that produced the green target.
     */
    private HitResult findPlacementHit() {
        if (frame == null) return null;
        float[][] probes = {
            {0.50f, 0.68f}, {0.50f, 0.78f}, {0.50f, 0.58f},
            {0.38f, 0.70f}, {0.62f, 0.70f}, {0.50f, 0.50f}
        };
        for (float[] probe : probes) {
            float probeX = width * probe[0];
            float probeY = height * probe[1];
            for (HitResult hit : frame.hitTest(probeX, probeY)) {
                if (isHorizontalPlaneHit(hit)) {
                    placementTargetX = probeX;
                    placementTargetY = probeY;
                    usingInstantPlacement = false;
                    return hit;
                }
            }
        }
        // ARCore instant placement is a tracking anchor, not a fake 2D overlay. It lets the
        // worker place a target on a plain/low-light floor, then improves its pose as ARCore
        // recognizes the real horizontal plane.
        for (float[] probe : probes) {
            float probeX = width * probe[0];
            float probeY = height * probe[1];
            for (HitResult hit : frame.hitTestInstantPlacement(probeX, probeY, 1.5f)) {
                if (isInstantPlacementHit(hit)) {
                    placementTargetX = probeX;
                    placementTargetY = probeY;
                    usingInstantPlacement = true;
                    return hit;
                }
            }
        }
        usingInstantPlacement = false;
        return null;
    }

    private void processPendingTap() {
        if (pendingTapX < 0 || pendingTapY < 0) return;
        final float tapX = pendingTapX;
        final float tapY = pendingTapY;
        pendingTapX = -1;
        pendingTapY = -1;

        for (int i = 0; i < sceneAnchors.length; i++) {
            if (sceneAnchors[i] != null && isTapOnAnchoredObject(sceneAnchors[i], tapX, tapY)) {
                events.onEvent("AR_OBJECT_TAPPED", "" + i, null, anchorIds[i]);
                return;
            }
        }
        for (HitResult hit : frame.hitTest(tapX, tapY)) {
            if (!isHorizontalPlaneHit(hit)) continue;
            placeMarker(hit);
            return;
        }
        for (HitResult hit : frame.hitTestInstantPlacement(tapX, tapY, 1.5f)) {
            if (!isInstantPlacementHit(hit)) continue;
            placeMarker(hit);
            return;
        }
        // When the worker taps the visible green target, use its proven plane hit even if the
        // release point moved a few pixels between touch down and touch up.
        float dx = tapX - placementTargetX;
        float dy = tapY - placementTargetY;
        if (placementHit != null && placementReady && (dx * dx + dy * dy) <= 150f * 150f) {
            placeMarker(placementHit);
        }
    }

    private void placeMarker(HitResult hit) {
        int markerIndex = nextUnplacedMarker();
        if (markerIndex < 0) return;
        sceneAnchors[markerIndex] = hit.createAnchor();
        anchorIds[markerIndex] = UUID.randomUUID().toString();
        events.onEvent("AR_MARKER_PLACED", "" + markerIndex, null, anchorIds[markerIndex]);
    }

    private int nextUnplacedMarker() {
        for (int i = 0; i < sceneAnchors.length; i++) if (sceneAnchors[i] == null) return i;
        return -1;
    }

    private boolean isHorizontalPlaneHit(HitResult hit) {
        if (!(hit.getTrackable() instanceof Plane)) return false;
        Plane plane = (Plane) hit.getTrackable();
        return plane.getType() == Plane.Type.HORIZONTAL_UPWARD_FACING
            && plane.getTrackingState() == TrackingState.TRACKING
            && plane.isPoseInPolygon(hit.getHitPose());
    }

    private boolean isInstantPlacementHit(HitResult hit) {
        return hit.getTrackable() instanceof InstantPlacementPoint
            && hit.getTrackable().getTrackingState() == TrackingState.TRACKING;
    }

    private boolean isTapOnAnchoredObject(Anchor targetAnchor, float tapX, float tapY) {
        if (targetAnchor.getTrackingState() != TrackingState.TRACKING || width == 0 || height == 0) return false;
        float[] model = new float[16];
        targetAnchor.getPose().toMatrix(model, 0);
        Matrix.translateM(model, 0, 0f, 0.12f, 0f);
        float[] worldCenter = new float[4];
        Matrix.multiplyMV(worldCenter, 0, model, 0, new float[] { 0f, 0f, 0f, 1f }, 0);
        float[] viewCenter = new float[4];
        Matrix.multiplyMV(viewCenter, 0, viewMatrix, 0, worldCenter, 0);
        float[] clipCenter = new float[4];
        Matrix.multiplyMV(clipCenter, 0, projectionMatrix, 0, viewCenter, 0);
        if (clipCenter[3] <= 0f) return false;
        float objectX = (clipCenter[0] / clipCenter[3] + 1f) * 0.5f * width;
        float objectY = (1f - clipCenter[1] / clipCenter[3]) * 0.5f * height;
        float dx = tapX - objectX;
        float dy = tapY - objectY;
        return (dx * dx) + (dy * dy) <= 72f * 72f;
    }

    /** Each scene prop has its own ARCore world anchor at the worker-selected physical location. */
    private void drawScenarioMarker(int markerIndex) {
        if ("gas".equals(module)) {
            if (markerIndex == 0) {
                drawPrimitive(0f, 0.12f, 0f, 0.76f, 0.11f, 0.11f, 0.42f, 0.48f, 0.55f, CubeRenderer.CYLINDER, 90f, 0f, 0f, 1f);
                drawPrimitive(0f, 0.30f, 0f, 0.16f, 0.24f, 0.16f, 0.15f, 0.82f, 0.75f, CubeRenderer.CONE, 0f, 0f, 0f, 1f);
            } else if (markerIndex == 1) {
                drawMarker(0f, 0.012f, 0f, 0.72f, 0.018f, 0.72f, 0.96f, 0.72f, 0.12f);
                drawMarker(0f, 0.013f, 0f, 0.018f, 0.018f, 0.72f, 0.96f, 0.72f, 0.12f);
            } else {
                orientExitArrowTowardHazard();
                drawExitArrow(0f, 0f);
            }
        } else if ("machinery".equals(module)) {
            if (markerIndex == 0) drawMarker(0f, 0.13f, 0f, 0.28f, 0.26f, 0.28f, 0.10f, 0.42f, 0.88f);
            else if (markerIndex == 1) drawMarker(0f, 0.012f, 0f, 0.72f, 0.018f, 0.72f, 0.96f, 0.72f, 0.12f);
            else drawExitArrow(0f, 0f);
        } else {
            if (markerIndex == 0) {
                drawFireFlame();
            } else if (markerIndex == 1) {
                drawExtinguisher(0f, 0f);
                if (scenarioStep == 3 || scenarioStep == 4) {
                    drawAimGuide();
                } else if (scenarioStep == 5 || (scenarioStep == 6 && System.currentTimeMillis() - scenarioStepChangedAtMs < 1400)) {
                    drawPowderSpray();
                }
            } else {
                orientExitArrowTowardHazard();
                drawExitArrow(0f, 0f);
            }
        }
    }

    private void drawFireFlame() {
        if (scenarioStep >= 7) return;
        float time = System.currentTimeMillis() * 0.001f;
        float dying = scenarioStep == 6 ? 0.36f : 1f;
        float flickerX = 1f + 0.055f * (float) Math.sin(time * 8.3f);
        float flickerY = 1f + 0.075f * (float) Math.sin(time * 11.1f + 0.7f);
        drawPrimitive(0f, 0.23f * dying, 0f, 0.42f * flickerX * dying, 0.46f * flickerY * dying, 0.045f, 0.72f, 0.055f, 0.018f, CubeRenderer.FLAME, 0f, 0f, 0f, 1f);
        drawPrimitive(0.015f, 0.20f * dying, 0.012f, 0.30f * flickerX * dying, 0.38f * flickerY * dying, 0.055f, 1f, 0.27f, 0.025f, CubeRenderer.FLAME, 0f, 0f, 0f, 1f);
        drawPrimitive(-0.012f, 0.15f * dying, 0.026f, 0.15f * flickerX * dying, 0.24f * flickerY * dying, 0.065f, 1f, 0.78f, 0.16f, CubeRenderer.FLAME, 0f, 0f, 0f, 1f);
    }

    private boolean fireBaseInExtinguisherSpace(float[] targetLocal) {
        if (sceneAnchors[0] == null || sceneAnchors[1] == null
            || sceneAnchors[0].getTrackingState() != TrackingState.TRACKING
            || sceneAnchors[1].getTrackingState() != TrackingState.TRACKING) return false;
        float[] fireWorld = sceneAnchors[0].getPose().getTranslation();
        float[] inverseExtinguisher = new float[16];
        if (!Matrix.invertM(inverseExtinguisher, 0, anchorModelMatrix, 0)) return false;
        float[] firePoint = {fireWorld[0], fireWorld[1] + 0.035f, fireWorld[2], 1f};
        Matrix.multiplyMV(targetLocal, 0, inverseExtinguisher, 0, firePoint, 0);
        return true;
    }

    private float[] nozzleStart() { return new float[] {0.105f, 0.22f, -0.01f}; }

    private float[] directionToFireBase(float[] target) {
        float[] start = nozzleStart();
        float dx = target[0] - start[0];
        float dy = target[1] - start[1];
        float dz = target[2] - start[2];
        float length = (float) Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (length < 0.001f) return new float[] {0f, -0.7f, -0.7f};
        return new float[] {dx / length, dy / length, dz / length};
    }

    private void drawLocalCylinderBetween(float[] start, float[] end, float radius, float red, float green, float blue) {
        float dx = end[0] - start[0];
        float dy = end[1] - start[1];
        float dz = end[2] - start[2];
        float length = (float) Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (length < 0.001f) return;
        float[] model = new float[16];
        System.arraycopy(anchorModelMatrix, 0, model, 0, 16);
        Matrix.translateM(model, 0, (start[0] + end[0]) * 0.5f, (start[1] + end[1]) * 0.5f, (start[2] + end[2]) * 0.5f);
        float axisX = dz;
        float axisZ = -dx;
        float axisLength = (float) Math.sqrt(axisX * axisX + axisZ * axisZ);
        if (axisLength > 0.001f) {
            float angle = (float) Math.toDegrees(Math.acos(Math.max(-1f, Math.min(1f, dy / length))));
            Matrix.rotateM(model, 0, angle, axisX / axisLength, 0f, axisZ / axisLength);
        }
        Matrix.scaleM(model, 0, radius, length, radius);
        objectRenderer.drawShape(viewMatrix, projectionMatrix, model, red, green, blue, CubeRenderer.CYLINDER);
    }

    private void aimNozzleAtFireBase() {
        float[] target = new float[4];
        if (!fireBaseInExtinguisherSpace(target)) return;
        float[] start = nozzleStart();
        float[] dir = directionToFireBase(target);
        float[] tip = {start[0] + dir[0] * 0.15f, start[1] + dir[1] * 0.15f, start[2] + dir[2] * 0.15f};
        drawLocalCylinderBetween(start, tip, 0.022f, 0.12f, 0.13f, 0.14f);
    }

    private void drawAimGuide() {
        float[] target = new float[4];
        if (!fireBaseInExtinguisherSpace(target)) return;
        float[] start = nozzleStart();
        for (int i = 1; i <= 12; i++) {
            float t = i / 13f;
            float size = 0.022f - 0.008f * t;
            drawPrimitive(start[0] + (target[0] - start[0]) * t,
                start[1] + (target[1] - start[1]) * t,
                start[2] + (target[2] - start[2]) * t,
                size, size, size, 1f, 0.76f, 0.16f, CubeRenderer.CYLINDER, 0f, 0f, 0f, 1f);
        }
    }

    private void drawPowderSpray() {
        float[] target = new float[4];
        if (!fireBaseInExtinguisherSpace(target)) return;
        float[] start = nozzleStart();
        float[] delta = {target[0] - start[0], target[1] - start[1], target[2] - start[2]};
        float horizontal = (float) Math.sqrt(delta[0] * delta[0] + delta[2] * delta[2]);
        float perpendicularX = horizontal > 0.001f ? -delta[2] / horizontal : 1f;
        float perpendicularZ = horizontal > 0.001f ? delta[0] / horizontal : 0f;
        float time = System.currentTimeMillis() * 0.001f;
        boolean sweeping = scenarioStep >= 5;
        float sweep = sweeping ? 0.11f * (float) Math.sin(time * 3.6f) : 0f;
        for (int i = 0; i < 26; i++) {
            float t = (i / 26f + time * 0.78f) % 1f;
            float spread = 0.012f + t * 0.07f;
            float jitterX = (float) Math.sin(i * 8.17f + time * 9f) * spread;
            float jitterY = (float) Math.cos(i * 6.21f + time * 7f) * spread * 0.65f;
            float size = 0.018f + 0.018f * t;
            drawPrimitive(start[0] + delta[0] * t + perpendicularX * (jitterX + sweep * t),
                start[1] + delta[1] * t + jitterY,
                start[2] + delta[2] * t + perpendicularZ * (jitterX + sweep * t),
                size, size * 1.35f, size,
                i % 4 == 0 ? 0.98f : 0.88f, i % 4 == 0 ? 0.96f : 0.86f, i % 4 == 0 ? 0.82f : 0.62f,
                CubeRenderer.CYLINDER, 0f, 0f, 0f, 1f);
        }
    }

    private void orientExitArrowTowardHazard() {
        if (sceneAnchors[0] == null || sceneAnchors[2] == null) return;
        float[] hazard = sceneAnchors[0].getPose().getTranslation();
        float[] exit = sceneAnchors[2].getPose().getTranslation();
        float dx = exit[0] - hazard[0];
        float dz = exit[2] - hazard[2];
        float yawDegrees = (float) Math.toDegrees(Math.atan2(-dx, -dz));
        Matrix.setIdentityM(anchorModelMatrix, 0);
        Matrix.translateM(anchorModelMatrix, 0, exit[0], exit[1], exit[2]);
        Matrix.rotateM(anchorModelMatrix, 0, yawDegrees, 0f, 1f, 0f);
    }

    private void drawExtinguisher(float x, float z) {
        // Red steel cylinder with shoulder, neck, black valve, squeeze lever, hose and nozzle.
        drawPrimitive(x, 0.22f, z, 0.18f, 0.44f, 0.18f, 0.86f, 0.08f, 0.07f, CubeRenderer.CYLINDER, 0f, 0f, 0f, 1f);
        drawPrimitive(x, 0.44f, z, 0.15f, 0.10f, 0.15f, 0.92f, 0.12f, 0.09f, CubeRenderer.CONE, 0f, 0f, 0f, 1f);
        drawPrimitive(x, 0.51f, z, 0.075f, 0.09f, 0.075f, 0.16f, 0.18f, 0.20f, CubeRenderer.CYLINDER, 0f, 0f, 0f, 1f);
        drawMarker(x, scenarioStep >= 5 ? 0.55f : 0.58f, z, 0.24f, 0.035f, 0.055f, 0.12f, 0.14f, 0.16f); // squeeze lever moves when discharged
        if (scenarioStep < 3) drawMarker(x - 0.055f, 0.54f, z, 0.035f, 0.09f, 0.035f, 0.98f, 0.82f, 0.18f); // removable pin
        drawMarker(x + 0.09f, 0.53f, z, 0.035f, 0.16f, 0.035f, 0.12f, 0.14f, 0.16f); // handle
        drawPrimitive(x + 0.105f, 0.30f, z, 0.035f, 0.31f, 0.035f, 0.08f, 0.09f, 0.10f, CubeRenderer.CYLINDER, 0f, 0f, 0f, 1f); // hose
        if (scenarioStep >= 3 && "fire".equals(module)) {
            aimNozzleAtFireBase();
        } else {
            drawPrimitive(x + 0.105f, 0.15f, z - 0.035f, 0.045f, 0.07f, 0.045f, 0.08f, 0.09f, 0.10f, CubeRenderer.CYLINDER, 28f, 0f, 0f, 1f); // nozzle
        }
        drawPrimitive(x, 0.018f, z, 0.21f, 0.035f, 0.21f, 0.13f, 0.14f, 0.16f, CubeRenderer.CYLINDER, 0f, 0f, 0f, 1f); // base
        drawMarker(x, 0.28f, z + 0.093f, 0.08f, 0.20f, 0.012f, 0.98f, 0.82f, 0.18f); // label plate
    }

    private void drawExitArrow(float x, float z) {
        // Flat, readable floor arrow: shaft plus two diagonal arrowhead arms.
        drawMarker(x, 0.018f, z + 0.04f, 0.11f, 0.02f, 0.60f, 0.08f, 0.84f, 0.50f);
        float[] model = new float[16];
        System.arraycopy(anchorModelMatrix, 0, model, 0, 16);
        Matrix.translateM(model, 0, x - 0.075f, 0.019f, z - 0.18f);
        Matrix.rotateM(model, 0, -35f, 0f, 1f, 0f);
        Matrix.scaleM(model, 0, 0.075f, 0.02f, 0.30f);
        objectRenderer.draw(viewMatrix, projectionMatrix, model, 0.08f, 0.84f, 0.50f);
        System.arraycopy(anchorModelMatrix, 0, model, 0, 16);
        Matrix.translateM(model, 0, x + 0.075f, 0.019f, z - 0.18f);
        Matrix.rotateM(model, 0, 35f, 0f, 1f, 0f);
        Matrix.scaleM(model, 0, 0.075f, 0.02f, 0.30f);
        objectRenderer.draw(viewMatrix, projectionMatrix, model, 0.08f, 0.84f, 0.50f);
    }

    private void drawPrimitive(float x, float y, float z, float sx, float sy, float sz,
                               float r, float g, float b, int shape, float angle, float ax, float ay, float az) {
        float[] model = new float[16];
        System.arraycopy(anchorModelMatrix, 0, model, 0, 16);
        Matrix.translateM(model, 0, x, y, z);
        if (angle != 0f) Matrix.rotateM(model, 0, angle, ax, ay, az);
        Matrix.scaleM(model, 0, sx, sy, sz);
        objectRenderer.drawShape(viewMatrix, projectionMatrix, model, r, g, b, shape);
    }

    private void drawMarker(float x, float y, float z, float scaleX, float scaleY, float scaleZ, float r, float g, float b) {
        float[] markerMatrix = new float[16];
        System.arraycopy(anchorModelMatrix, 0, markerMatrix, 0, 16);
        Matrix.translateM(markerMatrix, 0, x, y, z);
        Matrix.scaleM(markerMatrix, 0, scaleX, scaleY, scaleZ);
        objectRenderer.draw(viewMatrix, projectionMatrix, markerMatrix, r, g, b);
    }

    private static int getDisplayRotation(Context context) {
        return ((android.view.WindowManager) context.getSystemService(Context.WINDOW_SERVICE)).getDefaultDisplay().getRotation();
    }

    private static final class PoseHolder {
        private final HitResult hit;
        PoseHolder(HitResult hit) { this.hit = hit; }
        void toMatrix(float[] matrix) { hit.getHitPose().toMatrix(matrix, 0); }
    }
}

final class BackgroundRenderer {
    private static final float[] QUAD_COORDS = { -1f, -1f, 1f, -1f, -1f, 1f, 1f, 1f };
    private final float[] transformedUv = new float[8];
    private FloatBuffer quadBuffer;
    private FloatBuffer uvBuffer;
    private int program;
    private int textureId = -1;

    void createOnGlThread() {
        int[] textures = new int[1];
        GLES20.glGenTextures(1, textures, 0);
        textureId = textures[0];
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId);
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE);
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE);
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR);
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR);
        quadBuffer = GlBuffers.floats(QUAD_COORDS);
        uvBuffer = GlBuffers.floats(transformedUv);
        program = GlPrograms.create(
            "attribute vec4 a_Position; attribute vec2 a_TexCoord; varying vec2 v_TexCoord; void main(){ gl_Position=a_Position; v_TexCoord=a_TexCoord; }",
            "#extension GL_OES_EGL_image_external : require\nprecision mediump float; varying vec2 v_TexCoord; uniform samplerExternalOES sTexture; void main(){ gl_FragColor=texture2D(sTexture,v_TexCoord); }");
    }

    int getTextureId() { return textureId; }

    void draw(Frame frame) {
        frame.transformCoordinates2d(com.google.ar.core.Coordinates2d.OPENGL_NORMALIZED_DEVICE_COORDINATES, QUAD_COORDS,
            com.google.ar.core.Coordinates2d.TEXTURE_NORMALIZED, transformedUv);
        uvBuffer.position(0);
        uvBuffer.put(transformedUv).position(0);
        GLES20.glDisable(GLES20.GL_DEPTH_TEST);
        GLES20.glUseProgram(program);
        int position = GLES20.glGetAttribLocation(program, "a_Position");
        int texture = GLES20.glGetAttribLocation(program, "a_TexCoord");
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0);
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId);
        GLES20.glUniform1i(GLES20.glGetUniformLocation(program, "sTexture"), 0);
        GLES20.glEnableVertexAttribArray(position);
        GLES20.glVertexAttribPointer(position, 2, GLES20.GL_FLOAT, false, 0, quadBuffer);
        GLES20.glEnableVertexAttribArray(texture);
        GLES20.glVertexAttribPointer(texture, 2, GLES20.GL_FLOAT, false, 0, uvBuffer);
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4);
        GLES20.glDisableVertexAttribArray(position);
        GLES20.glDisableVertexAttribArray(texture);
    }
}

final class CubeRenderer {
    static final int BOX = 0;
    static final int CYLINDER = 1;
    static final int CONE = 2;
    static final int FLAME = 3;
    private static final float[] CUBE = {
        -0.5f,-0.5f, 0.5f,  0.5f,-0.5f, 0.5f,  0.5f, 0.5f, 0.5f, -0.5f,-0.5f, 0.5f,  0.5f, 0.5f, 0.5f, -0.5f, 0.5f, 0.5f,
        -0.5f,-0.5f,-0.5f, -0.5f, 0.5f,-0.5f,  0.5f, 0.5f,-0.5f, -0.5f,-0.5f,-0.5f,  0.5f, 0.5f,-0.5f, 0.5f,-0.5f,-0.5f,
        -0.5f, 0.5f,-0.5f, -0.5f, 0.5f, 0.5f,  0.5f, 0.5f, 0.5f, -0.5f, 0.5f,-0.5f,  0.5f, 0.5f, 0.5f, 0.5f, 0.5f,-0.5f,
        -0.5f,-0.5f,-0.5f,  0.5f,-0.5f,-0.5f, 0.5f,-0.5f, 0.5f, -0.5f,-0.5f,-0.5f,  0.5f,-0.5f, 0.5f,-0.5f,-0.5f, 0.5f,
         0.5f,-0.5f,-0.5f,  0.5f, 0.5f,-0.5f, 0.5f, 0.5f, 0.5f,  0.5f,-0.5f,-0.5f, 0.5f, 0.5f, 0.5f, 0.5f,-0.5f, 0.5f,
        -0.5f,-0.5f,-0.5f, -0.5f,-0.5f, 0.5f,-0.5f, 0.5f, 0.5f, -0.5f,-0.5f,-0.5f,-0.5f, 0.5f, 0.5f,-0.5f, 0.5f,-0.5f
    };
    private FloatBuffer vertices;
    private FloatBuffer cylinderVertices;
    private FloatBuffer coneVertices;
    private FloatBuffer flameVertices;
    private int program;
    private final float[] mvp = new float[16];

    void createOnGlThread() {
        vertices = GlBuffers.floats(CUBE);
        cylinderVertices = GlBuffers.floats(radialMesh(24, false));
        coneVertices = GlBuffers.floats(radialMesh(24, true));
        flameVertices = GlBuffers.floats(flameMesh());
        program = GlPrograms.create(
            "uniform mat4 u_Mvp; attribute vec4 a_Position; void main(){ gl_Position=u_Mvp*a_Position; }",
            "precision mediump float; uniform vec4 u_Color; void main(){ gl_FragColor=u_Color; }");
    }

    void draw(float[] view, float[] projection, float[] model, float r, float g, float b) {
        drawShape(view, projection, model, r, g, b, BOX);
    }

    void drawShape(float[] view, float[] projection, float[] model, float r, float g, float b, int shape) {
        float[] viewModel = new float[16];
        Matrix.multiplyMM(viewModel, 0, view, 0, model, 0);
        Matrix.multiplyMM(mvp, 0, projection, 0, viewModel, 0);
        GLES20.glEnable(GLES20.GL_DEPTH_TEST);
        GLES20.glUseProgram(program);
        GLES20.glUniformMatrix4fv(GLES20.glGetUniformLocation(program, "u_Mvp"), 1, false, mvp, 0);
        GLES20.glUniform4f(GLES20.glGetUniformLocation(program, "u_Color"), r, g, b, 1f);
        int position = GLES20.glGetAttribLocation(program, "a_Position");
        GLES20.glEnableVertexAttribArray(position);
        FloatBuffer geometry = shape == CYLINDER ? cylinderVertices : shape == CONE ? coneVertices : shape == FLAME ? flameVertices : vertices;
        int count = shape == CYLINDER ? 24 * 12 : shape == CONE ? 24 * 6 : shape == FLAME ? flameVertices.limit() / 3 : 36;
        GLES20.glVertexAttribPointer(position, 3, GLES20.GL_FLOAT, false, 0, geometry);
        GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, count);
        GLES20.glDisableVertexAttribArray(position);
    }

    private static float[] radialMesh(int segments, boolean cone) {
        ArrayList<Float> values = new ArrayList<>();
        for (int i = 0; i < segments; i++) {
            double a0 = (2.0 * Math.PI * i) / segments;
            double a1 = (2.0 * Math.PI * (i + 1)) / segments;
            float x0 = (float) Math.cos(a0) * 0.5f;
            float z0 = (float) Math.sin(a0) * 0.5f;
            float x1 = (float) Math.cos(a1) * 0.5f;
            float z1 = (float) Math.sin(a1) * 0.5f;
            if (cone) {
                vertex(values, x0, -0.5f, z0); vertex(values, 0f, 0.5f, 0f); vertex(values, x1, -0.5f, z1);
                vertex(values, 0f, -0.5f, 0f); vertex(values, x1, -0.5f, z1); vertex(values, x0, -0.5f, z0);
            } else {
                vertex(values, x0, -0.5f, z0); vertex(values, x1, -0.5f, z1); vertex(values, x1, 0.5f, z1);
                vertex(values, x0, -0.5f, z0); vertex(values, x1, 0.5f, z1); vertex(values, x0, 0.5f, z0);
                vertex(values, 0f, 0.5f, 0f); vertex(values, x1, 0.5f, z1); vertex(values, x0, 0.5f, z0);
                vertex(values, 0f, -0.5f, 0f); vertex(values, x0, -0.5f, z0); vertex(values, x1, -0.5f, z1);
            }
        }
        float[] result = new float[values.size()];
        for (int i = 0; i < values.size(); i++) result[i] = values.get(i);
        return result;
    }

    /** Flat, irregular fire silhouette; stacked, animated layers create a legible flame instead of a cone. */
    private static float[] flameMesh() {
        float[][] outline = {
            {0.00f,-0.50f}, {-0.34f,-0.49f}, {-0.48f,-0.25f}, {-0.38f,-0.06f},
            {-0.45f,0.12f}, {-0.24f,0.06f}, {-0.14f,0.34f}, {-0.025f,0.12f},
            {0.13f,0.50f}, {0.17f,0.14f}, {0.38f,0.31f}, {0.31f,0.04f},
            {0.48f,-0.22f}, {0.34f,-0.48f}
        };
        ArrayList<Float> values = new ArrayList<>();
        for (int i = 0; i < outline.length; i++) {
            float[] a = outline[i];
            float[] b = outline[(i + 1) % outline.length];
            vertex(values, 0f, -0.20f, 0f); vertex(values, a[0], a[1], 0f); vertex(values, b[0], b[1], 0f);
            vertex(values, 0f, -0.20f, 0f); vertex(values, b[0], b[1], 0f); vertex(values, a[0], a[1], 0f);
        }
        float[] result = new float[values.size()];
        for (int i = 0; i < values.size(); i++) result[i] = values.get(i);
        return result;
    }

    private static void vertex(ArrayList<Float> values, float x, float y, float z) {
        values.add(x); values.add(y); values.add(z);
    }
}

final class GlBuffers {
    private GlBuffers() { }
    static FloatBuffer floats(float[] values) {
        FloatBuffer buffer = ByteBuffer.allocateDirect(values.length * 4).order(ByteOrder.nativeOrder()).asFloatBuffer();
        buffer.put(values).position(0);
        return buffer;
    }
}

final class GlPrograms {
    private GlPrograms() { }
    static int create(String vertex, String fragment) {
        int vertexShader = compile(GLES20.GL_VERTEX_SHADER, vertex);
        int fragmentShader = compile(GLES20.GL_FRAGMENT_SHADER, fragment);
        int program = GLES20.glCreateProgram();
        GLES20.glAttachShader(program, vertexShader);
        GLES20.glAttachShader(program, fragmentShader);
        GLES20.glLinkProgram(program);
        return program;
    }
    private static int compile(int type, String source) {
        int shader = GLES20.glCreateShader(type);
        GLES20.glShaderSource(shader, source);
        GLES20.glCompileShader(shader);
        return shader;
    }
}
