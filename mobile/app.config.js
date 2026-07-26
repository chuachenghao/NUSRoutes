module.exports = {
  expo: {
    name: "mobile",
    slug: "mobile",
    owner: "nusroutesorbis-team",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.mobile",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "NUSRoutes uses your location to help you navigate on campus.",
      },
    },
    plugins: [
      [
        // let the release APK talk to the backend over plain http (LAN testing)
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "NUSRoutes uses your location to help you navigate on campus. ",
        },
      ],
      // needed for the share sheet when exporting saved data as csv
      "expo-sharing",
    ],
    android: {
      package: "com.anonymous.mobile",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      config: {
        googleMaps: {
          // key comes from .env locally / EAS secret on the build server
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    extra: {
      eas: {
        projectId: "55c8d83b-1c6b-4b3f-90ec-b0921b160f81",
      },
    },
  },
};
