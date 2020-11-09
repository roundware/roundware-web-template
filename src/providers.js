import RoundwareContext from "./context";
import React, { useContext, useEffect, useState } from "react";
import { Roundware } from "roundware-web-framework";
import { useDeviceID } from "./hooks";

export const RoundwareProvider = (props) => {
  const [state, setState] = useState({
    roundware: null,
    uiConfig: null,
    selectedAsset: null,
    roundwareReady: false,
    selectedTags: [],
    // todo refactor this filtering stuff into something more scalable
    tagFilters: {},
    filteredAssets: [],
    userFilter: [],
    afterDateFilter: null,
    beforeDateFilter: null,
    // sorting
    sortField: { name: "created", asc: false },
    // pagination by default
    assetPageIndex: 0,
    assetsPerPage: 10,
    //
    draftRecording: {
      doneTagging: false,
      tags: [],
    },
  });
  const setSortField = (f) => {
    setState({ ...state, sortField: f });
  };
  const sortAssets = (assets) => {
    const { sortField } = state;
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
    const { assetPageIndex, assetsPerPage } = state;
    const sortedAssets = sortAssets(state.filteredAssets);
    if (sortedAssets.length < assetPageIndex * assetsPerPage) {
      setState({ ...state, assetPageIndex: 0 });
      return [];
    }
    return sortedAssets.slice(
      assetPageIndex * assetsPerPage,
      assetPageIndex * assetsPerPage + assetsPerPage
    );
  };

  const setAssetsPerPage = (n) => {
    setState({ ...state, assetsPerPage: n });
  };
  const setAssetPageIndex = (idx) => {
    setState({ ...state, assetPageIndex: idx });
  };
  const selectAsset = (asset) => {
    setState({ ...state, selectedAsset: asset });
  };
  const filterAssets = (tagFilters) => {
    const asset_data = state.roundware._assetData || [];
    const tag_filters = tagFilters || state.tagFilters;
    return asset_data.filter((asset) => {
      // show the asset, unless a filter returns 'false'
      const matches = [true];

      const tag_filter_groups = Object.entries(tag_filters);
      matches.push(
        ...tag_filter_groups.map(([filter_group, tags]) => {
          if (!tags) {
            return true;
          } else {
            return tags.some((tag_id) => asset.tag_ids.indexOf(tag_id) !== -1);
          }
        })
      );
      if (state.userFilter.length) {
        let user_str = "";

        if (!asset.user) {
          user_str = "anonymous";
        } else {
          user_str = asset.user && `${asset.user.username} ${asset.user.email}`;
        }
        const user_match = user_str.indexOf(state.userFilter) !== -1;
        matches.push(user_match);
      }

      return matches.every((m) => m);
    });
  };
  const selectRecordingTag = (tag, deselect) => {
    const updatedDraft = { ...state.draftRecording };

    if (!deselect) {
      updatedDraft.tags.push(tag);
    } else {
      const tagPosition = updatedDraft.tags.indexOf(tag);
      updatedDraft.tags.splice(tagPosition, 1);
    }
    setState({ ...state, draftRecording: updatedDraft });
  };
  const clearRecordingTags = (tags) => {
    const updatedDraft = { ...state.draftRecording };

    tags.forEach((tag) => {
      const tagPosition = updatedDraft.tags.indexOf(tag);
      updatedDraft.tags.splice(tagPosition, 1);
    });

    setState({ ...state, draftRecording: updatedDraft });
  };

  const setUserFilter = (user_str) => {
    setState({ ...state, userFilter: user_str });
  };
  const selectTags = (tags, group) => {
    const group_key = group.group_short_name;
    setState((state) => {
      const newFilters = { ...state.tagFilters };
      if (tags === null && newFilters[group_key]) {
        delete newFilters[group_key];
      } else {
        newFilters[group_key] = tags;
      }
      return {
        ...state,
        tagFilters: newFilters,
      };
    });
  };
  const deviceId = useDeviceID();
  useEffect(() => {
    if (state.roundware !== null) {
      setState({ ...state, filteredAssets: filterAssets() });
    }
  }, [state.tagFilters, state.userFilter]);

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
    roundware.connect().then(({ uiConfig }) => {
      setState({ ...state, uiConfig: uiConfig });
      setState({ ...state, roundware: roundware });
      roundware.loadAssetPool().then(() => {
        setState({
          ...state,
          roundware: roundware,
          filteredAssets: roundware._assetData,
        });
      });
    });
    setState({ ...state, roundware: roundware });
  }, []);

  const setTaggingDone = (done) => {
      const updatedDraft = { ...state.draftRecording };
      updatedDraft.doneTagging = done;
      setState({ ...state, draftRecording: updatedDraft });
  }

  return (
    <RoundwareContext.Provider
      value={{
        // everything from the state
        ...state,
        // state modification functions
        selectAsset: selectAsset,
        selectTags: selectTags,
        setUserFilter: setUserFilter,
        setAssetPageIndex: setAssetPageIndex,
        setAssetsPerPage: setAssetsPerPage,
        setSortField: setSortField,
        //
        selectRecordingTag,
        clearRecordingTags,
        setTaggingDone,
        // computed properties
        assetPage: assetPage(),
      }}
    >
      {props.children}
    </RoundwareContext.Provider>
  );
};
