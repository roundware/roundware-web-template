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
  const eid = parseInt(query.get("eid"))
  const [markerClusterer, setMarkerClusterer] = useState(null);

  useEffect(() => {
    if (!eid) {
      return;
    }
    const asset = assets.find(a => a.envelope_ids.indexOf(eid) !== -1)
    if (!asset) {
      // todo  present an error and clear bad query params when we can't find the asset we're looking for
      return;
    }
    selectAsset(asset)
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

  useEffect(() => {
    if (markerClusterer) {
      const markerObjs = markerClusterer.markers.slice()
      markerClusterer.clearMarkers()
      markerClusterer.repaint()
      markerClusterer.addMarkers(markerObjs)
    }
  }, [markerClusterer, assetPage])
  return (
    <MarkerClusterer
      maxZoom={12}
      minimumClusterSize={3}
      onLoad={(c) => setMarkerClusterer(c)}
      options={{
        imagePath:
          "https://github.com/googlemaps/v3-utility-library/raw/master/packages/markerclustererplus/images/m",
      }}
      children={markers}
    />
  );
}

export default AssetLayer;
