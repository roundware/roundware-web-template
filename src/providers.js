import {RoundwareContext, DraftRecordingContext} from "./context";
import React, {useEffect, useReducer, useState} from "react";
import { Roundware } from "roundware-web-framework";
import { useDeviceID } from "./hooks";

export const DraftRecordingProvider = ({roundware, children}) => {

  const [state, setState] = useState({
      acceptedAgreement: false,
      tags: [],
      location: {
        latitude: null,
        longitude: null
      }
  });

  useEffect(() => {
    if (!roundware._project || !roundware._project.location) {
      return
    }
    if (state.location.latitude === null || state.location.longitude === null) {
      setState({...state, location: roundware._project.location});
    }
  }, [roundware._project && roundware._project.location]);

  const selectTag = (tag, deselect) => {
    const newTags = [...state.tags];
    if (!deselect) {
      newTags.push(tag);
    } else {
      const tagPosition = newTags.indexOf(tag);
      if (tagPosition !== -1) {
        newTags.splice(tagPosition, 1);
      }
    }
    setState({ ...state, tags: [...newTags] });
  };

  const clearTags = (tags) => {
    const newTags = [...state.tags]
    tags.forEach((tag) => {
      const tagPosition = newTags.indexOf(tag);
      if (tagPosition !== -1) {
        newTags.splice(tagPosition, 1);
      }
    });

    setState({...state, tags: [...newTags] });
  };
  return <DraftRecordingContext.Provider value={{
    ...state,
    setState,
    selectTag,
    clearTags
  }}>
    {children}
  </DraftRecordingContext.Provider>
}

export const RoundwareProvider = (props) => {
  const [roundware, setRoundware] = useState(
    {uiConfig: {}}
  );

  const [beforeDateFilter, setBeforeDateFilter] = useState(null);
  const [afterDateFilter, setAfterDateFilter] = useState(null);
  const [userFilter, setUserFilter] = useState("");
  const [selectedAsset, selectAsset] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortField, setSortField] = useState({name: "created", asc: false })
  const [assetPageIndex, setAssetPageIndex] = useState(0);
  const [assetsPerPage, setAssetsPerPage] = useState(10);
  const [tagLookup, setTagLookup] = useState({})
  const [filteredAssets, setFilteredAssets] = useState([]);
  const deviceId = useDeviceID();

  const [, forceUpdate] = useReducer(x => !x, false);


  const sortAssets = (assets) => {
    const sort_value = sortField.asc ? 1 : -1;

    const sortEntries = (a, b) => {
      if (a[sortField.name] > b[sortField.name]) {
        return sort_value;
      }
      if (a[sortField.name] < b[sortField.name]) {
        return !sort_value;
      }
      return 0;
    };
    const sortedAssets = [...assets];
    sortedAssets.sort(sortEntries);
    return sortedAssets;
  };

  const assetPage = () => {
    const sortedAssets = sortAssets(filteredAssets);
    if (sortedAssets.length < assetPageIndex * assetsPerPage) {
      setAssetPageIndex( 0 );
      return [];
    }
    return sortedAssets.slice(
      assetPageIndex * assetsPerPage,
      assetPageIndex * assetsPerPage + assetsPerPage
    );
  };
  useEffect(() => {
    if (!roundware.uiConfig.speak) {
      return;
    }
    const tag_lookup = {};
    roundware.uiConfig.speak.forEach((group) =>
      group.display_items.forEach((tag) => {
        tag_lookup[tag.id] = tag;
      })
    );
    setTagLookup( tag_lookup );
  }, [roundware.uiConfig && roundware.uiConfig.speak]);

  const filterAssets = (tagFilters) => {
    const asset_data = roundware._assetData || [];
    return asset_data.filter((asset) => {
      // show the asset, unless a filter returns 'false'
      const matches = [true];
      const tag_filter_groups = Object.entries(tagFilters || {});
      matches.push(
        ...tag_filter_groups.map(([_filter_group, tags]) => {
          if (!tags) {
            return true;
          } else {
            return tags.some((tag_id) => asset.tag_ids.indexOf(tag_id) !== -1);
          }
        })
      );
      if (userFilter.length) {
        let user_str = "anonymous";
        if (asset.user) {
          user_str = asset.user && `${asset.user.username} ${asset.user.email}`;
        }
        const user_match = user_str.indexOf(userFilter) !== -1;
        matches.push(user_match);
      }

      return matches.every((m) => m);
    });
  };

  const selectTags = (tags, group) => {
    const group_key = group.group_short_name;
    const newFilters = { ...selectedTags };
    if (tags === null && newFilters[group_key]) {
      delete newFilters[group_key];
    } else {
      newFilters[group_key] = tags;
    }
    setSelectedTags(newFilters);
  };

  useEffect(() => {
    if (roundware._assetData !== undefined) {
      setFilteredAssets(filterAssets());
    }
  }, [selectedTags, userFilter, roundware._assetData]);

  // when this provider is loaded, initialize roundware via api
  useEffect(() => {
    const project_id = process.env.ROUNDWARE_DEFAULT_PROJECT_ID;
    const server_url = process.env.ROUNDWARE_SERVER_URL;
    const initial_loc = {
      latitude: process.env.INITIAL_LATITUDE,
      longitude: process.env.INITIAL_LONGITUDE,
    };

    const roundware = new Roundware(window, {
      deviceId: deviceId,
      serverUrl: server_url,
      projectId: project_id,
      geoListenEnabled: false,
      speakerFilters: { activeyn: true },
      assetFilters: { submitted: true, media_type: "audio" },
      listenerLocation: initial_loc,
    });

    roundware.connect().then(() => {
      setRoundware(roundware);
    })
  }, []);

  useEffect(()=>{
    if (roundware._project) {
      roundware.loadAssetPool().then(() => {
        forceUpdate()
      })
    }
  }, [roundware._project])

  return (
    <RoundwareContext.Provider
      value={{
        roundware,
        // everything from the state
        tagLookup,
        sortField,
        selectedTags,
        selectedAsset,
        beforeDateFilter,
        afterDateFilter,
        assetPageIndex,
        assetsPerPage,
        // state modification functions
        selectAsset,
        selectTags,
        setUserFilter,
        setAssetPageIndex,
        setAssetsPerPage,
        setSortField,
        // computed properties
        assetPage: assetPage(),
      }}
    >
      {props.children}
    </RoundwareContext.Provider>
  );
};
