package in.gov.jharkhand.surakshaar;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import in.gov.jharkhand.surakshaar.ar.SurakshaArPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SurakshaArPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
