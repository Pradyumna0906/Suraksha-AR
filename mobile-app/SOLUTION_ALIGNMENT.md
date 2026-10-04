# SurakshaAR — SIH26041 Solution Alignment

## Product position

SurakshaAR is an offline-first Android safety-learning prototype for new mining, steel, and mica-sector workers in Jharkhand. It uses a phone camera and Three.js overlays rather than a headset, so training can be demonstrated on Android 10+ devices.

The product is a training and competency-record prototype. It does not claim to issue DGMS certificates, contact emergency services, or replace site-specific statutory training and supervision.

## Requirement-to-feature map

| Problem-statement need | Product implementation | Demo proof |
| --- | --- | --- |
| Phone-based AR on Android 10+ | Capacitor Android wrapper, camera feed, virtual 3D fallback | Open AR Training on an Android phone; deny camera permission and show virtual fallback |
| Fire & explosion response | P.A.S.S. sequence, extinguisher selection, evacuation learning prompt | Complete Pull, Aim, Squeeze, Sweep in order |
| Gas & confined space protocol | Gas calibration, SCBA selection, power isolation, 3-tug buddy signal | Complete all four gas actions in order |
| Machinery safety | Danger-zone marking, breaker isolation, LOTO lock, zero-energy test | Complete the four LOTO actions in order |
| PPE and hazard awareness | 3D Gear Sandbox and Hazard Spotter routes | Identify gear and unsafe conditions before a shift |
| Hindi and Santali accessibility | Hindi, English, and Santali UI with Web Speech narration | Switch language and replay an instruction |
| Competency, not attendance | Assessment unlocks only after Fire and Gas practical drills | Show locked quiz, then unlock it after both drills |
| Offline function | Local training content, local roster, QR record and Preferences storage | Turn off network after loading; complete and verify a local record |
| Dashboard | Local roster, search/filter, CSV/PDF audit exports and record verification | Open dashboard and verify a generated record |

## Training pathway used in the demo

1. Select a worker and language.
2. Complete the Fire & Explosion Response practical drill.
3. Complete the Gas Leak & Confined Space practical drill.
4. The assessment unlocks only after both drill records exist.
5. Pass at 75% or higher.
6. Generate a QR-enabled offline competency record.
7. Verify the record from the dashboard on the same offline device.

## Research-backed design decisions

- The [Mines Act, 1952](https://www.indiacode.nic.in/bitstream/123456789/21434/1/mines-act-1952.pdf) allows rules requiring practical instruction and training for people employed or seeking employment in mines. It also provides for notices in prescribed languages.
- The [Factories Act, 1948](https://labour.gov.in/sites/default/files/factories_act_1948.pdf) requires fire precautions, safe escape routes, firefighting facilities, worker familiarity with escape, and routine training.
- [DGMS safety legislation](https://dgms.gov.in/UserView/index?mid=1654) includes the Coal Mines Regulations, Mines Vocational Training Rules and Mine Rescue Rules. Training content must be reviewed against the exact operating site, current rules and authorised trainer guidance before deployment.

## Productionisation boundary

Before any deployment outside a student demonstration, add a secure backend, assessor identity/authentication, server-side digital signatures, managed data retention, explicit consent, site-specific training content, regulatory review, and device/field testing. The app's QR verification is intentionally labelled as an offline training record until those controls exist.
