import React, {useEffect, useState} from "react";
import {InfoWindow, Marker, useGoogleMap} from "@react-google-maps/api";
import moment from "moment";
import AssetPlayer from "./asset-player";
import {useRoundware} from "../hooks";
import {AssetActionButtons} from "./asset-action-buttons";
import {TagsDisplay} from "./asset-tags";

const AssetInfoWindow = ({asset}) => {
  const {roundware, selectedAsset, selectAsset} = useRoundware();
  const map = useGoogleMap();

  if (!selectedAsset) return null;
  if (selectedAsset.id !== asset.id) {
    return null;
  }

  const position = {lat: asset.latitude, lng: asset.longitude}
  return (
    <InfoWindow
      options={{
        disableAutoPan: false,
        pixelOffset: new google.maps.Size(0,-30)
      }}
      position={position}
      onCloseClick={() => selectAsset(null)}
    >
      <div className="asset-info-window">
        <div className='created'>{moment(asset.created).format('LLL')}</div>
        <TagsDisplay tagIds={asset.tag_ids} />
        <AssetPlayer className="fullwidth" asset={asset}/>
        <AssetActionButtons asset={asset} />
      </div>
    </InfoWindow>
  )
}

const AssetMarker = ({asset, clusterer, oms}) => {
  const { selectAsset } = useRoundware();

  return (
    <Marker
      position={{lat: asset.latitude, lng: asset.longitude}}
      clusterer={clusterer}
      onLoad={m => oms.addMarker(m, () => selectAsset(asset))}
    >
      <AssetInfoWindow asset={asset}/>
    </Marker>
  );
}

export default AssetMarker;
