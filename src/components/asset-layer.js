import React, { Fragment, useEffect, useState } from "react";
import { MarkerClusterer, useGoogleMap } from "@react-google-maps/api";
import AssetMarker from "./asset-marker";
import { useQuery, useRoundware } from "../hooks";
import { OverlappingMarkerSpiderfier } from "ts-overlapping-marker-spiderfier";

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
  const { roundware, filteredAssets, assetPage, selectedAsset, selectAsset, assetsReady } = useRoundware();
  const map = useGoogleMap();
  const query = useQuery();

  if (!map) {
    return null;
  }

  const assets = assetPage || filteredAssets || [];
  const eid = parseInt(query.get("eid"))

  useEffect(() => {
    if (!assetsReady) {
      return
    }
    const asset = assets.find(a => a.envelope_ids.indexOf(eid) !== -1)
    if (!asset) {
      // todo  present an error and clear bad query params when we can't find the asset we're looking for
      return;
    }
    selectAsset(asset)
  }, [assetsReady, assets.length, eid]);

  // when the selected asset changes, pan to it
  useEffect(() => {
    if (!selectedAsset) {
      return;
    }
    // const bounds = new google.maps.LatLngBounds();
    // bounds.extend({
    //   lat: selectedAsset.latitude,
    //   lng: selectedAsset.longitude,
    // });
    // map.fitBounds(bounds, { top: 100, bottom: 40, right: 30, left: 30 });
    // map.setZoom(8);
    const center = { lat: selectedAsset.latitude,
                     lng: selectedAsset.longitude }
    map.panTo(center);
    roundware.updateLocation({latitude: selectedAsset.latitude, longitude: selectedAsset.longitude})
    console.log(selectedAsset);
  }, [selectedAsset]);

  return (
    <React.Fragment>
      <MarkerClusterer
        averageCenter={true}
        maxZoom={12}
        minimumClusterSize={3}
        options={{
          imagePath:
            "https://github.com/googlemaps/v3-utility-library/raw/master/packages/markerclustererplus/images/m",
        }}
      >
        {(clusterer) => (
          <OverlappingMarkerSpiderfierComponent>
            {(oms) =>
              assets.map((asset) => (
                <AssetMarker
                  key={asset.id}
                  asset={asset}
                  clusterer={clusterer}
                  oms={oms}
                />
              ))
            }
          </OverlappingMarkerSpiderfierComponent>
        )}
      </MarkerClusterer>
    </React.Fragment>
  );
};

export default AssetLayer;
