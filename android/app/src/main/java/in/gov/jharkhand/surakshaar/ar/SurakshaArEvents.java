package in.gov.jharkhand.surakshaar.ar;

import android.content.Context;
import android.content.Intent;
import org.json.JSONObject;

/** A deliberately small event contract between the AR activity and Capacitor. */
public final class SurakshaArEvents {
    public static final String ACTION_EVENT = "in.gov.jharkhand.surakshaar.AR_EVENT";
    public static final String ACTION_STOP = "in.gov.jharkhand.surakshaar.AR_STOP";
    public static final String ACTION_PAUSE = "in.gov.jharkhand.surakshaar.AR_PAUSE";
    public static final String ACTION_RESUME = "in.gov.jharkhand.surakshaar.AR_RESUME";
    public static final String EXTRA_EVENT = "event";

    private SurakshaArEvents() { }

    public static void emit(Context context, JSONObject event) {
        Intent intent = new Intent(ACTION_EVENT).setPackage(context.getPackageName());
        intent.putExtra(EXTRA_EVENT, event.toString());
        context.sendBroadcast(intent);
    }
}
