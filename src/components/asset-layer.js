import React, {Fragment, useEffect, useRef, useState} from "react";
import { MarkerClusterer, useGoogleMap } from "@react-google-maps/api";
import AssetMarker from "./asset-marker";
import { useQuery, useRoundware } from "../hooks";
import { OverlappingMarkerSpiderfier } from "ts-overlapping-marker-spiderfier";
import {wait} from "../utils";

const OverlappingMarkerSpiderfierComponent = (props) => {
  const map = useGoogleMap();
  const [spiderfier, set_spiderfier] = useState(null);
  if (!map) {
    return null;
  }
  if (!spiderfier) {
    const oms_obj = new OverlappingMarkerSpiderfier(map, {
      markersWontMove: true,
      markersWontHide: true,
      basicFormatEvents: true,
    });
    set_spiderfier(oms_obj);
  }

  return <Fragment>{props.children(spiderfier)}</Fragment>;
};



const AssetLayer = (props) => {
  const { roundware, assetPage, selectedAsset, selectAsset, assetsReady } = useRoundware();
  const map = useGoogleMap();
  const query = useQuery();
  const assets = assetPage;
  const eid = parseInt(query.get("eid"));
  const [lastSelected, setLastSelected] = useState(null);
  const [markerClusterer, setMarkerClusterer] = useState(null);

  useEffect(() => {
    if (!eid || lastSelected === eid) {
      return;
    }
    const asset = assets.find((a) => a.envelope_ids.indexOf(eid) !== -1);
    if (!asset) {
      // todo  present an error and clear bad query params when we can't find the asset we're looking for
      return;
    }
    selectAsset(asset);
    // On further asset pool updates, prevent the map from panning unprompted to
    // the selected asset.
    setLastSelected(eid);
  }, [assetPage, eid]);

  // when the selected asset changes, pan to it
  useEffect(() => {
    if (!selectedAsset) {
      return;
    }
    const center = { lat: selectedAsset.latitude,
                     lng: selectedAsset.longitude }
    map.panTo(center);
    roundware.updateLocation({latitude: selectedAsset.latitude, longitude: selectedAsset.longitude})
    console.log(selectedAsset);
  }, [selectedAsset]);
  if (!map) {
    return null;
  }
  const markers = (clusterer) => {
    return <OverlappingMarkerSpiderfierComponent
      children={(oms) =>
        assets.map( asset => (
          <AssetMarker
            key={asset.id}
            asset={asset}
            clusterer={clusterer}
            oms={oms}
          />
        ))}
    />
  }
  const recluster = () => {
    const markerObjs = markerClusterer.markers.slice()
    markerClusterer.clearMarkers()
    markerClusterer.repaint()
    markerClusterer.addMarkers(markerObjs)
  }
  const wait_for_full_page = async () => {
    return new Promise((resolve, reject) => {
      const checkStart = Date.now();
      const checkLength = () => {
        if (assetPage.length >= markerClusterer.markers.length) {
          resolve();
        } else if (Date.now() > checkStart + 3000) {
          reject("asset page contains a different number of entries than the marker clusterer")
        } else {
          setTimeout(checkLength, 100)
        }
      };
      checkLength();
    });
  }
  useEffect(() => {
    if (!(markerClusterer && markerClusterer.ready)) return;
    wait_for_full_page().then(recluster);
  }, [markerClusterer && markerClusterer.ready, assetPage])
  return (
    <MarkerClusterer
      maxZoom={12}
      minimumClusterSize={3}
      onLoad={setMarkerClusterer}
      options={{
        imagePath:
          "https://github.com/googlemaps/v3-utility-library/raw/master/packages/markerclustererplus/images/m",
      }}
      children={markers}
    />
  );
}

export default AssetLayer;
