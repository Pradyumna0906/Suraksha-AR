package in.gov.jharkhand.surakshaar.ar;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.ar.core.ArCoreApk;
import org.json.JSONException;
import org.json.JSONObject;

/** Capacitor control and event bridge; AR rendering is owned by NativeArActivity. */
@CapacitorPlugin(name = "SurakshaAr")
public class SurakshaArPlugin extends Plugin {
    private final BroadcastReceiver arEventReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String rawEvent = intent.getStringExtra(SurakshaArEvents.EXTRA_EVENT);
            if (rawEvent == null) return;
            try {
                notifyListeners("arEvent", new JSObject(rawEvent), true);
            } catch (JSONException ignored) {
                // A malformed native event must never be exposed as a fabricated AR status.
            }
        }
    };

    @Override
    public void load() {
        IntentFilter filter = new IntentFilter(SurakshaArEvents.ACTION_EVENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getContext().registerReceiver(arEventReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(arEventReceiver, filter);
        }
    }

    @Override
    protected void handleOnDestroy() {
        try {
            getContext().unregisterReceiver(arEventReceiver);
        } catch (IllegalArgumentException ignored) {
            // The activity can be torn down before plugin registration completes.
        }
    }

    @PluginMethod
    public void getCapabilities(PluginCall call) {
        ArCoreApk.Availability availability = ArCoreApk.getInstance().checkAvailability(getContext());
        JSObject result = new JSObject();
        result.put("availability", availability.name());
        result.put("supported", availability.isSupported());
        result.put("needsInstall", availability == ArCoreApk.Availability.SUPPORTED_NOT_INSTALLED
            || availability == ArCoreApk.Availability.SUPPORTED_APK_TOO_OLD);
        call.resolve(result);
    }

    @PluginMethod
    public void startAR(PluginCall call) {
        Intent intent = new Intent(getActivity(), NativeArActivity.class);
        intent.putExtra(NativeArActivity.EXTRA_MODULE, call.getString("module", "fire"));
        intent.putExtra(NativeArActivity.EXTRA_OBJECT_LABEL, call.getString("objectLabel", "Training object"));
        intent.putExtra(NativeArActivity.EXTRA_LANGUAGE, call.getString("language", "hi"));
        getActivity().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void stopAR(PluginCall call) {
        getContext().sendBroadcast(new Intent(SurakshaArEvents.ACTION_STOP).setPackage(getContext().getPackageName()));
        call.resolve();
    }

    @PluginMethod
    public void pauseAR(PluginCall call) {
        getContext().sendBroadcast(new Intent(SurakshaArEvents.ACTION_PAUSE).setPackage(getContext().getPackageName()));
        call.resolve();
    }

    @PluginMethod
    public void resumeAR(PluginCall call) {
        getContext().sendBroadcast(new Intent(SurakshaArEvents.ACTION_RESUME).setPackage(getContext().getPackageName()));
        call.resolve();
    }
}
