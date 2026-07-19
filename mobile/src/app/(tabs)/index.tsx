import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import NusMap from "../../components/NusMap";
import RouteSearchPanel from "../../components/RouteSearchPanel";
import RouteSummaryCard from "../../components/RouteSummaryCard";
import ReportForm from "../../components/ReportForm";
import ReportCard from "../../components/ReportCard";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import { useReports } from "../../hooks/useReports";
import { usePlaces } from "../../hooks/usePlaces";
import { useRouteSearch } from "../../hooks/useRouteSearch";
import { useCurrentLocation } from "../../hooks/useCurrentLocation";
import { findNearestPlace } from "../../utils/geo";
import type { Report } from "../../types/report";

export default function HomeScreen() {
  const { places, placesMessage } = usePlaces();
  const { announcements } = useAnnouncements();
  const { reports, submitReport, vote, remove } = useReports();

  const { coords, loadingLocation, requestLocation } = useCurrentLocation();

  // where a new report should go, and which report is tapped open
  const [formCoords, setFormCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const {
    startPlace,
    endPlace,
    setStartPlace,
    setEndPlace,
    route,
    routeMode,
    loadingRoute,
    routeMessage,
    findRoute,
    changeRouteMode,
    runJourney,
    clearRoute,
  } = useRouteSearch();

  // if we came from the Saved tab it sends start + end as params, so just run it.
  // ts is a per-tap nonce so tapping the same journey again still re-runs it
  const { start, end, ts } = useLocalSearchParams<{ start?: string; end?: string; ts?: string }>();
  useEffect(() => {
    if (start && end) {
      runJourney(start, end);
    }
  }, [start, end, ts]);

  // keep the open report card in sync with the latest data (counts etc.)
  useEffect(() => {
    if (!selectedReport) return;
    const latest = reports.find((r) => r.id === selectedReport.id);
    setSelectedReport(latest ?? null);
  }, [reports]);

  async function handleUseMyLocation() {
    const here = await requestLocation();
    if (!here) return;

    const nearest = findNearestPlace(here, places);
    if (nearest) {
      setStartPlace(nearest.name);
    }
  }

  // "Report here" button - drop a report at my current location
  async function handleReportHere() {
    const here = await requestLocation();
    if (!here) return;
    setFormCoords(here);
  }

  return (
    <View style={styles.screen}>
      <NusMap
        route={route}
        announcements={announcements}
        reports={reports}
        onReportPress={setSelectedReport}
        onLongPress={setFormCoords}
        userCoords={coords}
        routeMode={routeMode}
      />

      <View style={styles.topPanel}>
        {route ? (
          <Pressable style={styles.backButton} onPress={clearRoute}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : (
          <RouteSearchPanel
            places={places}
            startPlace={startPlace}
            endPlace={endPlace}
            onStartPlaceChange={setStartPlace}
            onEndPlaceChange={setEndPlace}
            onFindRoute={findRoute}
            routeMode={routeMode}
            onRouteModeChange={changeRouteMode}
            loading={loadingRoute}
            onUseMyLocation={handleUseMyLocation}
            locating={loadingLocation}
          />
        )}
      </View>

      {/* floating report button */}
      <Pressable style={styles.reportButton} onPress={handleReportHere}>
        <Text style={styles.reportButtonText}>⚠️ Report</Text>
      </Pressable>

      <View style={styles.bottomPanel}>
        {selectedReport ? (
          <ReportCard
            report={selectedReport}
            onUpvote={() => vote(selectedReport.id, "upvote")}
            onFlag={() => vote(selectedReport.id, "irrelevant")}
            onDelete={async () => {
              await remove(selectedReport.id);
              setSelectedReport(null);
            }}
            onClose={() => setSelectedReport(null)}
          />
        ) : (
          <RouteSummaryCard route={route} message={routeMessage || placesMessage} />
        )}
      </View>

      <ReportForm
        coords={formCoords}
        onClose={() => setFormCoords(null)}
        onSubmit={async (input) => {
          await submitReport(input);
          setFormCoords(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  topPanel: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 6,
  },
  backButtonText: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "700",
  },
  reportButton: {
    position: "absolute",
    right: 16,
    bottom: 210,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 8,
    zIndex: 15,
  },
  reportButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#b45309",
  },
  bottomPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 32,
    zIndex: 10,
  },
});
