import React, {Fragment, useEffect, useState} from "react";
import {MarkerClusterer, useGoogleMap} from "@react-google-maps/api";
import AssetMarker from "./asset-marker";
import {useRoundware} from "../hooks";
import {OverlappingMarkerSpiderfier} from "ts-overlapping-marker-spiderfier";

const OverlappingMarkerSpiderfierComponent = props => {
  const map = useGoogleMap();
  const [spiderfier, set_spiderfire] = useState(null);
  if (!map) {
    return null
  }
  if (!spiderfier) {
    const oms_obj = new OverlappingMarkerSpiderfier(
      map,
      {markersWontMove: true, markersWontHide: true, basicFormatEvents: true}
      );
    set_spiderfire(oms_obj);
  }

  return <Fragment>{props.children(spiderfier)}</Fragment>;
}

const AssetLayer = props => {
  const { filteredAssets, assetPage, selectedAsset } = useRoundware();
  const map  = useGoogleMap();

  if (!map){
    return null;
  }

  const assets = assetPage || filteredAssets || [];
  // when the list of assets changes, pan to new assets
  useEffect(() => {
    const bounds = new google.maps.LatLngBounds();
    assets.forEach(asset => {bounds.extend({lat: asset.latitude, lng: asset.longitude})});
    map.fitBounds(bounds, {top: 40, bottom: 40, right: 30, left: 0})
  }, [assets]);

  // when the selected asset changes, pan to it
  useEffect(() => {
    if (!selectedAsset) {
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({lat: selectedAsset.latitude, lng: selectedAsset.longitude});
    map.fitBounds(bounds, {top: 100, bottom: 40, right: 30, left: 30});
    map.setZoom(13);

  }, [selectedAsset]);

  return <React.Fragment>
      <MarkerClusterer
        averageCenter={true}
        maxZoom={12}
        minimumClusterSize={3}
        options={{
          imagePath: "https://github.com/googlemaps/v3-utility-library/raw/master/packages/markerclustererplus/images/m"
        }}>
        { clusterer => (
          <OverlappingMarkerSpiderfierComponent>
            { oms => (
              assets.map(asset =>
                <AssetMarker
                  key={asset.id}
                  asset={asset}
                  clusterer={clusterer}
                  oms={oms}
                />))
            }
          </OverlappingMarkerSpiderfierComponent>
        )}
      </MarkerClusterer>
  </React.Fragment>
}

export default AssetLayer;

