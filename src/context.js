import React from "react";

// this is the equivalent to the createStore method of Redux
// https://redux.js.org/api/createstore

const RoundwareContext = React.createContext({ roundware: null });
const DraftRecordingContext = React.createContext({ });

export {RoundwareContext, DraftRecordingContext};
