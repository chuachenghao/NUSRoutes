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
        "expo-location",
        {
          locationWhenInUsePermission:
            "NUSRoutes uses your location to help you navigate on campus. ",
        },
      ],
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
