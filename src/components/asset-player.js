import React from "react";

class AssetPlayer extends React.Component {
  render() {
    const { asset } = this.props;
    if (!asset) {
      return null;
    }
    return (
      <audio
        controls
        style={this.props.style}
        preload="none"
        controlsList="nodownload"
        className={this.props.className}
      >
        <source src={asset.file.concat(".mp3")} type="audio/mp3" />
        <source src={asset.file.concat(".wav")} type="audio/wav" />
        Your browser does not support audio!
      </audio>
    );
  }
}

export default AssetPlayer;
